import { SupabaseClient } from "@supabase/supabase-js";
import type { AIContext } from "@/types";

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
    },
    mastered_concepts: [],
    struggling_concepts: [],
  };

  try {
    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, skill_level, learning_goal, streak_days")
      .eq("id", userId)
      .single();

    if (profile) {
      context.user.name = profile.name || "Learner";
      context.user.skill_level = profile.skill_level || "beginner";
      context.user.learning_goal = profile.learning_goal || null;
      context.user.streak_count = profile.streak_days || 0;
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
    let currentLesson: any = null;
    if (lessonId) {
      const { data: specificLesson } = await supabase
        .from("lessons")
        .select("title, concepts_taught")
        .eq("id", lessonId)
        .single();
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
        .single();
      currentLesson = inProgressLesson;
    }

    if (currentLesson?.lessons) {
      const lesson = currentLesson.lessons as any;
      context.current_lesson = {
        title: lesson.title,
        concepts: lesson.concepts_taught || [],
      };
    }
  } catch (err) {
    console.error("Lesson fetch failed:", err);
  }

  return context;
}
