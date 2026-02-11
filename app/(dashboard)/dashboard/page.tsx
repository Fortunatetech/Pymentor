"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Streak, XPDisplay } from "@/components/ui/streak";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { DashboardTour } from "@/components/dashboard-tour";
import { createClient } from "@/lib/supabase/client";

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  starter_code: string;
  xp_reward: number;
}

interface PathWithProgress {
  title: string;
  icon: string;
  is_free: boolean;
  order_index: number;
  progress: number;
  locked: boolean;
  modules?: {
    title: string;
    lessons?: {
      id: string;
      title: string;
      userProgress?: { status: string };
    }[];
  }[];
}

export default function DashboardPage() {
  const { profile, loading: userLoading, authUser } = useUser();
  const searchParams = useSearchParams();
  const isNewUser = searchParams.get("tour") === "true";
  const supabase = useMemo(() => createClient(), []);

  const [paths, setPaths] = useState<PathWithProgress[]>([]);
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<{ id: string; title: string; path: string; module: string; progress: number } | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading
    if (userLoading) return;

    // No user = nothing to fetch
    if (!authUser) {
      setDataLoading(false);
      return;
    }

    let cancelled = false;
    const userId = authUser.id;

    async function fetchData() {
      try {
        const today = new Date().toISOString().split("T")[0];
        const [pathsResult, userLessonsResult, challengeResult] = await Promise.all([
          supabase
            .from("learning_paths")
            .select(`
              id, title, icon, is_free, order_index,
              modules (
                id, title, order_index,
                lessons (
                  id, title, order_index
                )
              )
            `)
            .order("order_index", { ascending: true }),
          supabase
            .from("user_lessons")
            .select("lesson_id, status")
            .eq("user_id", userId),
          supabase
            .from("daily_challenges")
            .select("*")
            .lte("date", today)
            .order("date", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        if (cancelled) return;

        const { data: pathsData, error: pathsError } = pathsResult;
        if (pathsError) throw pathsError;

        const { data: userLessons, error: ulError } = userLessonsResult;
        if (ulError) throw ulError;

        // Map progress to easy lookup
        const progressMap = new Map();
        userLessons?.forEach((ul) => {
          progressMap.set(ul.lesson_id, ul.status);
        });

        // Process Paths & Find Current Lesson
        let foundCurrent = false;
        let nextLessonToLearn: typeof currentLesson = null;

        const processedPaths = (pathsData || []).map((path: any) => {
          const modules = (path.modules || [])
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((mod: any) => {
              const lessons = (mod.lessons || [])
                .sort((a: any, b: any) => a.order_index - b.order_index)
                .map((lesson: any) => {
                  const status = progressMap.get(lesson.id) || "not_started";

                  if (!foundCurrent) {
                    if (status === "in_progress" || status === "not_started") {
                      nextLessonToLearn = {
                        id: lesson.id,
                        title: lesson.title,
                        path: path.title,
                        module: mod.title,
                        progress: status === "in_progress" ? 50 : 0,
                      };
                      foundCurrent = true;
                    }
                  }

                  return { ...lesson, userProgress: { status } };
                });
              return { ...mod, lessons };
            });

          const allLessons = modules.flatMap((m: any) => m.lessons);
          const completedCount = allLessons.filter((l: any) => l.userProgress.status === "completed").length;
          const totalCount = allLessons.length;
          const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
          const isLocked = !path.is_free && progress === 0 && path.order_index > 1;

          return {
            title: path.title,
            icon: path.icon,
            is_free: path.is_free,
            order_index: path.order_index,
            progress,
            locked: isLocked,
            modules,
          };
        });

        if (!cancelled) {
          setPaths(processedPaths);
          setCurrentLesson(nextLessonToLearn);
          if (challengeResult.data) setChallenge(challengeResult.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        if (!cancelled) setError("Failed to load dashboard data. Please refresh the page.");
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    }

    fetchData();

    return () => { cancelled = true; };
  }, [authUser?.id, userLoading, supabase]);

  // Compute stats from paths data
  const totalLessonsCount = useMemo(() =>
    paths.reduce((sum, p) => sum + (p.modules?.reduce((mSum, m) => mSum + (m.lessons?.length || 0), 0) || 0), 0),
    [paths]
  );
  const completedLessonsCount = useMemo(() =>
    paths.reduce((sum, p) => {
      return sum + (p.modules?.reduce((mSum, m) => mSum + (m.lessons?.filter(l => l.userProgress?.status === "completed").length || 0), 0) || 0);
    }, 0),
    [paths]
  );

  // Loading state: either auth is loading OR dashboard data is loading
  if (userLoading || dataLoading) {
    return <DashboardSkeleton />;
  }

  const userName = profile?.name || authUser?.email?.split("@")[0] || "Learner";
  const streakDays = profile?.streak_days || 0;
  const totalXp = profile?.total_xp || 0;

  return (
    <div>
      <DashboardTour />
      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 ml-4">
            Dismiss
          </button>
        </div>
      )}
      {/* Welcome Header */}
      <div id="tour-welcome" className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-dark-900">
              {isNewUser ? `Welcome, ${userName}!` : `Welcome back, ${userName}!`}
            </h1>
            <p className="text-dark-500 text-sm sm:text-base">
              {isNewUser
                ? "We're excited to have you. Explore your dashboard to get started."
                : "Keep up the great work. You're making amazing progress!"}
            </p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <Streak days={streakDays} size="sm" />
            <XPDisplay xp={totalXp} size="sm" />
          </div>
        </div>
      </div>

      {/* Continue Learning Card */}
      {currentLesson ? (
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="font-semibold text-dark-900 text-sm sm:text-base">Continue Learning</h2>
              <span className="text-xs sm:text-sm text-dark-500 truncate ml-2">{currentLesson.path}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-medium text-dark-900 mb-1 sm:mb-2 truncate">
                  {currentLesson.title}
                </h3>
                <p className="text-dark-500 text-xs sm:text-sm mb-3 sm:mb-4">
                  {currentLesson.module}
                </p>
                <div className="flex items-center gap-3">
                  <Progress value={currentLesson.progress} className="flex-1" />
                  <span className="text-xs sm:text-sm text-dark-500 flex-shrink-0">{currentLesson.progress === 0 ? "Start" : `${currentLesson.progress}%`}</span>
                </div>
              </div>
              <Link href={`/lessons/${currentLesson.id}`} className="flex-shrink-0">
                <Button className="w-full sm:w-auto">Continue Lesson</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            {completedLessonsCount === 0 ? (
              <>
                <h3 className="font-semibold text-dark-900 mb-2">Ready to start learning?</h3>
                <p className="text-dark-500">Begin your Python journey with your first lesson!</p>
                <div className="mt-4">
                  <Link href="/lessons"><Button>Start Your First Lesson</Button></Link>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-dark-900 mb-2">All Caught Up!</h3>
                <p className="text-dark-500 text-sm sm:text-base">You&apos;ve completed all available lessons. Check out the projects or challenges!</p>
                <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                  <Link href="/projects"><Button variant="secondary" className="w-full sm:w-auto">Browse Projects</Button></Link>
                  <Link href="/challenges"><Button className="w-full sm:w-auto">Daily Challenge</Button></Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div id="tour-stats" className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
        <StatCard
          icon="📚"
          label="Lessons Completed"
          value={`${completedLessonsCount} / ${totalLessonsCount}`}
        />
        <StatCard
          icon="⏱️"
          label="Time Learning"
          value={`${Math.round((profile?.total_time_spent || 0) / 3600 * 10) / 10} hrs`}
        />
        <StatCard
          icon="🎯"
          label="Total XP"
          value={totalXp.toString()}
        />
      </div>

      {/* Daily Challenge */}
      {challenge && (
        <Card id="tour-challenge" className="mb-6 border-accent-300 bg-accent-50/30">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl">🎯</span>
                <h2 className="font-semibold text-dark-900 text-sm sm:text-base">
                  Daily Challenge
                </h2>
              </div>
              <Badge variant="accent">+{challenge.xp_reward} XP</Badge>
            </div>
            <h3 className="font-medium text-dark-900 mb-1 text-sm sm:text-base">
              {challenge.title}
            </h3>
            <p className="text-dark-500 text-xs sm:text-sm mb-3 sm:mb-4">
              {challenge.description}
            </p>
            <div className="flex items-center justify-between">
              <Badge
                variant={
                  challenge.difficulty === "easy"
                    ? "primary"
                    : challenge.difficulty === "medium"
                      ? "accent"
                      : "default"
                }
              >
                {challenge.difficulty}
              </Badge>
              <Link href="/challenges">
                <Button size="sm">Start Challenge</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Path Progress */}
      {paths.length > 0 && (
        <Card id="tour-paths">
          <CardContent className="p-4 sm:p-6">
            <h2 className="font-semibold text-dark-900 mb-3 sm:mb-4 text-sm sm:text-base">Your Learning Paths</h2>
            <div className="space-y-3 sm:space-y-4">
              {paths.map((path) => (
                <div
                  key={path.title}
                  className={cn("flex items-center gap-3 sm:gap-4", path.locked && "opacity-50")}
                >
                  <div className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-lg sm:text-xl flex-shrink-0",
                    path.locked ? "bg-dark-100" : "bg-primary-100"
                  )}>
                    {path.icon || "📚"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "font-medium text-sm sm:text-base truncate",
                        path.locked ? "text-dark-700" : "text-dark-900"
                      )}>
                        {path.title}
                      </span>
                      <span className="text-xs sm:text-sm text-dark-500 flex-shrink-0 ml-2">
                        {path.locked ? "Locked" : `${path.progress}%`}
                      </span>
                    </div>
                    <Progress value={path.progress} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="p-3 sm:p-5">
        <div className="flex items-center justify-between mb-1 sm:mb-3">
          <span className="text-dark-500 text-xs sm:text-sm">{label}</span>
          <span className="text-lg sm:text-2xl">{icon}</span>
        </div>
        <div className="text-lg sm:text-2xl font-bold text-dark-900">{value}</div>
      </CardContent>
    </Card>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-dark-100 rounded-lg", className)} />;
}

function DashboardSkeleton() {
  return (
    <div>
      {/* Welcome header skeleton */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <SkeletonBlock className="h-6 sm:h-8 w-48 sm:w-64 mb-2" />
            <SkeletonBlock className="h-4 sm:h-5 w-64 sm:w-80" />
          </div>
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-10 w-20 rounded-xl" />
            <SkeletonBlock className="h-10 w-20 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Continue learning skeleton */}
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <SkeletonBlock className="h-5 w-40 mb-4" />
          <SkeletonBlock className="h-6 w-64 mb-2" />
          <SkeletonBlock className="h-4 w-32 mb-4" />
          <SkeletonBlock className="h-3 w-full" />
        </CardContent>
      </Card>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-3 sm:p-5">
              <SkeletonBlock className="h-3 sm:h-4 w-16 sm:w-24 mb-2 sm:mb-3" />
              <SkeletonBlock className="h-6 sm:h-8 w-12 sm:w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Learning paths skeleton */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <SkeletonBlock className="h-5 w-44 mb-4" />
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4">
                <SkeletonBlock className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" />
                <div className="flex-1">
                  <SkeletonBlock className="h-4 w-48 mb-2" />
                  <SkeletonBlock className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
