import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// GET /api/leaderboard - Fetch top users by XP
export async function GET(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "anonymous";
        const rl = rateLimit(`leaderboard:${ip}`, RATE_LIMITS.api);
        if (!rl.allowed) {
            return NextResponse.json(
                { error: "rate_limit", message: "Too many requests." },
                { status: 429 }
            );
        }

        const supabase = createClient();

        // Fetch top 50 profiles sorted by total_xp
        const { data: profiles, error } = await supabase
            .from("profiles")
            .select("id, name, email, total_xp, streak_days, total_lessons_completed")
            .order("total_xp", { ascending: false })
            .order("total_lessons_completed", { ascending: false }) // Tie-breaker
            .limit(50);

        if (error) {
            console.error("Leaderboard fetch error:", error);
            return NextResponse.json(
                { error: "server_error", message: "Failed to fetch leaderboard" },
                { status: 500 }
            );
        }

        // Mask emails for privacy
        const sanitizedProfiles = profiles.map((p) => ({
            ...p,
            email: undefined, // Remove email
            name: p.name || "Anonymous Learner",
        }));

        return NextResponse.json(sanitizedProfiles);
    } catch (error) {
        console.error("Leaderboard API error:", error);
        return NextResponse.json(
            { error: "server_error", message: "Internal server error" },
            { status: 500 }
        );
    }
}
