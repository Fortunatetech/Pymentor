import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// GET /api/paths - List published learning paths with module/lesson counts
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const rl = rateLimit(`paths:${ip}`, RATE_LIMITS.api);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limit", message: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  const supabase = createClient();

  const { data: paths, error } = await supabase
    .from("learning_paths")
    .select(`
      *,
      modules:modules(
        id,
        title,
        order_index,
        lessons:lessons(id)
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

  // Add counts
  const pathsWithCounts = paths?.map((path) => {
    const modules = path.modules || [];
    const lessonCount = modules.reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sum: number, mod: any) => sum + (mod.lessons?.length || 0),
      0
    );
    return {
      ...path,
      module_count: modules.length,
      lesson_count: lessonCount,
    };
  });

  return NextResponse.json(pathsWithCounts);
}
