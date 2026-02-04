'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  FolderKanban,
  BarChart3,
  Settings,
  LogOut,
  Flame
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Profile } from '@/types';

interface SidebarProps {
  profile: Profile;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/lessons', label: 'Lessons', icon: BookOpen },
  { href: '/dashboard/chat', label: 'AI Tutor', icon: MessageSquare },
  { href: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
  { href: '/dashboard/progress', label: 'Progress', icon: BarChart3 },
];

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-dark-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-dark-100">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🐍</span>
          <span className="font-bold text-xl text-dark-900">PyMentor AI</span>
        </Link>
      </div>

      {/* Streak Badge */}
      {profile.streak_count > 0 && (
        <div className="mx-4 mt-4 p-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl text-white">
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6" />
            <div>
              <div className="font-bold text-lg">{profile.streak_count} day streak!</div>
              <div className="text-xs text-white/80">Keep it going!</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-dark-500 hover:bg-dark-50 hover:text-dark-700'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User & Settings */}
      <div className="p-4 border-t border-dark-100">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-dark-500 hover:bg-dark-50 hover:text-dark-700 transition-all"
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-dark-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>

        <div className="mt-4 px-4 py-3 bg-dark-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold">
              {profile.name?.charAt(0).toUpperCase() || profile.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-dark-900 truncate">
                {profile.name || 'Learner'}
              </div>
              <div className="text-xs text-dark-500 truncate">
                {profile.total_xp} XP
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
