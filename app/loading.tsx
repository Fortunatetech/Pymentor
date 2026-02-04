export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-dark-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}
