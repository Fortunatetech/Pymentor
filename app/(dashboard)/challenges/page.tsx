"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpgradePrompt } from "@/components/ui/upgrade-prompt";
import { CodePlayground } from "@/components/editor/code-playground";
import { useSubscription } from "@/hooks";
import { useUser } from "@/hooks/use-user";

import { PageLoading } from "@/components/ui/loading-spinner";

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

interface ChallengeHistory {
  id: string;
  challenge_id: string;
  title: string;
  difficulty: string;
  date: string;
  attempts_used: number;
  completed: boolean;
  xp_earned: number;
  max_xp: number;
}

export default function ChallengePage() {
  const { isPro, loading: subLoading } = useSubscription();
  const { refreshProfile } = useUser();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [showHints, setShowHints] = useState<boolean[]>([]);

  // Trial system state
  const [trialsRemaining, setTrialsRemaining] = useState(3);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState({ emoji: "", title: "", text: "" });

  // AI Diagnostics state
  const [error, setError] = useState<string | null>(null);
  const [showDiagnosticBanner, setShowDiagnosticBanner] = useState(false);
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);
  const [diagnosticExplanation, setDiagnosticExplanation] = useState("");
  const [isFetchingDiagnostics, setIsFetchingDiagnostics] = useState(false);

  // History state
  const [history, setHistory] = useState<ChallengeHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchChallenge();
    fetchHistory();
  }, []);

  async function fetchChallenge() {
    try {
      const res = await fetch("/api/challenges");
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          setChallenge(data);
          // Fetch attempt status for this challenge
          const attemptRes = await fetch(`/api/challenges/attempt?challenge_id=${data.id}`);
          if (attemptRes.ok) {
            const attemptData = await attemptRes.json();
            setTrialsRemaining(attemptData.trials_remaining);
            setCurrentAttempt(attemptData.attempts_used);
            if (attemptData.completed) {
              setCompleted(true);
              setXpAwarded(attemptData.xp_earned);
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch challenge:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchHistory() {
    try {
      const res = await fetch("/api/challenges/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  }

  const handleSuccess = async () => {
    if (!challenge || completed) return;

    setCompleted(true);
    const attemptNumber = currentAttempt + 1;

    try {
      const res = await fetch("/api/challenges/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenge_id: challenge.id,
          attempt_number: attemptNumber
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setXpAwarded(data.xp_earned);
        // Refresh profile so XP updates across dashboard & progress
        refreshProfile();

        // Show success popup based on attempt
        if (attemptNumber === 1) {
          setPopupMessage({
            emoji: "🎉",
            title: "PERFECT! First try!",
            text: `You earned ${data.xp_earned} XP! You're on fire!`
          });
        } else if (attemptNumber === 2) {
          setPopupMessage({
            emoji: "💪",
            title: "Nice recovery!",
            text: `You earned ${data.xp_earned} XP! Great persistence!`
          });
        } else {
          setPopupMessage({
            emoji: "🌟",
            title: "Persistence pays off!",
            text: `You earned ${data.xp_earned} XP! Never give up!`
          });
        }
        setShowPopup(true);
      }
    } catch {
      // Best-effort XP award
    }
  };

  const handleAttemptFailed = useCallback(async () => {
    if (!challenge || completed) return;

    try {
      const res = await fetch("/api/challenges/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge_id: challenge.id, passed: false }),
      });

      if (res.ok) {
        const data = await res.json();
        setTrialsRemaining(data.trials_remaining);
        setCurrentAttempt(data.attempts_used);

        if (data.trials_remaining === 0) {
          // Show "See you tomorrow" popup
          setPopupMessage({
            emoji: "📚",
            title: "See you tomorrow!",
            text: "Review the solution below and try again with a new challenge tomorrow!"
          });
          setShowPopup(true);
          setShowSolution(true);
        } else if (data.trials_remaining === 2) {
          setPopupMessage({
            emoji: "😊",
            title: "2 tries left!",
            text: "You've got this! Take a moment to review your code."
          });
          setShowPopup(true);
        } else if (data.trials_remaining === 1) {
          setPopupMessage({
            emoji: "🤔",
            title: "One more shot!",
            text: "Think it through carefully. You can do it!"
          });
          setShowPopup(true);
        }
      }
    } catch {
      // Best-effort attempt tracking
    }
  }, [challenge, completed]);

  const handleCodeRun = useCallback((code: string, output: string) => {
    // Check if there's an error in the output
    if (output.includes("Error") || output.includes("Traceback")) {
      setError(output);
      setShowDiagnosticBanner(true);
    } else {
      setError(null);
      setShowDiagnosticBanner(false);
    }
  }, []);

  const fetchDiagnostics = async () => {
    if (!error) return;
    setIsFetchingDiagnostics(true);
    setIsDiagnosticModalOpen(true);
    setDiagnosticExplanation("");

    try {
      const res = await fetch("/api/ai/explain-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: challenge?.starter_code,
          error,
          context: "daily_challenge"
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch diagnostics");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                setDiagnosticExplanation((prev) => prev + data.text);
              }
            } catch (e) {
              console.error("Error parsing stream:", e);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setDiagnosticExplanation("Oops! Py couldn't analyze the error right now. Check your syntax!");
    } finally {
      setIsFetchingDiagnostics(false);
    }
  };

  const toggleHint = (index: number) => {
    setShowHints((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  if (loading || subLoading) {
    return <PageLoading title="Loading challenge..." />;
  }

  if (!isPro) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <UpgradePrompt variant="challenge-locked" />
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
    <div className="max-w-4xl mx-auto">
      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in duration-200">
            <span className="text-6xl block mb-4">{popupMessage.emoji}</span>
            <h2 className="text-2xl font-bold text-dark-900 mb-2">{popupMessage.title}</h2>
            <p className="text-dark-600 mb-6">{popupMessage.text}</p>
            <Button onClick={() => setShowPopup(false)}>Continue</Button>
          </div>
        </div>
      )}

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

      {/* Trials Indicator */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-dark-700">Trials remaining:</span>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full ${i < trialsRemaining
                      ? "bg-primary-500"
                      : "bg-dark-200"
                      }`}
                  />
                ))}
              </div>
              <span className="text-sm text-dark-500">({trialsRemaining}/3)</span>
            </div>
            {completed && (
              <Badge variant="primary">✓ Completed - {xpAwarded} XP earned</Badge>
            )}
          </div>
        </CardContent>
      </Card>

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
          onFailure={handleAttemptFailed}
          onRun={handleCodeRun}
          readOnly={completed || trialsRemaining === 0}
        />
      </div>

      {/* AI Diagnostic Banner */}
      {showDiagnosticBanner && error && !completed && trialsRemaining > 0 && (
        <Card className="mb-6 border-primary-300 bg-primary-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                  Py
                </div>
                <div>
                  <p className="font-medium text-dark-900">Hit a snag?</p>
                  <p className="text-sm text-dark-600">Py can help you debug!</p>
                </div>
              </div>
              <Button size="sm" onClick={fetchDiagnostics}>
                Run Py&apos;s Diagnostics
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Solution Toggle - Only show after all trials used or completed */}
      {(trialsRemaining === 0 || completed) && (
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
      )}

      {/* Completion Banner */}
      {completed && (
        <Card className="border-primary-300 bg-primary-50 mb-6">
          <CardContent className="p-6 text-center">
            <span className="text-4xl block mb-2">🎉</span>
            <h3 className="text-lg font-bold text-dark-900 mb-1">
              Challenge Completed!
            </h3>
            <p className="text-dark-500 mb-4">
              You earned {xpAwarded} XP. Come back tomorrow for a new challenge!
            </p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* See You Tomorrow Banner (when failed all trials) */}
      {trialsRemaining === 0 && !completed && (
        <Card className="border-amber-300 bg-amber-50 mb-6">
          <CardContent className="p-6 text-center">
            <span className="text-4xl block mb-2">📚</span>
            <h3 className="text-lg font-bold text-dark-900 mb-1">
              See you tomorrow!
            </h3>
            <p className="text-dark-500 mb-4">
              Review the solution above and try again with a new challenge tomorrow!
            </p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Challenge History */}
      <Card>
        <CardContent className="p-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-lg font-semibold text-dark-900 w-full"
          >
            <span className="text-xl">📜</span>
            Challenge History
            <span className="ml-auto text-sm text-dark-400">
              {showHistory ? "▼" : "▶"}
            </span>
          </button>

          {showHistory && (
            <div className="mt-4 space-y-3">
              {history.length === 0 ? (
                <p className="text-dark-500 text-sm">No challenge history yet. Complete your first challenge!</p>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-dark-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className={item.completed ? "text-green-500" : "text-red-500"}>
                        {item.completed ? "✓" : "✗"}
                      </span>
                      <div>
                        <p className="font-medium text-dark-900">{item.title}</p>
                        <p className="text-xs text-dark-500">
                          {new Date(item.date).toLocaleDateString()} • {item.attempts_used} attempt{item.attempts_used !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <Badge variant={item.completed ? "primary" : "default"}>
                      {item.completed ? `+${item.xp_earned} XP` : "0 XP"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diagnostic Modal */}
      {isDiagnosticModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-dark-100 flex items-center justify-between bg-dark-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                  Py
                </div>
                <div>
                  <h3 className="font-bold text-dark-900">Py&apos;s Diagnostic Clinic</h3>
                  <p className="text-xs text-dark-500 uppercase tracking-wider">Expert Debugger Mode</p>
                </div>
              </div>
              <button
                onClick={() => setIsDiagnosticModalOpen(false)}
                className="text-dark-400 hover:text-dark-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              {isFetchingDiagnostics ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-primary-100 border-t-primary-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-xl">🔍</div>
                  </div>
                  <p className="text-dark-900 font-bold">Analyzing your code...</p>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  {diagnosticExplanation ? (
                    <ReactMarkdown>{diagnosticExplanation}</ReactMarkdown>
                  ) : (
                    <p className="text-dark-500">No explanation generated.</p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-dark-50 border-t border-dark-100 flex justify-end">
              <Button onClick={() => setIsDiagnosticModalOpen(false)}>
                Got it, back to work
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
