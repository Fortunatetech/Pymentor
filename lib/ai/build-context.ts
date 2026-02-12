import { SupabaseClient } from "@supabase/supabase-js";
import type { AIContext, SessionSummary } from "@/types";
import { buildLearningProgression } from "./learning-progression";

export async function buildAIContext(
  supabase: SupabaseClient,
  userId: string,
  lessonId?: string
): Promise<AIContext> {
  const context: AIContext = {
    user: {
      name: "Learner",
      skill_level: "beginner",
      learning_goal: null,
      streak_count: 0,
      total_xp: 0,
      total_lessons_completed: 0,
      last_chat_at: null,
    },
    mastered_concepts: [],
    struggling_concepts: [],
    recent_sessions: [],
  };

  try {
    // Fetch profile — enhanced with last_chat_at, total_xp, total_lessons_completed
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, skill_level, learning_goal, streak_days, total_xp, total_lessons_completed, last_chat_at")
      .eq("id", userId)
      .maybeSingle();

    if (profile) {
      context.user.name = profile.name || "Learner";
      context.user.skill_level = profile.skill_level || "beginner";
      context.user.learning_goal = profile.learning_goal || null;
      context.user.streak_count = profile.streak_days || 0;
      context.user.total_xp = profile.total_xp || 0;
      context.user.total_lessons_completed = profile.total_lessons_completed || 0;
      context.user.last_chat_at = profile.last_chat_at || null;
    }
  } catch (err) {
    console.error("Profile fetch failed, using defaults:", err);
  }

  try {
    // Fetch mastered concepts (mastery_level >= 70)
    const { data: mastered } = await supabase
      .from("user_progress")
      .select("concept")
      .eq("user_id", userId)
      .gte("mastery_level", 70);

    context.mastered_concepts = mastered?.map((m) => m.concept) || [];
  } catch (err) {
    console.error("Mastered concepts fetch failed:", err);
  }

  try {
    // Fetch struggling concepts (mastery_level < 40, at least attempted)
    const { data: struggling } = await supabase
      .from("user_progress")
      .select("concept")
      .eq("user_id", userId)
      .lt("mastery_level", 40)
      .gt("practice_count", 0);

    context.struggling_concepts = struggling?.map((s) => s.concept) || [];
  } catch (err) {
    console.error("Struggling concepts fetch failed:", err);
  }

  try {
    // Fetch specific lesson if lesson_id is provided, otherwise get current in-progress lesson
    let currentLesson: { lessons: unknown } | null = null;
    if (lessonId) {
      const { data: specificLesson } = await supabase
        .from("lessons")
        .select("title, concepts_taught")
        .eq("id", lessonId)
        .maybeSingle();
      if (specificLesson) {
        currentLesson = { lessons: specificLesson };
      }
    } else {
      const { data: inProgressLesson } = await supabase
        .from("user_lessons")
        .select("lesson_id, lessons(title, concepts_taught)")
        .eq("user_id", userId)
        .eq("status", "in_progress")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      currentLesson = inProgressLesson;
    }

    if (currentLesson?.lessons) {
      const lesson = currentLesson.lessons as { title: string; concepts_taught?: string[] };
      context.current_lesson = {
        title: lesson.title,
        concepts: lesson.concepts_taught || [],
      };
    }
  } catch (err) {
    console.error("Lesson fetch failed:", err);
  }

  try {
    // Fetch last 3 session summaries
    const { data: recentSessions } = await supabase
      .from("chat_sessions")
      .select("context")
      .eq("user_id", userId)
      .not("context", "is", null)
      .order("updated_at", { ascending: false })
      .limit(3);

    if (recentSessions) {
      for (const session of recentSessions) {
        const ctx = session.context as { summary?: SessionSummary } | null;
        if (ctx?.summary) {
          context.recent_sessions.push(ctx.summary);
        }
      }
      // Populate legacy field from most recent
      if (context.recent_sessions.length > 0) {
        context.recent_session_summary = context.recent_sessions[0].summary;
      }
    }
  } catch (err) {
    console.error("Recent sessions fetch failed:", err);
  }

  const progression = await buildLearningProgression(
    supabase,
    userId,
    context.mastered_concepts
  );
  if (progression) {
    context.learning_progression = progression;
  }

  return context;
}
