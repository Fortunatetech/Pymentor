import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// GET /api/lessons/[id] - Get single lesson
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const rl = rateLimit(`lesson:${ip}`, RATE_LIMITS.api);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limit", message: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  if (!params.id || typeof params.id !== "string") {
    return NextResponse.json(
      { error: "bad_request", message: "Lesson ID is required" },
      { status: 400 }
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: lesson, error } = await supabase
    .from("lessons")
    .select(
      `
      *,
      module:modules(
        *,
        path:learning_paths(*)
      )
    `
    )
    .eq("id", params.id)
    .single();

  if (error || !lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  // Get adjacent lessons for navigation
  const { data: adjacentLessons } = await supabase
    .from("lessons")
    .select("id, title, order_index")
    .eq("module_id", lesson.module_id)
    .order("order_index");

  const currentIndex =
    adjacentLessons?.findIndex((l) => l.id === params.id) ?? -1;
  const prevLesson =
    currentIndex > 0 ? adjacentLessons?.[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < (adjacentLessons?.length ?? 0) - 1
      ? adjacentLessons?.[currentIndex + 1]
      : null;

  // Get user progress
  let userProgress = null;
  if (user) {
    const { data } = await supabase
      .from("user_lessons")
      .select("*")
      .eq("user_id", user.id)
      .eq("lesson_id", params.id)
      .single();
    userProgress = data;
  }

  return NextResponse.json({
    ...lesson,
    prevLesson,
    nextLesson,
    userProgress,
  });
}

// POST /api/lessons/[id] - Update lesson progress
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const rl = rateLimit(`lesson-post:${ip}`, RATE_LIMITS.api);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limit", message: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

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

  const { status, score, timeSpent } = await req.json();

  // Check if already completed (dedup XP)
  const { data: existing } = await supabase
    .from("user_lessons")
    .select("status, time_spent")
    .eq("user_id", user.id)
    .eq("lesson_id", params.id)
    .single();

  const alreadyCompleted = existing?.status === "completed";

  // If no status sent (time-tracking beacon only), preserve existing status
  // Never downgrade from "completed" to "in_progress"
  const effectiveStatus = !status
    ? (existing?.status || "in_progress")
    : alreadyCompleted && status !== "completed"
      ? "completed"
      : status;

  // Accumulate time_spent instead of overwriting
  const totalTime = (existing?.time_spent || 0) + (timeSpent || 0);

  // Upsert progress
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upsertData: Record<string, any> = {
    user_id: user.id,
    lesson_id: params.id,
    status: effectiveStatus,
    time_spent: totalTime,
  };

  // Only set started_at on first insert
  if (!existing) {
    upsertData.started_at = new Date().toISOString();
  }

  // Only set completed_at on first completion
  if (status === "completed" && !alreadyCompleted) {
    upsertData.completed_at = new Date().toISOString();
  }

  if (score !== undefined && score !== null) {
    upsertData.score = score;
  }

  const { data, error } = await supabase
    .from("user_lessons")
    .upsert(upsertData, {
      onConflict: "user_id,lesson_id",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let xpEarned = 0;
  let streakDays = 0;
  const conceptsUpdated: string[] = [];

  if (status === "completed" && !alreadyCompleted) {
    // Get lesson details for XP and concepts
    const { data: lesson } = await supabase
      .from("lessons")
      .select("xp_reward, concepts_taught")
      .eq("id", params.id)
      .single();

    if (lesson) {
      xpEarned = lesson.xp_reward || 10;

      // Award XP
      await supabase.rpc("increment_xp", {
        user_id: user.id,
        xp_amount: xpEarned,
      });

      // Increment lessons completed
      await supabase.rpc("increment_lessons_completed", {
        user_id: user.id,
      });

      // Update concept mastery
      if (lesson.concepts_taught && Array.isArray(lesson.concepts_taught)) {
        const conceptScore = score ?? 80;
        for (const concept of lesson.concepts_taught) {
          await supabase.rpc("update_concept_mastery", {
            p_user_id: user.id,
            p_concept: concept,
            p_score: conceptScore,
          });
          conceptsUpdated.push(concept);
        }
      }
    }

    // Update streak
    const { data: streak } = await supabase.rpc("check_daily_streak", {
      p_user_id: user.id,
    });
    streakDays = streak ?? 0;
  }

  return NextResponse.json({
    ...data,
    xp_earned: xpEarned,
    streak_days: streakDays,
    concepts_updated: conceptsUpdated,
  });
}
