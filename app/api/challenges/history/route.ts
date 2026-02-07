import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// GET /api/challenges/history - Get user's challenge history
export async function GET(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "anonymous";
        const rl = rateLimit(`challenge-history:${ip}`, RATE_LIMITS.api);
        if (!rl.allowed) {
            return NextResponse.json(
                { error: "rate_limit", message: "Too many requests." },
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

        // Get user's challenge history with challenge details
        const { data: history, error } = await supabase
            .from("user_challenges")
            .select(`
        *,
        challenge:daily_challenges(
          id,
          title,
          difficulty,
          date,
          xp_reward,
          solution_code
        )
      `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(30);

        if (error) {
            console.error("History fetch error:", error);
            return NextResponse.json(
                { error: "server_error", message: "Failed to fetch history" },
                { status: 500 }
            );
        }

        // Format the response
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedHistory = (history || []).map((item: any) => ({
            id: item.id,
            challenge_id: item.challenge_id,
            title: item.challenge?.title || "Unknown Challenge",
            difficulty: item.challenge?.difficulty || "unknown",
            date: item.challenge?.date,
            attempts_used: item.attempts_used,
            completed: !!item.completed_at,
            xp_earned: item.xp_earned || 0,
            max_xp: item.challenge?.xp_reward || 0,
            solution_code: item.completed_at ? null : item.challenge?.solution_code, // Only show solution if failed
        }));

        return NextResponse.json({ history: formattedHistory });
    } catch (error) {
        console.error("Challenge history API error:", error);
        return NextResponse.json(
            { error: "server_error", message: "Failed to fetch history" },
            { status: 500 }
        );
    }
}
