import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildAIContext } from "@/lib/ai/build-context";

export const maxDuration = 30;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const DEBUGGER_SYSTEM_PROMPT = `You are Debugger Py, a specialized AI coding mentor. Your ONLY goal is to help students understand and fix Python errors.

YOUR CORE RULES:
1. SOCRATIC METHOD: Never give the corrected code. Instead, explain the error concept and ask a question that leads them to the solution.
2. ANALYTICAL BUT KIND: Beginners feel frustrated by errors. Be patient and encouraging.
3. CONTEXT AWARE: If project/lesson context is provided, reference it directly (e.g., "In your 'Calculator' project...").
4. STRUCTURED RESPONSE:
   - **Concept**: Explain the python concept behind the error (e.g. "What is a NameError?").
   - **Documentation**: Reference standard Python docs or general programming concepts relevant here.
   - **Example**: Provide a SIMPLE, isolated example of this error and how to fix it (NOT using the user's exact variable names).
   - **Hint**: Give a specific clue about where the error is in their code (e.g. "Look at line 5").
   - **Question**: End with a guiding question.`;

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "unauthorized" }, { status: 401 });
        }

        const { code, error, lessonId, projectContext, lessonContext } = await req.json();

        if (!code || !error) {
            return NextResponse.json({ error: "missing_fields" }, { status: 400 });
        }

        // Check rate limit (Mirroring Chat API logic)
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
                { error: "rate_limit", message: "Daily message limit reached." },
                { status: 429 }
            );
        }

        // Build context for personalization
        const context = await buildAIContext(supabase, user.id, lessonId);

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: DEBUGGER_SYSTEM_PROMPT,
            generationConfig: {
                maxOutputTokens: 1024,
                temperature: 0.5,
            },
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

        const prompt = `
<user_context>
Student: ${context.user.name}
Level: ${context.user.skill_level}
</user_context>

${projectContext ? `<project_context>
Title: ${projectContext.title}
escription: ${projectContext.description}
Current Step: ${projectContext.stepInstruction}
</project_context>` : ''}

${lessonContext ? `<lesson_context>
Lesson: ${lessonContext.title}
Key Concepts: ${lessonContext.contentSummary}
</lesson_context>` : ''}

<error_context>
PYTHON CODE:
${code}

TRACEBACK/ERROR:
${error}
</error_context>

Explain this error to the student using your Socratic rules. Focus on help, not answers.`;

        const result = await model.generateContentStream(prompt);

        const readableStream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of result.stream) {
                        const text = chunk.text();
                        if (text) {
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
                            );
                        }
                    }
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
                    );
                    controller.close();
                } catch (err) {
                    controller.error(err);
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
    } catch (err) {
        console.error("Debugger API error:", err);
        return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
}
