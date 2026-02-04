import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// GET /api/challenges - Get today's daily challenge
export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const rl = rateLimit(`challenges:${ip}`, RATE_LIMITS.api);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "rate_limit", message: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }

    const supabase = createClient();

    const today = new Date().toISOString().split("T")[0];

    const { data: challenge, error } = await supabase
      .from("daily_challenges")
      .select("*")
      .eq("date", today)
      .single();

    if (error || !challenge) {
      // Fall back to the most recent challenge if none for today
      const { data: latest, error: latestError } = await supabase
        .from("daily_challenges")
        .select("*")
        .lte("date", today)
        .order("date", { ascending: false })
        .limit(1)
        .single();

      if (latestError || !latest) {
        return NextResponse.json(
          { error: "not_found", message: "No challenge available" },
          { status: 404 }
        );
      }

      return NextResponse.json(latest);
    }

    return NextResponse.json(challenge);
  } catch (error) {
    console.error("Challenges API error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Failed to fetch challenge" },
      { status: 500 }
    );
  }
}
