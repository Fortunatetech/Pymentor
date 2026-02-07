import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// POST /api/challenges/attempt - Record a challenge attempt
export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "anonymous";
        const rl = rateLimit(`challenge-attempt:${ip}`, RATE_LIMITS.api);
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

        const { challenge_id, passed } = await req.json();

        if (!challenge_id) {
            return NextResponse.json(
                { error: "bad_request", message: "Challenge ID is required" },
                { status: 400 }
            );
        }

        // Get or create user_challenge record
        const { data: existing } = await supabase
            .from("user_challenges")
            .select("*")
            .eq("user_id", user.id)
            .eq("challenge_id", challenge_id)
            .single();

        if (existing) {
            // Already have a record - check if already completed or max attempts reached
            if (existing.completed_at) {
                return NextResponse.json({
                    attempts_used: existing.attempts_used,
                    trials_remaining: 0,
                    already_completed: true,
                    xp_earned: existing.xp_earned,
                });
            }

            if (existing.attempts_used >= 3) {
                return NextResponse.json({
                    attempts_used: 3,
                    trials_remaining: 0,
                    max_attempts_reached: true,
                });
            }

            // Increment attempt
            const newAttempts = existing.attempts_used + 1;
            const trialsRemaining = Math.max(0, 3 - newAttempts);

            await supabase
                .from("user_challenges")
                .update({ attempts_used: newAttempts })
                .eq("id", existing.id);

            return NextResponse.json({
                attempts_used: newAttempts,
                trials_remaining: trialsRemaining,
                passed: passed || false,
            });
        } else {
            // Create new record with first attempt
            const { error: insertError } = await supabase
                .from("user_challenges")
                .insert({
                    user_id: user.id,
                    challenge_id: challenge_id,
                    attempts_used: 1,
                });

            if (insertError) {
                console.error("Insert error:", insertError);
                return NextResponse.json(
                    { error: "server_error", message: "Failed to record attempt" },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                attempts_used: 1,
                trials_remaining: 2,
                passed: passed || false,
            });
        }
    } catch (error) {
        console.error("Challenge attempt API error:", error);
        return NextResponse.json(
            { error: "server_error", message: "Failed to record attempt" },
            { status: 500 }
        );
    }
}

// GET /api/challenges/attempt?challenge_id=xxx - Get current attempt status
export async function GET(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "anonymous";
        const rl = rateLimit(`challenge-attempt-get:${ip}`, RATE_LIMITS.api);
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

        const { searchParams } = new URL(req.url);
        const challenge_id = searchParams.get("challenge_id");

        if (!challenge_id) {
            return NextResponse.json(
                { error: "bad_request", message: "Challenge ID is required" },
                { status: 400 }
            );
        }

        const { data: existing } = await supabase
            .from("user_challenges")
            .select("*")
            .eq("user_id", user.id)
            .eq("challenge_id", challenge_id)
            .single();

        if (!existing) {
            return NextResponse.json({
                attempts_used: 0,
                trials_remaining: 3,
                completed: false,
            });
        }

        return NextResponse.json({
            attempts_used: existing.attempts_used,
            trials_remaining: Math.max(0, 3 - existing.attempts_used),
            completed: !!existing.completed_at,
            xp_earned: existing.xp_earned || 0,
        });
    } catch (error) {
        console.error("Challenge attempt GET error:", error);
        return NextResponse.json(
            { error: "server_error", message: "Failed to get attempt status" },
            { status: 500 }
        );
    }
}
