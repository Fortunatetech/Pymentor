import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-primary-200 mb-4">404</div>
        <h1 className="text-2xl font-bold text-dark-900 mb-2">
          Page Not Found
        </h1>
        <p className="text-dark-500 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="px-4 py-2 bg-dark-200 text-dark-700 rounded-lg hover:bg-dark-300 transition-colors font-medium"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
