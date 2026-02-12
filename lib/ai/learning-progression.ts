import { SupabaseClient } from "@supabase/supabase-js";
import type { LearningProgression } from "@/types";

interface FlatLesson {
  id: string;
  title: string;
  order: number;
  concepts_taught: string[];
  module_title: string;
  module_order: number;
  path_title: string;
  path_difficulty: string;
}

export async function buildLearningProgression(
  supabase: SupabaseClient,
  userId: string,
  masteredConcepts: string[]
): Promise<LearningProgression | null> {
  try {
    // Query 1: Full curriculum hierarchy
    const { data: paths } = await supabase
      .from("learning_paths")
      .select(
        "title, difficulty, order_index, modules(title, order_index, lessons(id, title, order_index, concepts_taught))"
      )
      .eq("is_published", true)
      .order("order_index", { ascending: true });

    // Query 2: User's lesson statuses
    const { data: userLessons } = await supabase
      .from("user_lessons")
      .select("lesson_id, status, completed_at")
      .eq("user_id", userId);

    if (!paths || paths.length === 0) return null;

    // Build status map
    const statusMap = new Map<
      string,
      { status: string; completed_at: string | null }
    >();
    if (userLessons) {
      for (const ul of userLessons) {
        statusMap.set(ul.lesson_id, {
          status: ul.status,
          completed_at: ul.completed_at,
        });
      }
    }

    // Flatten hierarchy into ordered list
    const flatLessons: FlatLesson[] = [];
    for (const path of paths) {
      const modules = (path.modules as { title: string; order_index: number; lessons: unknown[] }[]) || [];
      modules.sort((a, b) => a.order_index - b.order_index);
      for (const mod of modules) {
        const lessons = (mod.lessons as { id: string; title: string; order_index: number; concepts_taught?: string[] }[]) || [];
        lessons.sort((a, b) => a.order_index - b.order_index);
        for (const lesson of lessons) {
          flatLessons.push({
            id: lesson.id,
            title: lesson.title,
            order:
              path.order_index * 10000 +
              mod.order_index * 100 +
              lesson.order_index,
            concepts_taught: lesson.concepts_taught || [],
            module_title: mod.title,
            module_order: mod.order_index,
            path_title: path.title,
            path_difficulty: path.difficulty,
          });
        }
      }
    }

    if (flatLessons.length === 0) return null;

    // Overlay statuses
    const lessonStatuses = flatLessons.map((fl) => ({
      ...fl,
      status: (statusMap.get(fl.id)?.status || "not_started") as
        | "completed"
        | "in_progress"
        | "not_started",
      completed_at: statusMap.get(fl.id)?.completed_at || null,
    }));

    // Find current position: first in_progress, or first not_started
    let currentIdx = lessonStatuses.findIndex(
      (l) => l.status === "in_progress"
    );
    if (currentIdx === -1) {
      currentIdx = lessonStatuses.findIndex(
        (l) => l.status === "not_started"
      );
    }

    const currentLesson =
      currentIdx >= 0 ? lessonStatuses[currentIdx] : null;

    // Next 3 not_started after current
    const nextLessons: string[] = [];
    if (currentIdx >= 0) {
      for (
        let i = currentIdx + 1;
        i < lessonStatuses.length && nextLessons.length < 3;
        i++
      ) {
        if (lessonStatuses[i].status === "not_started") {
          nextLessons.push(lessonStatuses[i].title);
        }
      }
    }

    // Recently completed lessons (last 5 by completed_at)
    const completedLessons = lessonStatuses
      .filter((l) => l.status === "completed" && l.completed_at)
      .sort(
        (a, b) =>
          new Date(b.completed_at!).getTime() -
          new Date(a.completed_at!).getTime()
      )
      .slice(0, 5)
      .map((l) => l.title);

    // Recently learned concepts from last 3 completed
    const recentlyLearnedConcepts = lessonStatuses
      .filter((l) => l.status === "completed" && l.completed_at)
      .sort(
        (a, b) =>
          new Date(b.completed_at!).getTime() -
          new Date(a.completed_at!).getTime()
      )
      .slice(0, 3)
      .flatMap((l) => l.concepts_taught);

    // Concept gaps: current lesson prerequisites vs mastered
    const conceptGaps: string[] = [];
    if (currentLesson) {
      const masteredSet = new Set(
        masteredConcepts.map((c) => c.toLowerCase())
      );
      for (const concept of currentLesson.concepts_taught) {
        if (!masteredSet.has(concept.toLowerCase())) {
          conceptGaps.push(concept);
        }
      }
    }

    // Module stats for current path
    const currentPath = currentLesson
      ? currentLesson.path_title
      : lessonStatuses[0].path_title;
    const currentPathDifficulty = currentLesson
      ? currentLesson.path_difficulty
      : lessonStatuses[0].path_difficulty;

    const pathLessons = lessonStatuses.filter(
      (l) => l.path_title === currentPath
    );
    const uniqueModulesArr = Array.from(
      new Set(pathLessons.map((l) => l.module_title))
    );
    let completedModuleCount = 0;
    for (const modTitle of uniqueModulesArr) {
      const modLessons = pathLessons.filter(
        (l) => l.module_title === modTitle
      );
      if (modLessons.every((l) => l.status === "completed")) {
        completedModuleCount++;
      }
    }

    const completedInPath = pathLessons.filter(
      (l) => l.status === "completed"
    ).length;
    const overallPercent =
      pathLessons.length > 0
        ? Math.round((completedInPath / pathLessons.length) * 100)
        : 0;

    return {
      current_path: {
        title: currentPath,
        difficulty: currentPathDifficulty,
      },
      completed_lessons: completedLessons,
      current_lesson_title: currentLesson?.title || null,
      next_lessons: nextLessons,
      current_module: currentLesson?.module_title || null,
      modules_completed: completedModuleCount,
      modules_total: uniqueModulesArr.length,
      overall_percent: overallPercent,
      concept_gaps: conceptGaps,
      recently_learned_concepts: Array.from(new Set(recentlyLearnedConcepts)),
    };
  } catch (err) {
    console.error("Learning progression build failed:", err);
    return null;
  }
}
