"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">😵</div>
        <h1 className="text-2xl font-bold text-dark-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-dark-500 mb-6">
          An unexpected error occurred. Don&apos;t worry, your progress is saved.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-4 py-2 bg-dark-200 text-dark-700 rounded-lg hover:bg-dark-300 transition-colors font-medium"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
