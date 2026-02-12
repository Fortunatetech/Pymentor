import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildAIContext } from "@/lib/ai/build-context";
import { analyzeFrustration } from "@/lib/ai/frustration-detector";
import { buildAdaptiveSignals } from "@/lib/ai/adaptive-signals";
import { buildSystemPrompt } from "@/lib/ai/system-prompt-builder";
import { generateSessionSummary, shouldSummarize } from "@/lib/ai/session-summarizer";
import { chatMessageSchema, validateRequest } from "@/lib/validations";

export const maxDuration = 60;

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Convert chat history to Gemini format
function toGeminiHistory(
  messages: { role: string; content: string }[]
): { role: "user" | "model"; parts: { text: string }[] }[] {
  return messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));
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
      .maybeSingle();

    const isPro =
      subscription &&
      (subscription.plan === "pro_monthly" ||
        subscription.plan === "pro_annual" ||
        subscription.plan === "lifetime") &&
      (subscription.status === "active" || subscription.status === "trialing");

    const dailyLimit = isPro ? 500 : 15;

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
            : "Free plan is limited to 15 messages per day. Upgrade to Pro for more!",
          limit: dailyLimit,
          used: messageCount,
        },
        { status: 429 }
      );
    }

    const parseResult = await validateRequest(req, chatMessageSchema);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "bad_request", message: parseResult.error },
        { status: 400 }
      );
    }

    const { message, session_id, lesson_id } = parseResult.data;

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

    const history = dbHistory || [];

    // Analyze frustration from current message + history
    const frustration = analyzeFrustration(message, history);

    // Build AI context (enhanced with session summaries, XP, last_chat_at)
    const context = await buildAIContext(supabase, user.id, lesson_id || undefined);

    // Build adaptive signals (frustration, pace, returning user detection)
    const signals = await buildAdaptiveSignals(supabase, user.id, history, frustration);

    // Build dynamic system prompt
    const fullSystemPrompt = buildSystemPrompt(context, signals);

    // Save user message with frustration metadata
    await supabase.from("chat_messages").insert({
      session_id: sessionId,
      role: "user",
      content: message,
      metadata: {
        frustration_score: frustration.score,
        frustration_level: frustration.level,
        signals: frustration.signals,
      },
    });

    // ============================================
    // GEMINI STREAMING IMPLEMENTATION
    // ============================================
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: fullSystemPrompt,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
      // Safety settings for educational content
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    // Build chat with history
    const chat = model.startChat({
      history: toGeminiHistory(history),
    });

    // Stream the response
    const result = await chat.sendMessageStream(message);

    let fullResponse = "";
    const currentMessageCount = (history.length || 0) + 2;

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Send session_id as the first event
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "session_id", session_id: sessionId })}\n\n`)
        );

        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
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
              message_count: currentMessageCount,
              updated_at: new Date().toISOString(),
            })
            .eq("id", sessionId);

          // Fire-and-forget: update last_chat_at on profile
          Promise.resolve(
            supabase
              .from("profiles")
              .update({ last_chat_at: new Date().toISOString() })
              .eq("id", user.id)
          ).catch((err: unknown) => console.error("Failed to update last_chat_at:", err));

          // Fire-and-forget: generate session summary if threshold met
          if (shouldSummarize(currentMessageCount)) {
            // Re-fetch all messages for this session for the summary
            Promise.resolve(
              supabase
                .from("chat_messages")
                .select("role, content")
                .eq("session_id", sessionId)
                .order("created_at", { ascending: true })
            )
              .then(({ data: allMessages }) => {
                if (allMessages && allMessages.length > 0) {
                  generateSessionSummary(supabase, sessionId!, allMessages);
                }
              })
              .catch((err: unknown) => console.error("Failed to fetch messages for summary:", err));
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
          );
          controller.close();
        } catch (err) {
          console.error("Gemini streaming error:", err);

          // Save partial response to avoid orphaned user messages
          if (fullResponse) {
            await supabase.from("chat_messages").insert({
              session_id: sessionId,
              role: "assistant",
              content: fullResponse,
            });
          }

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
