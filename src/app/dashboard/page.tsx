import Link from 'next/link';
import { getProfile, createServerSupabaseClient } from '@/lib/supabase/server';
import { getGreeting, formatTime, calculateProgress } from '@/lib/utils';
import { 
  BookOpen, 
  Clock, 
  Target, 
  ArrowRight, 
  Flame,
  Star,
  TrendingUp
} from 'lucide-react';

export default async function DashboardPage() {
  const profile = await getProfile();
  const supabase = createServerSupabaseClient();

  // Fetch learning paths with progress
  const { data: paths } = await supabase
    .from('learning_paths')
    .select(`
      *,
      modules (
        id,
        lessons (id)
      )
    `)
    .eq('is_published', true)
    .order('order_index');

  // Fetch user lesson progress
  const { data: userLessons } = await supabase
    .from('user_lessons')
    .select('lesson_id, status')
    .eq('user_id', profile?.id);

  // Calculate progress for each path
  const pathsWithProgress = paths?.map(path => {
    const totalLessons = path.modules?.reduce(
      (acc: number, mod: { lessons: { id: string }[] }) => acc + (mod.lessons?.length || 0), 
      0
    ) || 0;
    
    const lessonIds = path.modules?.flatMap(
      (mod: { lessons: { id: string }[] }) => mod.lessons?.map((l: { id: string }) => l.id) || []
    ) || [];
    
    const completedLessons = userLessons?.filter(
      ul => lessonIds.includes(ul.lesson_id) && ul.status === 'completed'
    ).length || 0;

    return {
      ...path,
      totalLessons,
      completedLessons,
      progress: calculateProgress(completedLessons, totalLessons),
    };
  });

  // Get current lesson (last accessed or first incomplete)
  const currentPath = pathsWithProgress?.[0];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">
            {getGreeting()}, {profile?.name || 'Learner'}! 👋
          </h1>
          <p className="text-dark-500">
            Keep up the great work. You're making amazing progress!
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Streak */}
          {(profile?.streak_count || 0) > 0 && (
            <div className="flex items-center gap-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-5 py-3 rounded-xl shadow-lg">
              <Flame className="w-6 h-6" />
              <div>
                <div className="text-xl font-bold">{profile?.streak_count}</div>
                <div className="text-xs opacity-80">day streak</div>
              </div>
            </div>
          )}
          
          {/* XP */}
          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl border border-dark-100">
            <Star className="w-6 h-6 text-accent-500" />
            <div>
              <div className="text-xl font-bold text-dark-900">{profile?.total_xp || 0}</div>
              <div className="text-xs text-dark-500">Total XP</div>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Learning Card */}
      {currentPath && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-dark-900">Continue Learning</h2>
            <span className="text-sm text-dark-500">{currentPath.title}</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-dark-900 mb-2">
                📘 Python Fundamentals
              </h3>
              <p className="text-dark-500 text-sm mb-4">
                Master the basics of Python programming from scratch
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1 progress-bar h-2">
                  <div 
                    className="progress-bar-fill"
                    style={{ width: `${currentPath.progress}%` }}
                  />
                </div>
                <span className="text-sm text-dark-500">{currentPath.progress}%</span>
              </div>
            </div>
            
            <Link 
              href="/dashboard/lessons"
              className="btn-primary btn-md"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-dark-500 text-sm">Lessons Completed</span>
            <BookOpen className="w-5 h-5 text-primary-500" />
          </div>
          <div className="text-2xl font-bold text-dark-900">
            {profile?.total_lessons_completed || 0}
          </div>
          <div className="text-xs text-primary-600 mt-1">
            +3 this week
          </div>
        </div>
        
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-dark-500 text-sm">Time Learning</span>
            <Clock className="w-5 h-5 text-accent-500" />
          </div>
          <div className="text-2xl font-bold text-dark-900">
            {formatTime((profile?.total_time_spent || 0) * 60)}
          </div>
          <div className="text-xs text-primary-600 mt-1">
            +2.5 hrs this week
          </div>
        </div>
        
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-dark-500 text-sm">Current Streak</span>
            <Target className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-dark-900">
            {profile?.streak_count || 0} days
          </div>
          <div className="text-xs text-dark-400 mt-1">
            Longest: {profile?.longest_streak || 0} days
          </div>
        </div>
      </div>

      {/* Learning Paths */}
      <div className="card p-6">
        <h2 className="font-semibold text-dark-900 mb-4">Your Learning Paths</h2>
        <div className="space-y-4">
          {pathsWithProgress?.map((path) => (
            <div key={path.id} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                path.progress > 0 ? 'bg-primary-100' : 'bg-dark-100'
              }`}>
                {path.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium ${path.is_published ? 'text-dark-900' : 'text-dark-400'}`}>
                    {path.title}
                  </span>
                  <span className="text-sm text-dark-500">
                    {path.is_published ? `${path.progress}%` : 'Coming Soon'}
                  </span>
                </div>
                <div className="progress-bar h-2">
                  <div 
                    className="progress-bar-fill"
                    style={{ width: `${path.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <Link href="/dashboard/chat" className="card-hover p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <span className="text-2xl">💬</span>
          </div>
          <div>
            <h3 className="font-semibold text-dark-900">Chat with Py</h3>
            <p className="text-sm text-dark-500">Get help with any Python question</p>
          </div>
          <ArrowRight className="w-5 h-5 text-dark-400 ml-auto" />
        </Link>
        
        <Link href="/dashboard/lessons" className="card-hover p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
          <div>
            <h3 className="font-semibold text-dark-900">Daily Challenge</h3>
            <p className="text-sm text-dark-500">Earn bonus XP with today's challenge</p>
          </div>
          <ArrowRight className="w-5 h-5 text-dark-400 ml-auto" />
        </Link>
      </div>
    </div>
  );
}
