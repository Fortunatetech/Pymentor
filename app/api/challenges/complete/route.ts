import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, RATE_LIMITS, applyRateLimitHeaders } from "@/lib/rate-limit";
import { validateRequest, challengeCompleteSchema } from "@/lib/validations";
import { withErrorTracking } from "@/lib/monitoring";

// Calculate XP based on attempt number (tiered rewards)
function calculateXP(baseXP: number, attemptNumber: number): number {
  switch (attemptNumber) {
    case 1:
      return baseXP; // 100% XP for first try
    case 2:
      return Math.round(baseXP * 0.75); // 75% XP for second try
    case 3:
      return Math.round(baseXP * 0.5); // 50% XP for third try
    default:
      return 0; // No XP after 3 attempts
  }
}

// POST /api/challenges/complete - Mark a daily challenge as completed and award tiered XP
async function challengeCompleteHandler(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const rl = rateLimit(`challenge-complete:${ip}`, RATE_LIMITS.api);

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

  const parseResult = await validateRequest(req, challengeCompleteSchema);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "bad_request", message: parseResult.error },
      { status: 400, headers }
    );
  }

  const { challenge_id, attempts } = parseResult.data;

  // Get challenge details
  const { data: challenge, error: challengeError } = await supabase
    .from("daily_challenges")
    .select("id, xp_reward")
    .eq("id", challenge_id)
    .single();

  if (challengeError || !challenge) {
    return NextResponse.json(
      { error: "not_found", message: "Challenge not found" },
      { status: 404, headers }
    );
  }

  // Check if already completed
  const { data: existing } = await supabase
    .from("user_challenges")
    .select("*")
    .eq("user_id", user.id)
    .eq("challenge_id", challenge_id)
    .maybeSingle();

  if (existing?.completed_at) {
    return NextResponse.json({
      already_completed: true,
      xp_earned: existing.xp_earned,
      attempt_number: existing.attempts_used,
    }, { headers });
  }

  // Calculate tiered XP based on attempt number
  const attemptNum = attempts || existing?.attempts_used || 1;
  const baseXP = Math.min(Math.max(challenge.xp_reward || 25, 1), 100);
  const xpReward = calculateXP(baseXP, attemptNum);

  // Award XP
  if (xpReward > 0) {
    await supabase.rpc("increment_xp", {
      user_id: user.id,
      xp_amount: xpReward,
    });
  }

  // Update user_challenges record
  if (existing) {
    await supabase
      .from("user_challenges")
      .update({
        completed_at: new Date().toISOString(),
        xp_earned: xpReward,
        attempts_used: attemptNum,
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("user_challenges").insert({
      user_id: user.id,
      challenge_id: challenge_id,
      attempts_used: attemptNum,
      completed_at: new Date().toISOString(),
      xp_earned: xpReward,
    });
  }

  // Update streak
  const { data: streakDays } = await supabase.rpc("check_daily_streak", {
    p_user_id: user.id,
  });

  return NextResponse.json({
    xp_earned: xpReward,
    base_xp: baseXP,
    attempt_number: attemptNum,
    streak_days: streakDays ?? 0,
    message:
      attemptNum === 1
        ? "🎉 PERFECT! First try!"
        : attemptNum === 2
          ? "💪 Nice recovery!"
          : "🌟 Persistence pays off!",
  }, { headers });
}

export const POST = withErrorTracking(challengeCompleteHandler, "/api/challenges/complete");


