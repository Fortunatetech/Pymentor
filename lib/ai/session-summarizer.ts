import { GoogleGenerativeAI } from "@google/generative-ai";
import { SupabaseClient } from "@supabase/supabase-js";
import type { SessionSummary } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateSessionSummary(
  supabase: SupabaseClient,
  sessionId: string,
  messages: { role: string; content: string }[]
): Promise<void> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        maxOutputTokens: 256,
        temperature: 0.2,
      },
    });

    const transcript = messages
      .map((m) => `${m.role === "user" ? "Student" : "Py"}: ${m.content}`)
      .join("\n\n");

    const prompt = `You are analyzing a Python tutoring conversation. Produce a JSON summary.

<transcript>
${transcript}
</transcript>

Respond with ONLY valid JSON (no markdown, no code fences):
{
  "summary": "2-3 sentence summary of what was discussed and any progress made",
  "concepts_discussed": ["list", "of", "python", "concepts"],
  "user_state": "progressing|stuck|exploring|reviewing"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Parse JSON, stripping potential code fences
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const summary: SessionSummary = JSON.parse(cleaned);

    // Validate shape
    if (
      typeof summary.summary !== "string" ||
      !Array.isArray(summary.concepts_discussed) ||
      !["progressing", "stuck", "exploring", "reviewing"].includes(
        summary.user_state
      )
    ) {
      console.error("Session summary has invalid shape, skipping");
      return;
    }

    await supabase
      .from("chat_sessions")
      .update({ context: { summary } })
      .eq("id", sessionId);
  } catch (err) {
    // Graceful degradation — session just won't have a summary
    console.error("Session summarization failed (non-blocking):", err);
  }
}

/**
 * Determines if a session summary should be generated based on message count.
 * Triggers at 6+ messages and every 4th message thereafter.
 */
export function shouldSummarize(messageCount: number): boolean {
  if (messageCount < 6) return false;
  return messageCount === 6 || (messageCount - 6) % 4 === 0;
}
