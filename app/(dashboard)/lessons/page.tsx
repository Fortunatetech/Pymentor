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
      if (data.length > 0) {
        setSelectedPath(data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentPath = paths.find(p => p.id === selectedPath);
  
  const calculateProgress = (path: LearningPath) => {
    const allLessons = path.modules?.flatMap(m => m.lessons) || [];
    const completed = allLessons.filter(l => l.userProgress?.status === "completed").length;
    return allLessons.length > 0 ? Math.round((completed / allLessons.length) * 100) : 0;
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
        {paths.map((path) => (
          <button
            key={path.id}
            onClick={() => setSelectedPath(path.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl whitespace-nowrap transition-all ${
              selectedPath === path.id
                ? "bg-primary-100 border-2 border-primary-500"
                : "bg-white border border-dark-200 hover:border-dark-300"
            }`}
          >
            <span className="text-2xl">{path.icon}</span>
            <div className="text-left">
              <div className="font-medium text-dark-900">{path.title}</div>
              <div className="text-xs text-dark-500">{calculateProgress(path)}% complete</div>
            </div>
          </button>
        ))}
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
              <Progress value={calculateProgress(currentPath)} className="flex-1 max-w-md" />
              <span className="text-sm text-dark-500">{calculateProgress(currentPath)}% complete</span>
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
                      <LessonRow key={lesson.id} lesson={lesson} />
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

function LessonRow({ lesson }: { lesson: Lesson }) {
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
          className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
            status === "completed"
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
