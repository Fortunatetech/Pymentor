"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CodePlayground } from "@/components/editor/code-playground";
import { useUser } from "@/hooks/use-user";

interface TestCase {
  input: string;
  expected_output: string;
  description?: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  prompt: string;
  starter_code: string;
  solution_code: string;
  test_cases: TestCase[];
  hints: string[];
  xp_reward: number;
  date: string;
}

export default function ChallengePage() {
  const { profile } = useUser();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showHints, setShowHints] = useState<boolean[]>([]);

  useEffect(() => {
    async function fetchChallenge() {
      try {
        const res = await fetch("/api/challenges");
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) {
            setChallenge(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch challenge:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchChallenge();
  }, []);

  const handleSuccess = async () => {
    setCompleted(true);

    if (!xpAwarded && challenge) {
      setXpAwarded(true);
      try {
        // Award XP by completing a "challenge" via the lessons endpoint pattern
        await fetch("/api/challenges/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challenge_id: challenge.id }),
        });
      } catch {
        // XP award is best-effort
      }
    }
  };

  const toggleHint = (index: number) => {
    setShowHints((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-dark-500">Loading challenge...</div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <span className="text-5xl mb-4">🎯</span>
        <h1 className="text-2xl font-bold text-dark-900 mb-2">
          No Challenge Today
        </h1>
        <p className="text-dark-500 mb-4">
          Check back tomorrow for a new daily challenge!
        </p>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🎯</span>
            <h1 className="text-2xl font-bold text-dark-900">
              Daily Challenge
            </h1>
          </div>
          <p className="text-dark-500 text-sm">
            {new Date(challenge.date).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          <Badge variant="accent">+{challenge.xp_reward} XP</Badge>
        </div>
      </div>

      {/* Challenge Description */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="font-semibold text-lg text-dark-900 mb-2">
            {challenge.title}
          </h2>
          <p className="text-dark-600 mb-4">{challenge.description}</p>
          <div className="bg-dark-50 rounded-lg p-4">
            <p className="text-dark-700 text-sm font-medium">
              {challenge.prompt}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Code Playground */}
      <div className="mb-6">
        <CodePlayground
          initialCode={challenge.starter_code || "# Write your solution here\n"}
          testCases={challenge.test_cases && challenge.test_cases.length > 0 ? challenge.test_cases : undefined}
          onSuccess={handleSuccess}
          onRun={(code, output) => {
            if (output && !output.includes("Error") && !output.includes("Traceback")) {
              // Successfully ran without errors
            }
          }}
        />
      </div>

      {/* Hints */}
      {challenge.hints && challenge.hints.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-dark-900 mb-3">
              Hints ({challenge.hints.length})
            </h3>
            <div className="space-y-3">
              {challenge.hints.map((hint, i) => (
                <div key={i}>
                  <button
                    onClick={() => toggleHint(i)}
                    className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    <span>{showHints[i] ? "▼" : "▶"}</span>
                    Hint {i + 1}
                  </button>
                  {showHints[i] && (
                    <div className="mt-2 ml-5 p-3 bg-primary-50 rounded-lg text-sm text-dark-700 border border-primary-100">
                      {hint}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Solution Toggle */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="flex items-center gap-2 text-sm font-medium text-dark-600 hover:text-dark-800"
          >
            <span>{showSolution ? "▼" : "▶"}</span>
            {showSolution ? "Hide Solution" : "Show Solution"}
          </button>
          {showSolution && challenge.solution_code && (
            <div className="mt-4 bg-dark-900 rounded-xl p-4 overflow-x-auto">
              <pre className="text-sm font-mono text-green-400">
                <code>{challenge.solution_code}</code>
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completion Banner */}
      {completed && (
        <Card className="border-primary-300 bg-primary-50">
          <CardContent className="p-6 text-center">
            <span className="text-4xl block mb-2">🎉</span>
            <h3 className="text-lg font-bold text-dark-900 mb-1">
              Challenge Completed!
            </h3>
            <p className="text-dark-500 mb-4">
              You earned {challenge.xp_reward} XP. Come back tomorrow for a new
              challenge!
            </p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
