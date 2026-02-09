import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/dashboard";

  // Prevent open redirect: ensure `next` is a relative path
  if (!next.startsWith("/") || next.startsWith("//")) {
    next = "/dashboard";
  }

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has completed onboarding
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("learning_goal")
          .eq("id", user.id)
          .single();

        // If learning_goal is null, user hasn't completed onboarding
        if (!profile?.learning_goal) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }

    return NextResponse.redirect(`${origin}/login?error=auth_failed&detail=code_exchange_failed`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed&detail=no_code`);
}
