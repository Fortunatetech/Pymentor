import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, RATE_LIMITS, applyRateLimitHeaders } from "@/lib/rate-limit";
import { validateRequest, projectCompleteSchema } from "@/lib/validations";
import { withErrorTracking } from "@/lib/monitoring";
import { projects } from "@/app/(dashboard)/projects/data";

// POST /api/projects/complete - Mark a project as completed and award XP
async function projectCompleteHandler(req: NextRequest) {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const rl = rateLimit(`project-complete:${ip}`, RATE_LIMITS.api);

    const headers = new Headers();
    applyRateLimitHeaders(headers, rl, RATE_LIMITS.api);

    if (!rl.allowed) {
        return NextResponse.json(
            { error: "rate_limit", message: "Too many requests." },
            { status: 429, headers }
        );
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
            { error: "unauthorized", message: "You must be logged in" },
            { status: 401, headers }
        );
    }

    const parseResult = await validateRequest(req, projectCompleteSchema);
    if (!parseResult.success) {
        return NextResponse.json(
            { error: "bad_request", message: parseResult.error },
            { status: 400, headers }
        );
    }

    const { project_id } = parseResult.data;

    // Get project details from static data
    const project = projects[project_id];

    if (!project) {
        return NextResponse.json(
            { error: "not_found", message: "Project not found" },
            { status: 404, headers }
        );
    }

    // Check if already completed
    const { data: existing } = await supabase
        .from("user_projects")
        .select("*")
        .eq("user_id", user.id)
        .eq("project_id", project_id)
        .maybeSingle();

    if (existing) {
        return NextResponse.json({
            already_completed: true,
            xp_earned: existing.xp_earned,
            message: "Project already completed!",
        }, { headers });
    }

    const xpReward = project.xpReward || 50;

    // Award XP
    if (xpReward > 0) {
        await supabase.rpc("increment_xp", {
            user_id: user.id,
            xp_amount: xpReward,
        });
    }

    // Record completion
    const { error: insertError } = await supabase.from("user_projects").insert({
        user_id: user.id,
        project_id: project_id,
        completed_at: new Date().toISOString(),
        xp_earned: xpReward,
    });

    if (insertError) {
        console.error("Error recording project completion:", insertError);
        return NextResponse.json(
            { error: "server_error", message: "Failed to save progress" },
            { status: 500, headers }
        );
    }

    // Update streak (projects count as daily activity!)
    const { data: streakDays } = await supabase.rpc("check_daily_streak", {
        p_user_id: user.id,
    });

    return NextResponse.json({
        xp_earned: xpReward,
        streak_days: streakDays ?? 0,
        message: "🎉 Project Completed! Amazing work!",
    }, { headers });
}

export const POST = withErrorTracking(projectCompleteHandler, "/api/projects/complete");
