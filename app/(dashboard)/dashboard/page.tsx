"use client";

import { useState } from "react";
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
  const { profile, loading: userLoading } = useUser();
  const searchParams = useSearchParams();
  const isNewUser = searchParams.get("tour") === "true";

  const [paths] = useState<PathWithProgress[]>([]);
  const [challenge] = useState<DailyChallenge | null>(null);
  const [loading] = useState(true);

  // ... (existing useEffect) ...

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-dark-500">Loading...</div>
      </div>
    );
  }

  const userName = profile?.name || "Learner";
  const streakDays = profile?.streak_days || 0;
  const totalXp = profile?.total_xp || 0;
  const lessonsCompleted = profile?.total_lessons_completed || 0;

  // Calculate total lessons across all paths
  const totalLessons = paths.reduce((sum, path) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return sum + (path.modules?.reduce((mSum: number, mod: any) => mSum + (mod.lessons?.length || 0), 0) || 0);
  }, 0);

  // Find the current lesson (first in_progress or first not_started)
  let currentLesson: { id: string; title: string; path: string; module: string; progress: number } | null = null;
  for (const path of paths) {
    for (const mod of path.modules || []) {
      for (const lesson of mod.lessons || []) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (lesson as any).userProgress?.status || "not_started";
        if (status === "in_progress") {
          currentLesson = {
            id: lesson.id,
            title: lesson.title,
            path: path.title,
            module: mod.title,
            progress: 50,
          };
          break;
        }
        if (!currentLesson && status === "not_started") {
          currentLesson = {
            id: lesson.id,
            title: lesson.title,
            path: path.title,
            module: mod.title,
            progress: 0,
          };
        }
      }
      if (currentLesson && currentLesson.progress > 0) break;
    }
    if (currentLesson && currentLesson.progress > 0) break;
  }

  // Calculate per-path progress
  const pathProgress = paths.map((path) => {
    const lessons = path.modules?.flatMap((m) => m.lessons || []) || [];
    const completed = lessons.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (l: any) => l.userProgress?.status === "completed"
    ).length;
    const total = lessons.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      title: path.title,
      icon: path.icon,
      progress,
      locked: !path.is_free && progress === 0 && path.order_index > 1,
    };
  });

  return (
    <div>
      <DashboardTour />
      {/* Welcome Header */}
      <div id="tour-welcome" className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">
            {isNewUser ? `Welcome, ${userName}!` : `Welcome back, ${userName}!`}
          </h1>
          <p className="text-dark-500">
            {isNewUser
              ? "We're excited to have you. Explore your dashboard to get started."
              : "Keep up the great work. You're making amazing progress!"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Streak days={streakDays} />
          <XPDisplay xp={totalXp} />
        </div>
      </div>

      {/* Continue Learning Card */}
      {currentLesson && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-dark-900">Continue Learning</h2>
              <span className="text-sm text-dark-500">{currentLesson.path}</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-dark-900 mb-2">
                  {currentLesson.title}
                </h3>
                <p className="text-dark-500 text-sm mb-4">
                  {currentLesson.module}
                </p>
                <div className="flex items-center gap-4">
                  <Progress value={currentLesson.progress} className="flex-1" />
                  <span className="text-sm text-dark-500">{currentLesson.progress}%</span>
                </div>
              </div>
              <Link href={`/lessons/${currentLesson.id}`}>
                <Button>Continue</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div id="tour-stats" className="grid md:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon="📚"
          label="Lessons Completed"
          value={`${lessonsCompleted} / ${totalLessons}`}
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
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <h2 className="font-semibold text-dark-900">
                  Daily Challenge
                </h2>
              </div>
              <Badge variant="accent">+{challenge.xp_reward} XP</Badge>
            </div>
            <h3 className="font-medium text-dark-900 mb-1">
              {challenge.title}
            </h3>
            <p className="text-dark-500 text-sm mb-4">
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
      {pathProgress.length > 0 && (
        <Card id="tour-paths">
          <CardContent className="p-6">
            <h2 className="font-semibold text-dark-900 mb-4">Your Learning Paths</h2>
            <div className="space-y-4">
              {pathProgress.map((path) => (
                <div
                  key={path.title}
                  className={cn("flex items-center gap-4", path.locked && "opacity-50")}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    path.locked ? "bg-dark-100" : "bg-primary-100"
                  )}>
                    {path.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "font-medium",
                        path.locked ? "text-dark-700" : "text-dark-900"
                      )}>
                        {path.title}
                      </span>
                      <span className="text-sm text-dark-500">
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
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-dark-500 text-sm">{label}</span>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="text-2xl font-bold text-dark-900">{value}</div>
      </CardContent>
    </Card>
  );
}
