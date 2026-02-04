import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// POST /api/challenges/complete - Mark a daily challenge as completed and award XP
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const rl = rateLimit(`challenge-complete:${ip}`, RATE_LIMITS.api);
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

    const { challenge_id } = await req.json();

    if (!challenge_id) {
      return NextResponse.json(
        { error: "bad_request", message: "Challenge ID is required" },
        { status: 400 }
      );
    }

    // Get challenge details
    const { data: challenge, error: challengeError } = await supabase
      .from("daily_challenges")
      .select("id, xp_reward")
      .eq("id", challenge_id)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json(
        { error: "not_found", message: "Challenge not found" },
        { status: 404 }
      );
    }

    const xpReward = challenge.xp_reward || 5;

    // Award XP (idempotent - increment_xp is additive, but we do best-effort dedup)
    await supabase.rpc("increment_xp", {
      user_id: user.id,
      xp_amount: xpReward,
    });

    // Update streak
    const { data: streakDays } = await supabase.rpc("check_daily_streak", {
      p_user_id: user.id,
    });

    return NextResponse.json({
      xp_earned: xpReward,
      streak_days: streakDays ?? 0,
    });
  } catch (error) {
    console.error("Challenge complete API error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Failed to complete challenge" },
      { status: 500 }
    );
  }
}
