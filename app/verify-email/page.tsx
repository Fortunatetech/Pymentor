"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const supabase = createClient();

  const handleResend = async () => {
    setResending(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user?.email) {
      await supabase.auth.resend({
        type: "signup",
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      setResent(true);
    }
    
    setResending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-dark-100">
          <div className="text-6xl mb-6">📬</div>
          <h1 className="text-2xl font-bold text-dark-900 mb-4">Verify your email</h1>
          <p className="text-dark-500 mb-6">
            We sent a verification link to your email. Click the link to activate your account and start learning Python!
          </p>

          {resent ? (
            <p className="text-green-600 bg-green-50 p-3 rounded-lg mb-6">
              ✓ Verification email sent!
            </p>
          ) : (
            <Button
              variant="secondary"
              className="mb-6"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? "Sending..." : "Resend verification email"}
            </Button>
          )}

          <div className="border-t border-dark-200 pt-6">
            <p className="text-sm text-dark-400 mb-4">
              Already verified?
            </p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        </div>

        <p className="text-sm text-dark-400 mt-6">
          Wrong email?{" "}
          <Link href="/signup" className="text-primary-600 hover:underline">
            Sign up again
          </Link>
        </p>
      </div>
    </div>
  );
}
