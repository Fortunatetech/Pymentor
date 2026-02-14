import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// GET /api/projects/completed - Get list of completed project IDs
export async function GET(req: NextRequest) {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const rl = rateLimit(`project-completed-list:${ip}`, RATE_LIMITS.api);

    if (!rl.allowed) {
        return NextResponse.json(
            { error: "rate_limit", message: "Too many requests." },
            { status: 429 }
        );
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
            { error: "unauthorized", message: "You must be logged in" },
            { status: 401 }
        );
    }

    const { data: completions, error } = await supabase
        .from("user_projects")
        .select("project_id, completed_at")
        .eq("user_id", user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return simpler map: { "project-id": { completedAt: "..." } }
    // This matches the shape we used with localStorage, making frontend migration easier
    const completionMap: Record<string, { completedAt: string }> = {};

    completions?.forEach((record) => {
        completionMap[record.project_id] = { completedAt: record.completed_at };
    });

    return NextResponse.json(completionMap);
}
