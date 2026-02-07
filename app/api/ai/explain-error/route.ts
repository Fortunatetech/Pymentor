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
3. CLEAR EXPLANATIONS: Use simple analogies (e.g., a "NameError" is like calling for a friend who hasn't arrived at the party yet).
4. NO REVEALS: If they are missing a colon, don't say "add a colon." Say "Python looks for a specific symbol at the end of 'if' statements to know where the block starts. Do you see it?"

INPUT CONTEXT:
You will receive the student's code and the specific traceback/error message. Use this to pinpoint the exact logic gap.`;

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "unauthorized" }, { status: 401 });
        }

        const { code, error, lessonId } = await req.json();

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
