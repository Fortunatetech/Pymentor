"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-50 px-4">
                <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border border-dark-100 text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                        🎉
                    </div>
                    <h1 className="text-2xl font-bold text-dark-900 mb-2">Password Reset!</h1>
                    <p className="text-dark-500 mb-6">
                        Your password has been updated successfully.
                        <br />
                        Redirecting you to the dashboard...
                    </p>
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
                    <h1 className="text-2xl font-bold text-dark-900">Set new password</h1>
                    <p className="text-dark-500 mt-2">
                        Enter your new password below
                    </p>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm border border-dark-100">
                    <form onSubmit={handleReset} className="space-y-4">
                        <Input
                            type="password"
                            label="New Password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Input
                            type="password"
                            label="Confirm Password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        {error && (
                            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Updating..." : "Update Password"}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-dark-500 mt-6">
                        Remembered it?{" "}
                        <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
