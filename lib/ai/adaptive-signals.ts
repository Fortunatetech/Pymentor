import { SupabaseClient } from "@supabase/supabase-js";
import type { FrustrationResult } from "./frustration-detector";
import type { SessionSummary } from "@/types";

export interface AdaptiveSignals {
  current_frustration: FrustrationResult;
  pace: "slow" | "normal" | "fast";
  wrong_attempts_per_concept: Record<string, number>;
  hours_since_last_chat: number | null;
  recent_sessions_summary: SessionSummary[];
  last_session_concepts: string[];
  last_session_state: string | null;
}

export async function buildAdaptiveSignals(
  supabase: SupabaseClient,
  userId: string,
  dbHistory: { role: string; content: string }[],
  frustration: FrustrationResult
): Promise<AdaptiveSignals> {
  const signals: AdaptiveSignals = {
    current_frustration: frustration,
    pace: "normal",
    wrong_attempts_per_concept: {},
    hours_since_last_chat: null,
    recent_sessions_summary: [],
    last_session_concepts: [],
    last_session_state: null,
  };

  try {
    // Fetch last_chat_at from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("last_chat_at")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.last_chat_at) {
      const lastChat = new Date(profile.last_chat_at);
      const now = new Date();
      signals.hours_since_last_chat =
        (now.getTime() - lastChat.getTime()) / (1000 * 60 * 60);
    }
  } catch (err) {
    console.error("Failed to fetch last_chat_at:", err);
  }

  try {
    // Fetch last 3 sessions with summaries
    const { data: recentSessions } = await supabase
      .from("chat_sessions")
      .select("context, updated_at")
      .eq("user_id", userId)
      .not("context", "is", null)
      .order("updated_at", { ascending: false })
      .limit(3);

    if (recentSessions) {
      for (const session of recentSessions) {
        const ctx = session.context as { summary?: SessionSummary } | null;
        if (ctx?.summary) {
          signals.recent_sessions_summary.push(ctx.summary);
        }
      }

      // Extract last session info
      if (signals.recent_sessions_summary.length > 0) {
        const last = signals.recent_sessions_summary[0];
        signals.last_session_concepts = last.concepts_discussed;
        signals.last_session_state = last.user_state;
      }
    }
  } catch (err) {
    console.error("Failed to fetch recent sessions:", err);
  }

  try {
    // Fetch wrong attempt counts from user_progress
    const { data: progressData } = await supabase
      .from("user_progress")
      .select("concept, practice_count, correct_count")
      .eq("user_id", userId)
      .gt("practice_count", 0);

    if (progressData) {
      for (const p of progressData) {
        const wrongAttempts = p.practice_count - (p.correct_count || 0);
        if (wrongAttempts > 0) {
          signals.wrong_attempts_per_concept[p.concept] = wrongAttempts;
        }
      }
    }
  } catch (err) {
    console.error("Failed to fetch user_progress:", err);
  }

  // Determine pace from conversation history
  const userMessages = dbHistory.filter((m) => m.role === "user");
  if (userMessages.length >= 3) {
    const avgLength =
      userMessages.reduce((sum, m) => sum + m.content.length, 0) /
      userMessages.length;
    // Short, quick responses suggest fast pace; long detailed ones suggest slow/careful
    if (avgLength < 30) signals.pace = "fast";
    else if (avgLength > 150) signals.pace = "slow";
  }

  return signals;
}
