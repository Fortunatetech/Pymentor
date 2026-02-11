"use client";

import { useState, useEffect } from "react";
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
  const { profile, authUser, signOut, loading: userLoading } = useUser();
  const { isPro } = useSubscription(authUser?.id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Persist collapsed state in localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  const userName = profile?.name || authUser?.email?.split("@")[0] || (userLoading ? "..." : "User");
  const userInitial = userName === "..." ? "..." : userName.charAt(0).toUpperCase();

  const sidebarWidth = collapsed ? "w-[68px]" : "w-64";
  const mainMargin = collapsed ? "lg:ml-[68px]" : "lg:ml-64";

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
          "bg-white border-r border-dark-200 flex flex-col fixed h-full z-50 transition-all duration-200",
          // Desktop: always visible, respects collapsed state
          "lg:translate-x-0",
          sidebarWidth,
          // Mobile: slide in/out, always full width when open
          sidebarOpen ? "translate-x-0 !w-64" : "-translate-x-full",
          collapsed ? "p-2" : "p-4"
        )}
      >
        {/* Logo + Collapse Toggle */}
        <div className={cn("flex items-center mb-6", collapsed ? "justify-center" : "justify-between")}>
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <span className={collapsed ? "text-xl" : "text-2xl"}>🐍</span>
            {!collapsed && (
              <span className="font-bold text-lg text-dark-900 truncate">PyMentor AI</span>
            )}
          </Link>
          {/* Collapse button - desktop only */}
          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md hover:bg-dark-100 text-dark-400 hover:text-dark-600 transition-colors flex-shrink-0"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {collapsed ? (
                <>
                  <line x1="3" y1="4" x2="13" y2="4" />
                  <line x1="3" y1="8" x2="13" y2="8" />
                  <line x1="3" y1="12" x2="13" y2="12" />
                </>
              ) : (
                <>
                  <polyline points="10,3 5,8 10,13" />
                </>
              )}
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center rounded-lg transition-all",
                  collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-3",
                  isActive
                    ? cn("bg-primary-100 text-primary-700", !collapsed && "border-l-4 border-primary-500")
                    : "text-dark-500 hover:bg-dark-50 hover:text-dark-700"
                )}
              >
                <span className={collapsed ? "text-lg" : ""}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Upgrade Banner (for free users) */}
        {!isPro && !collapsed && (
          <Link href="/pricing" className="mb-4" onClick={() => setSidebarOpen(false)}>
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-4 text-white">
              <div className="font-semibold mb-1">Upgrade to Pro</div>
              <div className="text-xs text-primary-100">Unlimited lessons & AI chat</div>
            </div>
          </Link>
        )}
        {!isPro && collapsed && (
          <Link
            href="/pricing"
            className="mb-4 flex justify-center"
            onClick={() => setSidebarOpen(false)}
            title="Upgrade to Pro"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white text-lg">
              ⭐
            </div>
          </Link>
        )}

        {/* User Profile */}
        <div className="border-t border-dark-200 pt-4">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold cursor-pointer"
                title={userName}
              >
                {userInitial}
              </div>
              <button
                onClick={signOut}
                className="text-dark-400 hover:text-red-500 transition-colors p-1"
                title="Sign out"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold flex-shrink-0">
                  {userInitial}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-dark-900 truncate">{userName}</div>
                  <div className="text-xs text-primary-600">
                    {isPro ? "Pro Member" : "Free Plan"}
                  </div>
                </div>
              </div>
              <button
                onClick={signOut}
                className="text-dark-400 hover:text-red-500 text-xs font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                title="Sign out"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn("flex-1 min-w-0 overflow-x-hidden p-4 pt-16 lg:p-8 lg:pt-8 bg-dark-50 min-h-screen transition-all duration-200", mainMargin)}>
        {children}
      </main>
    </div>
  );
}
