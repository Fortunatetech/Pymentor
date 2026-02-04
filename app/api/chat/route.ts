import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildAIContext } from "@/lib/ai/build-context";
import type { AIContext } from "@/types";

export const maxDuration = 60;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Py, a friendly and patient AI Python tutor. Your goal is to help beginners learn Python programming through encouragement, simple explanations, and guided practice.

YOUR PERSONALITY:
- Warm, encouraging, and never condescending
- Slightly nerdy with occasional programming puns
- Celebrates every win, no matter how small
- Patient - willing to explain things multiple ways
- Humble - admits when something is genuinely tricky

YOUR TEACHING APPROACH:
1. Socratic Method: Ask guiding questions before giving answers
2. Simple Analogies: Explain concepts using everyday examples
3. Progressive Hints: Give hints before full solutions
4. Hands-On: Always encourage trying code
5. Memory: Reference what the user has already learned

RESPONSE FORMAT:
- Keep responses concise (under 200 words unless explaining complex code)
- Use code blocks with \`\`\`python for all code examples
- Use emojis sparingly but warmly (1-2 per response max)
- End with a question or action item when appropriate

WHAT YOU NEVER DO:
- Give complete solutions without teaching
- Use jargon without explaining it
- Make the user feel stupid
- Say "as an AI" or break character
- Write overly long responses

ADAPTIVE BEHAVIOR:
- If the student has 3+ wrong attempts on something, give simpler explanations with smaller steps
- If they're breezing through, offer to skip ahead or provide extra challenges
- If they seem frustrated, acknowledge the difficulty and try a different analogy
- If they're returning after 3+ days, welcome them back and do a quick recap`;

function buildContextPrompt(context: AIContext): string {
  let prompt = `
<user_context>
Student: ${context.user.name}
Level: ${context.user.skill_level}`;

  if (context.user.learning_goal) {
    prompt += `\nLearning Goal: ${context.user.learning_goal}`;
  }
  if (context.current_lesson) {
    prompt += `\nCurrent Lesson: ${context.current_lesson.title}`;
    if (context.current_lesson.concepts.length > 0) {
      prompt += `\nLesson Concepts: ${context.current_lesson.concepts.join(", ")}`;
    }
  }
  if (context.mastered_concepts.length > 0) {
    prompt += `\nMastered Concepts: ${context.mastered_concepts.join(", ")}`;
  }
  if (context.struggling_concepts.length > 0) {
    prompt += `\nStruggling With: ${context.struggling_concepts.join(", ")}`;
  }
  if (context.user.streak_count > 0) {
    prompt += `\nStreak: ${context.user.streak_count} days`;
  }

  prompt += `
</user_context>

Use this context to personalize your responses. Reference concepts they've mastered when explaining new ones. Be extra patient with concepts they're struggling with.`;

  return prompt;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    // Check rate limit
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .single();

    const isPro =
      subscription &&
      (subscription.plan === "pro_monthly" ||
        subscription.plan === "pro_annual" ||
        subscription.plan === "lifetime") &&
      (subscription.status === "active" || subscription.status === "trialing");

    const dailyLimit = isPro ? 500 : 10;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Get user's session IDs first
    const { data: userSessions } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("user_id", user.id);

    const sessionIds = userSessions?.map((s) => s.id) || [];

    let messageCount = 0;
    if (sessionIds.length > 0) {
      const { count } = await supabase
        .from("chat_messages")
        .select("id", { count: "exact", head: true })
        .eq("role", "user")
        .gte("created_at", todayStart.toISOString())
        .in("session_id", sessionIds);
      messageCount = count ?? 0;
    }

    if (messageCount >= dailyLimit) {
      return NextResponse.json(
        {
          error: "rate_limit",
          message: isPro
            ? "You've reached your daily limit of 500 messages"
            : "Free plan is limited to 10 messages per day. Upgrade to Pro for more!",
          limit: dailyLimit,
          used: messageCount,
        },
        { status: 429 }
      );
    }

    const { message, session_id, lesson_id } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "bad_request", message: "Message is required" },
        { status: 400 }
      );
    }

    // Session management: use existing or create new
    let sessionId = session_id;
    if (!sessionId) {
      const { data: newSession, error: sessionError } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: user.id,
          lesson_id: lesson_id || null,
          title: message.slice(0, 60),
          message_count: 0,
        })
        .select("id")
        .single();

      if (sessionError) {
        return NextResponse.json(
          { error: "server_error", message: "Failed to create chat session" },
          { status: 500 }
        );
      }
      sessionId = newSession.id;
    }

    // Load history from DB
    const { data: dbHistory } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(10);

    // Build real context
    const context = await buildAIContext(supabase, user.id, lesson_id || undefined);
    const fullSystemPrompt = SYSTEM_PROMPT + buildContextPrompt(context);

    // Build messages array
    const messages: Anthropic.MessageParam[] = [];
    if (dbHistory) {
      for (const msg of dbHistory) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
    messages.push({ role: "user", content: message });

    // Save user message to DB
    await supabase.from("chat_messages").insert({
      session_id: sessionId,
      role: "user",
      content: message,
    });

    // Stream response
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: fullSystemPrompt,
      messages,
    });

    let fullResponse = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Send session_id as the first event
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "session_id", session_id: sessionId })}\n\n`)
        );

        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const text = event.delta.text;
              fullResponse += text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "text", text })}\n\n`)
              );
            }
          }

          // Save assistant message to DB
          await supabase.from("chat_messages").insert({
            session_id: sessionId,
            role: "assistant",
            content: fullResponse,
          });

          // Update session
          await supabase
            .from("chat_sessions")
            .update({
              message_count: (dbHistory?.length || 0) + 2,
              updated_at: new Date().toISOString(),
            })
            .eq("id", sessionId);

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
          );
          controller.close();
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", message: "Stream interrupted" })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Failed to generate response" },
      { status: 500 }
    );
  }
}
