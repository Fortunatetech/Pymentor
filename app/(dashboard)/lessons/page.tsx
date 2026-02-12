"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSubscription } from "@/hooks";

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
  order_index: number;
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
  const { isPro } = useSubscription();
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
    <div className="w-full">
      {/* Path Selector */}
      <div className="relative mb-8">
        {/* Fade indicators */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-dark-50 to-transparent z-10 pointer-events-none opacity-0 transition-opacity" id="fade-left" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-dark-50 to-transparent z-10 pointer-events-none" id="fade-right" />

        <div
          className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2 -mb-2"
          ref={(el) => {
            if (!el) return;
            const update = () => {
              const fadeL = document.getElementById("fade-left");
              const fadeR = document.getElementById("fade-right");
              if (fadeL) fadeL.style.opacity = el.scrollLeft > 8 ? "1" : "0";
              if (fadeR) fadeR.style.opacity = el.scrollLeft < el.scrollWidth - el.clientWidth - 8 ? "1" : "0";
            };
            el.addEventListener("scroll", update, { passive: true });
            // Initial check after render
            requestAnimationFrame(update);
          }}
        >
          {paths.map((path) => {
            const unlockReq = getUnlockRequirement(path);
            return (
              <button
                key={path.id}
                onClick={() => path.isUnlocked && setSelectedPath(path.id)}
                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${!path.isUnlocked
                  ? "bg-dark-100 border border-dark-200 opacity-75 cursor-not-allowed"
                  : selectedPath === path.id
                    ? "bg-primary-100 border-2 border-primary-500"
                    : "bg-white border border-dark-200 hover:border-dark-300"
                  }`}
                disabled={!path.isUnlocked}
                title={unlockReq ? `Complete ${unlockReq.needed}% of ${unlockReq.prevTitle} to unlock` : undefined}
              >
                <span className="text-lg sm:text-2xl">
                  {path.isUnlocked ? path.icon : "🔒"}
                </span>
                <div className="text-left">
                  <div className="font-medium text-dark-900 flex items-center gap-1 sm:gap-2">
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
                        ? `${unlockReq.prevCompletion}/${unlockReq.needed}%`
                        : "Locked"
                    }
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {currentPath && (
        <>
          {/* Path Header */}
          <div className="mb-8">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl sm:text-4xl flex-shrink-0">{currentPath.icon}</span>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-dark-900">{currentPath.title}</h1>
                <p className="text-dark-500 text-sm sm:text-base line-clamp-2">{currentPath.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <Progress value={currentPath.completionPercentage} className="flex-1" />
              <span className="text-xs sm:text-sm text-dark-500 flex-shrink-0">
                {currentPath.completionPercentage}%
                {currentPath.completionPercentage >= 80 && currentPath.completionPercentage < 100 && (
                  <span className="ml-1 text-green-600">🔓</span>
                )}
              </span>
            </div>
          </div>

          {/* Modules */}
          <div className="space-y-6">
            {currentPath.modules?.map((module, moduleIndex) => (
              <Card key={module.id}>
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700 font-semibold text-sm flex-shrink-0">
                      {moduleIndex + 1}
                    </div>
                    <h2 className="font-semibold text-base sm:text-lg text-dark-900 min-w-0 truncate">{module.title}</h2>
                  </div>

                  <div className="space-y-1">
                    {module.lessons?.map((lesson) => (
                      <LessonRow key={lesson.id} lesson={lesson} isLocked={!isPro && module.order_index > 1} />
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


function LessonRow({ lesson, isLocked = false }: { lesson: Lesson; isLocked?: boolean }) {
  const status = lesson.userProgress?.status || "not_started";

  const statusConfig = {
    completed: { badge: "success" as const, icon: "✓", text: "Done", fullText: "Completed" },
    in_progress: { badge: "accent" as const, icon: "▶", text: "Started", fullText: "In Progress" },
    not_started: { badge: "default" as const, icon: "○", text: "New", fullText: "Not Started" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_started;

  return (
    <Link
      href={`/lessons/${lesson.id}`}
      className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl hover:bg-dark-50 transition-colors group ${isLocked ? "opacity-60" : ""}`}
    >
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
          isLocked
            ? "border-2 border-dark-200 text-dark-300"
            : status === "completed"
              ? "bg-green-500 text-white"
              : status === "in_progress"
                ? "bg-accent-500 text-white"
                : "border-2 border-dark-300 text-dark-300"
        }`}
      >
        {isLocked ? "🔒" : config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-sm sm:text-base transition-colors truncate ${isLocked ? "text-dark-500" : "text-dark-900 group-hover:text-primary-600"}`}>
          {lesson.title}
        </div>
        <div className="text-xs sm:text-sm text-dark-500">
          {lesson.estimated_minutes} min • {lesson.xp_reward} XP
          {lesson.is_free && <span className="ml-1 text-primary-600 text-xs">Free</span>}
        </div>
      </div>
      {isLocked ? (
        <Badge variant="accent" className="flex-shrink-0 text-xs sm:text-sm">
          <span className="hidden sm:inline">Pro</span>
          <span className="sm:hidden">Pro</span>
        </Badge>
      ) : (
        <Badge variant={config.badge} className="flex-shrink-0 text-xs sm:text-sm">
          <span className="hidden sm:inline">{config.fullText}</span>
          <span className="sm:hidden">{config.text}</span>
        </Badge>
      )}
    </Link>
  );
}
