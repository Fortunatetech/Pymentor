"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
      // For free users, select Python Fundamentals (order_index 1)
      // For Pro users, select first unlocked path
      if (isPro) {
        const firstUnlocked = data.find((p: LearningPath) => p.isUnlocked);
        setSelectedPath(firstUnlocked?.id || data[0]?.id);
      } else {
        const fundamentals = data.find((p: LearningPath) => p.order_index === 1);
        setSelectedPath(fundamentals?.id || data[0]?.id);
      }
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
            // For free users: only Python Fundamentals (order_index 1) is accessible
            // For Pro users: use the existing progressive unlock logic
            const isPathAccessible = isPro ? path.isUnlocked : path.order_index === 1;

            return (
              <button
                key={path.id}
                onClick={() => {
                  if (isPathAccessible) {
                    setSelectedPath(path.id);
                  } else {
                    router.push("/pricing");
                  }
                }}
                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${!isPathAccessible
                  ? "bg-dark-100 border border-dark-200 opacity-75 cursor-pointer hover:opacity-90"
                  : selectedPath === path.id
                    ? "bg-primary-100 border-2 border-primary-500"
                    : "bg-white border border-dark-200 hover:border-dark-300"
                  }`}
              >
                <span className="text-lg sm:text-2xl">
                  {isPathAccessible ? path.icon : "🔒"}
                </span>
                <div className="text-left">
                  <div className="font-medium text-dark-900 flex items-center gap-1 sm:gap-2">
                    {path.title}
                    {!isPathAccessible && (
                      <Badge variant="accent" className="text-xs">
                        Pro
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-dark-500">
                    {isPathAccessible
                      ? `${path.completionPercentage}% complete`
                      : "Upgrade to unlock"
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
            {currentPath.modules?.map((module, moduleIndex) => {
              // For free users in Python Fundamentals: modules 1-3 free, 4+ locked
              // For Pro users: all modules accessible
              const isModuleLocked = !isPro && module.order_index > 3;
              console.log(`Module: ${module.title}, Order: ${module.order_index}, Locked: ${isModuleLocked}`);

              return (
                <Card key={module.id} className={isModuleLocked ? "opacity-75" : ""}>
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm flex-shrink-0 ${isModuleLocked
                        ? "bg-dark-100 text-dark-400"
                        : "bg-primary-100 text-primary-700"
                        }`}>
                        {isModuleLocked ? "🔒" : moduleIndex + 1}
                      </div>
                      <h2 className={`font-semibold text-base sm:text-lg min-w-0 truncate ${isModuleLocked ? "text-dark-500" : "text-dark-900"
                        }`}>
                        {module.title}
                      </h2>
                      {isModuleLocked && (
                        <Badge variant="accent" className="flex-shrink-0 text-xs">
                          Pro
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      {module.lessons?.map((lesson) => (
                        <LessonRow key={lesson.id} lesson={lesson} isLocked={isModuleLocked} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}


function LessonRow({ lesson, isLocked = false }: { lesson: Lesson; isLocked?: boolean }) {
  const router = useRouter();
  const status = lesson.userProgress?.status || "not_started";

  const statusConfig = {
    completed: { badge: "success" as const, icon: "✓", text: "Done", fullText: "Completed" },
    in_progress: { badge: "accent" as const, icon: "▶", text: "Started", fullText: "In Progress" },
    not_started: { badge: "default" as const, icon: "○", text: "New", fullText: "Not Started" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_started;

  // Locked lessons: redirect to /pricing on click instead of opening the lesson
  if (isLocked) {
    return (
      <button
        onClick={() => router.push("/pricing")}
        className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl hover:bg-dark-50 transition-colors group w-full text-left opacity-60 cursor-pointer"
      >
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 border-2 border-dark-200 text-dark-300">
          🔒
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm sm:text-base text-dark-500 truncate">
            {lesson.title}
          </div>
          <div className="text-xs sm:text-sm text-dark-500">
            {lesson.estimated_minutes} min • {lesson.xp_reward} XP
          </div>
        </div>
        <Badge variant="accent" className="flex-shrink-0 text-xs sm:text-sm">
          Pro
        </Badge>
      </button>
    );
  }

  return (
    <Link
      href={`/lessons/${lesson.id}`}
      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl hover:bg-dark-50 transition-colors group"
    >
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${status === "completed"
          ? "bg-green-500 text-white"
          : status === "in_progress"
            ? "bg-accent-500 text-white"
            : "border-2 border-dark-300 text-dark-300"
          }`}
      >
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm sm:text-base transition-colors truncate text-dark-900 group-hover:text-primary-600">
          {lesson.title}
        </div>
        <div className="text-xs sm:text-sm text-dark-500">
          {lesson.estimated_minutes} min • {lesson.xp_reward} XP
          {lesson.is_free && <span className="ml-1 text-primary-600 text-xs">Free</span>}
        </div>
      </div>
      <Badge variant={config.badge} className="flex-shrink-0 text-xs sm:text-sm">
        <span className="hidden sm:inline">{config.fullText}</span>
        <span className="sm:hidden">{config.text}</span>
      </Badge>
    </Link>
  );
}
