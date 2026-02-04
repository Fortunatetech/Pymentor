"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Streak, XPDisplay } from "@/components/ui/streak";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/lib/supabase/client";

interface ConceptMastery {
  concept: string;
  mastery_level: number;
}

interface WeeklyDay {
  day: string;
  minutes: number;
}

export default function ProgressPage() {
  const { profile, loading: userLoading } = useUser();
  const [concepts, setConcepts] = useState<ConceptMastery[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyDay[]>([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [pathCompleted, setPathCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProgress() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch concept mastery
      const { data: conceptData } = await supabase
        .from("user_progress")
        .select("concept, mastery_level")
        .eq("user_id", user.id)
        .order("mastery_level", { ascending: false });

      if (conceptData) {
        setConcepts(conceptData);
      }

      // Fetch total lesson count
      const { count } = await supabase
        .from("lessons")
        .select("id", { count: "exact", head: true });

      setTotalLessons(count || 0);

      // Check if any learning path is fully completed
      const { data: paths } = await supabase
        .from("learning_paths")
        .select("id, modules(id, lessons(id))");

      if (paths) {
        const { data: completedLessons } = await supabase
          .from("user_lessons")
          .select("lesson_id")
          .eq("user_id", user.id)
          .eq("status", "completed");

        const completedIds = new Set(completedLessons?.map((l) => l.lesson_id) || []);

        for (const path of paths) {
          const pathLessons = (path.modules as any[])?.flatMap(
            (m: any) => (m.lessons as any[])?.map((l: any) => l.id) || []
          ) || [];
          if (pathLessons.length > 0 && pathLessons.every((id: string) => completedIds.has(id))) {
            setPathCompleted(true);
            break;
          }
        }
      }

      // Calculate weekly activity from user_lessons
      const now = new Date();
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const { data: weekLessons } = await supabase
        .from("user_lessons")
        .select("time_spent, started_at, completed_at")
        .eq("user_id", user.id)
        .gte("started_at", weekStart.toISOString());

      const dailyMinutes: Record<string, number> = {};
      for (const d of dayNames) dailyMinutes[d] = 0;

      if (weekLessons) {
        for (const lesson of weekLessons) {
          const date = new Date(lesson.started_at || lesson.completed_at);
          const dayName = dayNames[date.getDay()];
          dailyMinutes[dayName] += Math.round((lesson.time_spent || 0) / 60);
        }
      }

      setWeeklyActivity(
        dayNames.map((day) => ({ day, minutes: dailyMinutes[day] }))
      );

      setLoading(false);
    }

    fetchProgress();
  }, []);

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-dark-500">Loading...</div>
      </div>
    );
  }

  const streakDays = profile?.streak_days || 0;
  const totalXp = profile?.total_xp || 0;
  const lessonsCompleted = profile?.total_lessons_completed || 0;
  const timeSpentHours = Math.round(((profile?.total_time_spent || 0) / 3600) * 10) / 10;

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark-900 mb-8">Your Progress</h1>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Streak days={streakDays} size="lg" />
        <XPDisplay xp={totalXp} size="lg" />
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-3xl">📚</span>
            <div>
              <div className="text-2xl font-bold text-dark-900">
                {lessonsCompleted}/{totalLessons}
              </div>
              <div className="text-sm text-dark-500">Lessons</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-3xl">⏱️</span>
            <div>
              <div className="text-2xl font-bold text-dark-900">
                {timeSpentHours}h
              </div>
              <div className="text-sm text-dark-500">Time Spent</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Concept Mastery */}
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-dark-900 mb-4">Concept Mastery</h2>
            {concepts.length > 0 ? (
              <div className="space-y-4">
                {concepts.map((concept) => (
                  <div key={concept.concept}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-dark-700">{concept.concept}</span>
                      <span className="text-dark-500">{concept.mastery_level}%</span>
                    </div>
                    <Progress value={concept.mastery_level} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-dark-500 text-sm">
                Complete lessons to start tracking concept mastery.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-dark-900 mb-4">This Week</h2>
            <div className="flex items-end justify-between h-40 gap-2">
              {weeklyActivity.map((day) => (
                <div key={day.day} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary-500 rounded-t"
                    style={{
                      height: `${Math.max((day.minutes / 60) * 100, 5)}%`,
                      minHeight: day.minutes > 0 ? "8px" : "4px",
                      opacity: day.minutes > 0 ? 1 : 0.3,
                    }}
                  />
                  <span className="text-xs text-dark-500 mt-2">{day.day}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-4 text-sm text-dark-500">
              Total: {weeklyActivity.reduce((a, b) => a + b.minutes, 0)} minutes
            </div>
          </CardContent>
        </Card>

        {/* Achievements (static) */}
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <h2 className="font-semibold text-dark-900 mb-4">Achievements</h2>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {[
                { icon: "🎯", name: "First Code", unlocked: lessonsCompleted >= 1 },
                { icon: "🔥", name: "3 Day Streak", unlocked: streakDays >= 3 },
                { icon: "⭐", name: "100 XP", unlocked: totalXp >= 100 },
                { icon: "📚", name: "5 Lessons", unlocked: lessonsCompleted >= 5 },
                { icon: "🏆", name: "7 Day Streak", unlocked: streakDays >= 7 },
                { icon: "💎", name: "500 XP", unlocked: totalXp >= 500 },
                { icon: "🚀", name: "10 Lessons", unlocked: lessonsCompleted >= 10 },
                { icon: "👑", name: "1000 XP", unlocked: totalXp >= 1000 },
                { icon: "🌟", name: "14 Day Streak", unlocked: streakDays >= 14 },
                { icon: "🎓", name: "Path Complete", unlocked: pathCompleted },
                { icon: "💪", name: "30 Day Streak", unlocked: streakDays >= 30 },
                { icon: "🏅", name: "5000 XP", unlocked: totalXp >= 5000 },
              ].map((achievement) => (
                <div
                  key={achievement.name}
                  className={`flex flex-col items-center p-3 rounded-xl ${
                    achievement.unlocked ? "bg-primary-50" : "bg-dark-100 opacity-50"
                  }`}
                  title={achievement.name}
                >
                  <span className="text-2xl mb-1">{achievement.icon}</span>
                  <span className="text-xs text-dark-600 text-center">
                    {achievement.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
