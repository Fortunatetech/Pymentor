"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Lesson {
  id: string;
  title: string;
  estimated_minutes: number;
  xp_reward: number;
  is_free: boolean;
  userProgress?: { status: string };
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  modules: Module[];
  isUnlocked: boolean;
  completionPercentage: number;
  order_index: number;
}

export default function LessonsPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await fetch("/api/lessons");
      const data = await response.json();
      setPaths(data);
      // Select first unlocked path, or first path if none unlocked
      const firstUnlocked = data.find((p: LearningPath) => p.isUnlocked);
      setSelectedPath(firstUnlocked?.id || data[0]?.id);
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentPath = paths.find(p => p.id === selectedPath);

  // Find what percentage is needed to unlock next level
  const getUnlockRequirement = (path: LearningPath) => {
    if (path.isUnlocked) return null;
    const prevPath = paths.find(p => p.order_index === path.order_index - 1);
    if (!prevPath) return null;
    return {
      prevTitle: prevPath.title,
      prevCompletion: prevPath.completionPercentage,
      needed: 80
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="text-4xl mb-4">🐍</div>
          <p className="text-dark-500">Loading lessons...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Path Selector */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {paths.map((path) => {
          const unlockReq = getUnlockRequirement(path);
          return (
            <button
              key={path.id}
              onClick={() => path.isUnlocked && setSelectedPath(path.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl whitespace-nowrap transition-all ${!path.isUnlocked
                ? "bg-dark-100 border border-dark-200 opacity-75 cursor-not-allowed"
                : selectedPath === path.id
                  ? "bg-primary-100 border-2 border-primary-500"
                  : "bg-white border border-dark-200 hover:border-dark-300"
                }`}
              disabled={!path.isUnlocked}
              title={unlockReq ? `Complete ${unlockReq.needed}% of ${unlockReq.prevTitle} to unlock` : undefined}
            >
              <span className="text-2xl">
                {path.isUnlocked ? path.icon : "🔒"}
              </span>
              <div className="text-left">
                <div className="font-medium text-dark-900 flex items-center gap-2">
                  {path.title}
                  {!path.isUnlocked && (
                    <span className="text-xs text-dark-400 font-normal">
                      (Locked)
                    </span>
                  )}
                </div>
                <div className="text-xs text-dark-500">
                  {path.isUnlocked
                    ? `${path.completionPercentage}% complete`
                    : unlockReq
                      ? `${unlockReq.prevCompletion}/${unlockReq.needed}% of ${unlockReq.prevTitle}`
                      : "Locked"
                  }
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {currentPath && (
        <>
          {/* Path Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{currentPath.icon}</span>
              <div>
                <h1 className="text-2xl font-bold text-dark-900">{currentPath.title}</h1>
                <p className="text-dark-500">{currentPath.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Progress value={currentPath.completionPercentage} className="flex-1 max-w-md" />
              <span className="text-sm text-dark-500">
                {currentPath.completionPercentage}% complete
                {currentPath.completionPercentage >= 80 && currentPath.completionPercentage < 100 && (
                  <span className="ml-2 text-green-600">🔓 Next level unlocked!</span>
                )}
              </span>
            </div>
          </div>

          {/* Modules */}
          <div className="space-y-6">
            {currentPath.modules?.map((module, moduleIndex) => (
              <Card key={module.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700 font-semibold text-sm">
                      {moduleIndex + 1}
                    </div>
                    <h2 className="font-semibold text-lg text-dark-900">{module.title}</h2>
                  </div>

                  <div className="space-y-2">
                    {module.lessons?.map((lesson) => (
                      <LessonRow key={lesson.id} lesson={lesson} isPathUnlocked={currentPath.isUnlocked} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}


function LessonRow({ lesson, isPathUnlocked = true }: { lesson: Lesson; isPathUnlocked?: boolean }) {
  const status = lesson.userProgress?.status || "not_started";

  const statusConfig = {
    completed: { badge: "success", icon: "✓", text: "Completed" },
    in_progress: { badge: "accent", icon: "▶", text: "In Progress" },
    not_started: { badge: "default", icon: "○", text: "Not Started" },
  } as const;

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_started;

  return (
    <Link
      href={`/lessons/${lesson.id}`}
      className="flex items-center justify-between p-4 rounded-xl hover:bg-dark-50 transition-colors group"
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${status === "completed"
            ? "bg-green-500 text-white"
            : status === "in_progress"
              ? "bg-accent-500 text-white"
              : "border-2 border-dark-300 text-dark-300"
            }`}
        >
          {config.icon}
        </div>
        <div>
          <div className="font-medium text-dark-900 group-hover:text-primary-600 transition-colors">
            {lesson.title}
          </div>
          <div className="text-sm text-dark-500">
            {lesson.estimated_minutes} min • {lesson.xp_reward} XP
            {lesson.is_free && <span className="ml-2 text-primary-600">Free</span>}
          </div>
        </div>
      </div>
      <Badge variant={config.badge as "success" | "accent" | "default"}>
        {config.text}
      </Badge>
    </Link>
  );
}
