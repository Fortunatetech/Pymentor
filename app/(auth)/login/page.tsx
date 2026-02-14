"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const supabase = createClient();
  const searchParams = useSearchParams();

  // Show error from OAuth callback redirect
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "auth_failed") {
      setError("Google sign-in failed. Please try again or use email/password.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Check if user has completed onboarding
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("learning_goal")
          .eq("id", user.id)
          .maybeSingle();

        if (!profile?.learning_goal) {
          // Use window.location.href to force full page reload and fresh auth state
          window.location.href = "/onboarding";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        window.location.href = "/dashboard";
      }
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
    // If no error, browser will redirect to Google — no need to reset loading
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">🐍</span>
            <span className="font-bold text-2xl text-dark-900">PyMentor AI</span>
          </Link>
          <h1 className="text-2xl font-bold text-dark-900">Welcome back!</h1>
          <p className="text-dark-500 mt-2">Log in to continue learning Python</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-dark-100">
          {/* <button
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-dark-200 rounded-xl hover:bg-dark-50 transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {googleLoading ? "Redirecting to Google..." : "Continue with Google"}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-dark-400">or</span>
            </div>
          </div> */}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <p className="text-center text-sm text-dark-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign up free
            </Link>
          </p>
          <p className="text-center text-sm text-dark-400 mt-2">
            <Link href="/forgot-password" className="hover:underline">
              Forgot your password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
