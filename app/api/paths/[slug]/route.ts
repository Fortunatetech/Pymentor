import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// GET /api/paths/[slug] - Get a specific path with modules and lessons
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const rl = rateLimit(`path:${ip}`, RATE_LIMITS.api);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limit", message: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  const supabase = createClient();

  const { data: path, error } = await supabase
    .from("learning_paths")
    .select(`
      *,
      modules:modules(
        *,
        lessons:lessons(*)
      )
    `)
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (error || !path) {
    return NextResponse.json({ error: "Path not found" }, { status: 404 });
  }

  // Sort modules and lessons by order_index
  path.modules = path.modules
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ?.sort((a: any, b: any) => a.order_index - b.order_index)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((mod: any) => ({
      ...mod,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lessons: mod.lessons?.sort((a: any, b: any) => a.order_index - b.order_index),
    }));

  // Get user progress if logged in
  const { data: { user } } = await supabase.auth.getUser();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let userProgress: Record<string, any> = {};

  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lessonIds = path.modules?.flatMap((mod: any) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mod.lessons?.map((l: any) => l.id) || []
    ) || [];

    if (lessonIds.length > 0) {
      const { data: progress } = await supabase
        .from("user_lessons")
        .select("lesson_id, status, completed_at")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds);

      if (progress) {
        userProgress = progress.reduce((acc, p) => {
          acc[p.lesson_id] = p;
          return acc;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }, {} as Record<string, any>);
      }
    }
  }

  return NextResponse.json({ ...path, userProgress });
}
