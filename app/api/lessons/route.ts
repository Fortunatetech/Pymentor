import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// GET /api/lessons - Get all lessons with user progress and level unlock status
export async function GET(req: NextRequest) {
  try {
    // Rate limit by IP
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const rl = rateLimit(`lessons:${ip}`, RATE_LIMITS.api);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "rate_limit", message: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.retryAfterMs || 0) / 1000)) } }
      );
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get all paths with modules and lessons
    const { data: paths, error } = await supabase
      .from("learning_paths")
      .select(`
        *,
        modules:modules(
          *,
          lessons:lessons(*)
        )
      `)
      .eq("is_published", true)
      .order("order_index");

    if (error) {
      return NextResponse.json(
        { error: "server_error", message: error.message },
        { status: 500 }
      );
    }

    // Get user progress if logged in
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let userProgress: Record<string, any> = {};
    if (user) {
      const { data: progress } = await supabase
        .from("user_lessons")
        .select("lesson_id, status, completed_at")
        .eq("user_id", user.id);

      if (progress) {
        userProgress = progress.reduce((acc, p) => {
          acc[p.lesson_id] = p;
          return acc;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }, {} as Record<string, any>);
      }
    }

    // Calculate completion percentages and unlock status for each path
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pathCompletions: Record<number, number> = {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paths?.forEach((path: any) => {
      let totalLessons = 0;
      let completedLessons = 0;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      path.modules?.forEach((module: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        module.lessons?.forEach((lesson: any) => {
          totalLessons++;
          if (userProgress[lesson.id]?.status === "completed") {
            completedLessons++;
          }
        });
      });

      pathCompletions[path.order_index] = totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;
    });

    // Merge progress with lessons and add unlock status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pathsWithProgress = paths?.map((path: any) => {
      // Level is unlocked if it's the first level (order_index 1) 
      // OR if previous level is 80% complete
      const previousLevelCompletion = pathCompletions[path.order_index - 1] ?? 100;
      const isUnlocked = path.order_index <= 1 || previousLevelCompletion >= 80;
      const completionPercentage = pathCompletions[path.order_index];

      return {
        ...path,
        isUnlocked,
        completionPercentage,
        modules: path.modules
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ?.sort((a: any, b: any) => a.order_index - b.order_index)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((module: any) => ({
            ...module,
            lessons: module.lessons
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ?.sort((a: any, b: any) => a.order_index - b.order_index)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((lesson: any) => ({
                ...lesson,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                userProgress: userProgress[lesson.id as any] || { status: "not_started" },
              })),
          })),
      };
    });

    return NextResponse.json(pathsWithProgress);
  } catch (error) {
    console.error("Lessons API error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}
