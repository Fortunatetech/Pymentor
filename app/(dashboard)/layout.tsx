"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser, useSubscription } from "@/hooks";

const navItems = [
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/lessons", icon: "📚", label: "Lessons" },
  { href: "/chat", icon: "💬", label: "AI Tutor" },
  { href: "/challenges", icon: "🎯", label: "Challenges" },
  { href: "/leaderboard", icon: "🏆", label: "Leaderboard" },
  { href: "/projects", icon: "🏗️", label: "Projects" },
  { href: "/progress", icon: "📈", label: "Progress" },
  { href: "/settings", icon: "⚙️", label: "Settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { profile, signOut } = useUser();
  const { isPro } = useSubscription();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userName = profile?.name || profile?.email?.split("@")[0] || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-dark-200 px-4 py-3 flex items-center justify-between lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🐍</span>
          <span className="font-bold text-dark-900">PyMentor AI</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-dark-100 text-dark-600"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 bg-white border-r border-dark-200 p-4 flex flex-col fixed h-full z-50 transition-transform duration-200",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Link href="/" className="flex items-center gap-2 mb-8">
          <span className="text-2xl">🐍</span>
          <span className="font-bold text-lg text-dark-900">PyMentor AI</span>
        </Link>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                pathname === item.href || pathname.startsWith(item.href + "/")
                  ? "bg-primary-100 text-primary-700 border-l-4 border-primary-500"
                  : "text-dark-500 hover:bg-dark-50 hover:text-dark-700"
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Upgrade Banner (for free users) */}
        {!isPro && (
          <Link href="/pricing" className="mb-4" onClick={() => setSidebarOpen(false)}>
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-4 text-white">
              <div className="font-semibold mb-1">Upgrade to Pro</div>
              <div className="text-xs text-primary-100">Unlimited lessons & AI chat</div>
            </div>
          </Link>
        )}

        <div className="border-t border-dark-200 pt-4">
          <div className="flex items-center justify-between px-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold">
                {userInitial}
              </div>
              <div>
                <div className="text-sm font-medium text-dark-900">{userName}</div>
                <div className="text-xs text-primary-600">
                  {isPro ? "Pro Member" : "Free Plan"}
                </div>
              </div>
            </div>
            <button
              onClick={signOut}
              className="text-dark-400 hover:text-dark-600 text-sm"
              title="Sign out"
            >
              ↩
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 pt-16 lg:p-8 lg:pt-8 bg-dark-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}
