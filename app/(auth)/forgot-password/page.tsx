"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="text-6xl mb-6">📧</div>
          <h1 className="text-2xl font-bold text-dark-900 mb-4">Check your email</h1>
          <p className="text-dark-500 mb-6">
            We sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-dark-400 mb-6">
            Didn&apos;t receive it? Check your spam folder or try again.
          </p>
          <Link href="/login">
            <Button variant="secondary">Back to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">🐍</span>
            <span className="font-bold text-2xl text-dark-900">PyMentor AI</span>
          </Link>
          <h1 className="text-2xl font-bold text-dark-900">Reset your password</h1>
          <p className="text-dark-500 mt-2">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-dark-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && (
              <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <p className="text-center text-sm text-dark-500 mt-6">
            Remember your password?{" "}
            <Link href="/login" className="text-primary-600 hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
