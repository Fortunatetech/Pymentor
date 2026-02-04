"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">😓</div>
        <h2 className="text-xl font-bold text-dark-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-dark-500 mb-6">
          There was an error loading this page. Your progress is safe.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="px-4 py-2 bg-dark-200 text-dark-700 rounded-lg hover:bg-dark-300 transition-colors font-medium"
          >
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
