"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CodePlayground } from "@/components/editor/code-playground";
import { useLessonTimer } from "@/hooks/use-lesson-timer";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface LessonData {
  id: string;
  title: string;
  estimated_minutes: number;
  xp_reward: number;
  content: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sections: any[];
  };
  module: {
    title: string;
    path: {
      title: string;
    };
  };
  prevLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
  userProgress: { status: string; score: number | null } | null;
}

interface CompletionResult {
  xp_earned: number;
  streak_days: number;
  concepts_updated: string[];
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [showHint, setShowHint] = useState<number | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completionResult, setCompletionResult] =
    useState<CompletionResult | null>(null);

  // Time tracking
  const { stopAndGetTime } = useLessonTimer(lessonId);

  const lessonStatusRef = useRef<string>("not_started");

  useEffect(() => {
    async function fetchLesson() {
      try {
        const res = await fetch(`/api/lessons/${lessonId}`);
        if (!res.ok) {
          setError("Lesson not found");
          return;
        }
        const data = await res.json();
        setLesson(data);

        const currentStatus = data.userProgress?.status || "not_started";
        lessonStatusRef.current = currentStatus;

        // Mark as in_progress only if truly not started
        if (currentStatus === "not_started") {
          fetch(`/api/lessons/${lessonId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "in_progress" }),
          });
        }
      } catch {
        setError("Failed to load lesson");
      } finally {
        setLoading(false);
      }
    }
    fetchLesson();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-dark-500">Loading lesson...</div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="text-dark-500">{error || "Lesson not found"}</div>
        <Link href="/lessons">
          <Button variant="secondary">Back to Lessons</Button>
        </Link>
      </div>
    );
  }

  const sections = lesson.content?.sections || [];
  const exerciseCount = sections.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (s: any) => s.type === "exercise"
  ).length;
  const previouslyCompleted = lesson.userProgress?.status === "completed";
  const isLessonComplete =
    previouslyCompleted ||
    (completedExercises.length === exerciseCount && exerciseCount > 0);
  const pathTitle = lesson.module?.path?.title || "";
  const moduleTitle = lesson.module?.title || "";

  const handleExerciseComplete = (index: number) => {
    if (!completedExercises.includes(index)) {
      setCompletedExercises([...completedExercises, index]);
    }
  };

  const handleLessonComplete = async () => {
    setCompleting(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          timeSpent: stopAndGetTime(), // Use accurate idle-aware time
        }),
      });
      const result = await res.json();
      if (result.xp_earned > 0) {
        // First-time completion: show XP and streak
        setCompletionResult(result);
        setTimeout(() => {
          router.push(
            lesson.nextLesson
              ? `/lessons/${lesson.nextLesson.id}`
              : "/lessons"
          );
        }, 3000);
      } else {
        // Already completed before: navigate immediately
        router.push(
          lesson.nextLesson
            ? `/lessons/${lesson.nextLesson.id}`
            : "/lessons"
        );
      }
    } catch (err) {
      console.error("Failed to complete lesson:", err);
      setCompleting(false);
    }
  };

  let exerciseIndex = 0;

  return (
    <div className="flex min-h-screen -mx-4 -mb-4 lg:-m-8">
      {/* Left: Lesson Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto bg-white lg:border-r border-dark-200">
        <div className="max-w-2xl mx-auto">
          {/* Completion feedback overlay */}
          {completionResult && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center shadow-xl">
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🎉</div>
                <h2 className="text-xl sm:text-2xl font-bold text-dark-900 mb-2">
                  Lesson Complete!
                </h2>
                <div className="space-y-2 text-dark-600">
                  <p className="text-lg font-semibold text-primary-600">
                    +{completionResult.xp_earned} XP
                  </p>
                  {completionResult.streak_days > 0 && (
                    <p>
                      🔥 {completionResult.streak_days} day streak!
                    </p>
                  )}
                  {completionResult.concepts_updated.length > 0 && (
                    <p className="text-sm">
                      Concepts practiced:{" "}
                      {completionResult.concepts_updated.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-dark-500 mb-4 sm:mb-6">
            <Link href="/lessons" className="hover:text-dark-700 truncate">
              {pathTitle}
            </Link>
            <span className="flex-shrink-0">&rsaquo;</span>
            <span className="truncate">{moduleTitle}</span>
          </div>

          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-900 mb-2">
              {lesson.title}
            </h1>
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-dark-500">
              <span>{lesson.estimated_minutes} min</span>
              <span>{lesson.xp_reward} XP</span>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3 mb-6 sm:mb-8 p-3 sm:p-4 bg-dark-50 rounded-xl">
            <Progress
              value={
                exerciseCount > 0
                  ? Math.round(
                    (completedExercises.length / exerciseCount) * 100
                  )
                  : 0
              }
              className="flex-1"
            />
            <span className="text-sm text-dark-500">
              {exerciseCount > 0
                ? `${completedExercises.length}/${exerciseCount} exercises`
                : "No exercises"}
            </span>
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {sections.map((section: any, index: number) => {
              if (section.type === "text") {
                return (
                  <div
                    key={index}
                    className="text-dark-600 leading-relaxed prose prose-sm sm:prose-base max-w-none
                      prose-headings:text-dark-900 prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-3
                      prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                      prose-p:mb-4 prose-p:leading-relaxed
                      prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
                      prose-strong:text-dark-800 prose-strong:font-semibold
                      prose-ul:my-3 prose-ol:my-3 prose-li:my-1
                      prose-blockquote:border-primary-300 prose-blockquote:text-dark-500 prose-blockquote:italic
                      prose-pre:bg-transparent prose-pre:p-0
                      prose-img:rounded-xl prose-img:shadow-sm"
                  >
                    <ReactMarkdown
                      components={{
                        code({ className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          const inline = !match;
                          if (inline) {
                            return (
                              <code
                                className="bg-dark-100 px-1.5 py-0.5 rounded text-sm font-mono text-dark-700"
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          }
                          return (
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                              className="rounded-xl !my-3"
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          );
                        },
                      }}
                    >
                      {section.content}
                    </ReactMarkdown>
                  </div>
                );
              }

              if (section.type === "code") {
                return (
                  <div key={index} className="rounded-xl overflow-hidden !my-3">
                    <SyntaxHighlighter
                      style={oneDark}
                      language={section.language || "python"}
                      PreTag="div"
                      className="rounded-xl"
                    >
                      {section.code}
                    </SyntaxHighlighter>
                  </div>
                );
              }

              if (section.type === "callout") {
                const variants: Record<
                  string,
                  { bg: string; border: string; icon: string }
                > = {
                  tip: {
                    bg: "bg-primary-50",
                    border: "border-primary-200",
                    icon: "💡",
                  },
                  warning: {
                    bg: "bg-yellow-50",
                    border: "border-yellow-200",
                    icon: "⚠️",
                  },
                  info: {
                    bg: "bg-blue-50",
                    border: "border-blue-200",
                    icon: "ℹ️",
                  },
                  important: {
                    bg: "bg-red-50",
                    border: "border-red-200",
                    icon: "❗",
                  },
                };
                const v = variants[section.variant] || variants.info;

                return (
                  <div
                    key={index}
                    className={`${v.bg} ${v.border} border rounded-xl p-4 flex gap-3`}
                  >
                    <span className="text-xl flex-shrink-0">{v.icon}</span>
                    <div className="text-dark-700 prose prose-sm max-w-none prose-p:mb-2 prose-p:last:mb-0">
                      <ReactMarkdown>{section.content}</ReactMarkdown>
                    </div>
                  </div>
                );
              }

              if (section.type === "exercise") {
                const currentExerciseIndex = exerciseIndex;
                exerciseIndex++;
                const isCompleted =
                  completedExercises.includes(currentExerciseIndex);

                return (
                  <div
                    key={index}
                    className={`border-2 rounded-xl p-3 sm:p-6 ${isCompleted
                      ? "border-green-300 bg-green-50/30"
                      : "border-primary-200 bg-primary-50/30"
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <Badge
                        variant={isCompleted ? "success" : "primary"}
                      >
                        {isCompleted ? "Completed" : "Exercise"}
                      </Badge>
                      <span className="text-sm text-dark-500">
                        {isCompleted ? "Great work!" : "Your turn!"}
                      </span>
                    </div>

                    <p className="text-dark-700 font-medium mb-4">
                      {section.prompt}
                    </p>

                    <CodePlayground
                      lessonId={lessonId}
                      initialCode={section.starter}
                      expectedOutput={section.expectedOutput}
                      onSuccess={() =>
                        handleExerciseComplete(currentExerciseIndex)
                      }
                      onRun={(code, output) => {
                        // Only auto-complete for open-ended exercises (no expectedOutput)
                        if (section.expectedOutput) return;

                        // Code must have changed from the starter
                        const starterNorm = (section.starter || "").replace(/\s+/g, "").replace(/#.*/g, "");
                        const codeNorm = code.replace(/\s+/g, "").replace(/#.*/g, "");
                        if (codeNorm === starterNorm || codeNorm.length <= starterNorm.length) return;

                        // Must have output without errors
                        if (!output || output.includes("Error") || output.includes("Traceback")) return;
                        if (output.trim().length === 0) return;

                        // Check required patterns if specified
                        if (section.requiredPatterns && Array.isArray(section.requiredPatterns)) {
                          const missing = section.requiredPatterns.some(
                            (pattern: string) => !code.includes(pattern)
                          );
                          if (missing) return;
                        }

                        handleExerciseComplete(currentExerciseIndex);
                      }}
                    />

                    {/* Completion message */}
                    {isCompleted && (
                      <div className="mt-4 flex items-center gap-2 p-3 bg-green-100 rounded-lg border border-green-200">
                        <span className="text-lg">🎉</span>
                        <span className="text-sm font-medium text-green-800">
                          Nicely done! You nailed this exercise. Keep going!
                        </span>
                      </div>
                    )}

                    {/* Hints */}
                    {section.hints && section.hints.length > 0 && !isCompleted && (
                      <div className="mt-4">
                        <button
                          onClick={() =>
                            setShowHint(
                              showHint === currentExerciseIndex
                                ? null
                                : currentExerciseIndex
                            )
                          }
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          {showHint === currentExerciseIndex
                            ? "Hide hints"
                            : "Need a hint?"}
                        </button>
                        {showHint === currentExerciseIndex && (
                          <ul className="mt-2 space-y-1">
                            {section.hints.map(
                              (hint: string, i: number) => (
                                <li
                                  key={i}
                                  className="text-sm text-dark-600 flex gap-2"
                                >
                                  <span>💡</span> {hint}
                                </li>
                              )
                            )}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              return null;
            })}
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-dark-200">
            {lesson.prevLesson ? (
              <Link href={`/lessons/${lesson.prevLesson.id}`} className="min-w-0">
                <Button variant="ghost" className="w-full sm:w-auto text-sm">
                  <span className="truncate">&larr; {lesson.prevLesson.title}</span>
                </Button>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}

            {isLessonComplete || exerciseCount === 0 ? (
              <Button onClick={handleLessonComplete} disabled={completing} className="text-sm sm:text-base">
                {completing
                  ? "Completing..."
                  : lesson.nextLesson
                    ? `Next: ${lesson.nextLesson.title}`
                    : "Complete Lesson"}
              </Button>
            ) : (
              <Button disabled className="text-xs sm:text-sm">
                Complete exercises ({completedExercises.length}/{exerciseCount})
              </Button>
            )}
          </div>

          {/* Mobile: Ask Py Button */}
          <div className="lg:hidden mt-6 sm:mt-8 p-3 sm:p-4 bg-primary-50 rounded-xl border border-primary-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                Py
              </div>
              <div className="flex-1">
                <p className="font-medium text-dark-900">Need help?</p>
                <p className="text-sm text-dark-500">Chat with Py about this lesson</p>
              </div>
              <Link href={`/chat?lesson_id=${lessonId}&lesson_title=${encodeURIComponent(lesson.title)}`}>
                <Button size="sm">Ask Py</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right: AI Chat Sidebar */}
      <div className="w-96 bg-dark-50 flex-col hidden lg:flex">
        <div className="p-4 border-b border-dark-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white">
              Py
            </div>
            <div>
              <div className="font-semibold text-dark-900">Need help?</div>
              <div className="text-xs text-dark-500">
                Ask Py about this lesson
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">Py</div>
            <p className="text-dark-500 text-sm mb-4">
              Stuck on something? I&apos;m here to help you understand{" "}
              {lesson.title}!
            </p>
            <Link href={`/chat?lesson_id=${lessonId}&lesson_title=${encodeURIComponent(lesson.title)}`}>
              <Button variant="secondary" size="sm">
                Chat with Py
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
