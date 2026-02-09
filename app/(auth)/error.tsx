"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AuthError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Auth error:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-50 px-4">
            <div className="text-center max-w-md">
                <div className="text-6xl mb-4">🔐</div>
                <h1 className="text-2xl font-bold text-dark-900 mb-2">
                    Authentication Error
                </h1>
                <p className="text-dark-500 mb-6">
                    Something went wrong with authentication. Please try again.
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="px-4 py-2 bg-dark-200 text-dark-700 rounded-lg hover:bg-dark-300 transition-colors font-medium"
                    >
                        Go Home
                    </Link>
                </div>
                {error.digest && (
                    <p className="mt-6 text-xs text-dark-400">
                        Error ID: {error.digest}
                    </p>
                )}
            </div>
        </div>
    );
}
