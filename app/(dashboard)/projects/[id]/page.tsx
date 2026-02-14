"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CodePlayground } from "@/components/editor/code-playground";
import { useSubscription } from "@/hooks";
import { projects } from "../data";
import confetti from "canvas-confetti";
import { useToast } from "@/components/ui/use-toast";

export default function ProjectPage() {
  const params = useParams();
  const { isPro } = useSubscription();
  const { toast } = useToast();
  const projectId = params.id as string;
  const project = projects[projectId];

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [validationStatus, setValidationStatus] = useState<boolean | null>(null);
  const [showStepDrawer, setShowStepDrawer] = useState(false);
  const [previouslyCompleted, setPreviouslyCompleted] = useState(false);
  const [shouldCelebrate, setShouldCelebrate] = useState(false);
  const celebrationPerformed = useRef(false);

  // Check API for existing completion on mount
  useEffect(() => {
    if (!projectId) return;

    async function checkCompletion() {
      try {
        const res = await fetch("/api/projects/completed");
        if (res.ok) {
          const data = await res.json();
          if (data[projectId]) {
            setPreviouslyCompleted(true);
            // Restore all steps as completed
            if (project) {
              setCompletedSteps(project.steps.map((_, i) => i));
            }
          }
        }
      } catch (error) {
        console.error("Failed to check project completion:", error);
      }
    }
    checkCompletion();
  }, [projectId, project]);

  // Reset validation status when changing steps
  useEffect(() => {
    setValidationStatus(null);
  }, [currentStep]);

  // Handle completion side effects uniquely
  // Handle completion side effects uniquely
  useEffect(() => {
    if (shouldCelebrate && !celebrationPerformed.current) {
      celebrationPerformed.current = true;
      setPreviouslyCompleted(true);
      triggerCelebration();

      // Call API to mark completed
      fetch("/api/projects/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.xp_earned > 0) {
            toast({
              title: "Project Completed! 🎉",
              description: `You earned ${data.xp_earned} XP!`,
              variant: "default", // Success style
            });
          }
        })
        .catch(err => {
          console.error("Failed to save progress:", err);
          // If failed, maybe reset lock? keeping it locked avoids spam though.
        });
    }
  }, [shouldCelebrate, projectId, toast]);

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-900 mb-2">
            Project not found
          </h1>
          <Link href="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!project.isFree && !isPro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <span className="text-5xl mb-4">🔒</span>
        <h1 className="text-2xl font-bold text-dark-900 mb-2">Pro Project</h1>
        <p className="text-dark-500 mb-4">
          Upgrade to Pro to access this project and all others.
        </p>
        <div className="flex gap-3">
          <Link href="/projects">
            <Button variant="secondary">Back to Projects</Button>
          </Link>
          <Link href="/pricing">
            <Button>Upgrade to Pro</Button>
          </Link>
        </div>
      </div>
    );
  }

  const progress = project.steps.length > 0
    ? (completedSteps.length / project.steps.length) * 100
    : 0;
  const step = project.steps[currentStep];
  const isProjectComplete = completedSteps.length === project.steps.length;

  const handleStepComplete = () => {
    if (!completedSteps.includes(currentStep)) {
      const newCompleted = [...completedSteps, currentStep];
      setCompletedSteps(newCompleted);

      // Check if this was the last step
      if (newCompleted.length === project.steps.length) {
        if (!previouslyCompleted) {
          setShouldCelebrate(true);
        } else {
          // If already previously completed, just save the new local state without celebration
          setPreviouslyCompleted(true);
        }
      }
    }

    if (currentStep < project.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleTryAgain = () => {
    // Just reset local state, keep DB record
    setPreviouslyCompleted(false);
    setShouldCelebrate(false);
    celebrationPerformed.current = false;
    setCompletedSteps([]);
    setCurrentStep(0);
    setValidationStatus(null);
  };

  const triggerCelebration = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const handleCodeRun = (code: string, output: string) => {
    if (!step.expectedOutput) {
      if (output && output.trim().length > 0 && !output.includes("Error")) {
        setValidationStatus(true);
      }
    }
  };

  const handleSuccess = () => {
    setValidationStatus(true);
  };

  const handleFailure = () => {
    setValidationStatus(false);
  };

  const selectStep = (i: number) => {
    setCurrentStep(i);
    setShowStepDrawer(false);
  };

  // ── Shared step list component ──────────────────────────────
  const StepList = () => (
    <div className="space-y-2 overflow-y-auto flex-1 pr-2">
      {project.steps.map((s, i) => (
        <button
          key={i}
          onClick={() => selectStep(i)}
          className={`w-full text-left p-3 rounded-lg transition-all ${currentStep === i
            ? "bg-primary-100 border-l-4 border-primary-500"
            : "hover:bg-dark-50"
            }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${completedSteps.includes(i)
                ? "bg-green-500 text-white"
                : currentStep === i
                  ? "bg-primary-500 text-white"
                  : "bg-dark-200 text-dark-500"
                }`}
            >
              {completedSteps.includes(i) ? "✓" : i + 1}
            </span>
            <span
              className={`text-sm ${currentStep === i ? "font-medium" : ""
                }`}
            >
              {s.title}
            </span>
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] lg:h-[calc(100vh-2rem)] -m-4 sm:-m-6 lg:-m-8">
      {/* ── Mobile Header ────────────────────────────────────── */}
      <div className="lg:hidden bg-white border-b border-dark-200 p-4 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-2">
          <Link
            href="/projects"
            className="text-sm text-dark-500 hover:text-dark-700"
          >
            &larr; Back
          </Link>
          <Badge
            variant={
              project.difficulty === "beginner" ? "primary" : "accent"
            }
          >
            {project.difficulty}
          </Badge>
        </div>
        <h2 className="font-bold text-dark-900 text-base mb-2 truncate">
          {project.title}
        </h2>
        <div className="flex items-center gap-3 mb-2">
          <Progress value={progress} className="flex-1" />
          <span className="text-xs text-dark-500 shrink-0">
            {Math.round(progress)}%
          </span>
        </div>
        <button
          onClick={() => setShowStepDrawer(!showStepDrawer)}
          className="flex items-center gap-2 text-sm text-primary-600 font-medium w-full"
        >
          <span>Step {currentStep + 1} of {project.steps.length}: {step.title}</span>
          <span className="ml-auto text-xs">{showStepDrawer ? "▲" : "▼"}</span>
        </button>

        {/* Mobile step drawer */}
        {showStepDrawer && (
          <div className="mt-3 bg-dark-50 rounded-xl p-3 max-h-60 overflow-y-auto border border-dark-200 animate-in slide-in-from-top-2 duration-200">
            <StepList />
          </div>
        )}
      </div>

      {/* ── Desktop Sidebar ──────────────────────────────────── */}
      <div className="w-72 bg-white border-r border-dark-200 p-4 overflow-auto shrink-0 hidden lg:flex flex-col h-screen sticky top-0">
        <Link
          href="/projects"
          className="text-sm text-dark-500 hover:text-dark-700 mb-4 block"
        >
          &larr; Back to Projects
        </Link>

        <h2 className="font-bold text-lg text-dark-900 mb-2">
          {project.title}
        </h2>
        <div className="flex items-center gap-2 mb-4">
          <Badge
            variant={
              project.difficulty === "beginner" ? "primary" : "accent"
            }
          >
            {project.difficulty}
          </Badge>
          <span className="text-sm text-dark-500">
            {project.estimatedTime}
          </span>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-dark-600">Progress</span>
            <span className="text-dark-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <StepList />

        {/* Concepts */}
        <div className="mt-4 pt-4 border-t border-dark-200 shrink-0">
          <h3 className="text-xs font-semibold text-dark-500 uppercase mb-2">
            Concepts
          </h3>
          <div className="flex flex-wrap gap-1">
            {project.concepts.map((concept) => (
              <span
                key={concept}
                className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto bg-dark-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-dark-900 mb-2">
              Step {currentStep + 1}: {step.title}
            </h1>
            <p className="text-dark-600 mb-4 text-sm sm:text-base">{step.instruction}</p>

            {/* Validation Status Indicator */}
            {validationStatus === true && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <span>✓</span> Step Validated
              </div>
            )}
          </div>

          <div className="mb-6">
            <CodePlayground
              key={currentStep}
              initialCode={step.starterCode}
              expectedOutput={step.expectedOutput}
              onRun={handleCodeRun}
              onSuccess={handleSuccess}
              onFailure={handleFailure}
              projectContext={{
                title: project.title,
                description: project.description,
                stepInstruction: step.instruction,
              }}
            />
          </div>

          {step.hint && (
            <details className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
              <summary className="cursor-pointer text-sm font-medium text-primary-700">
                Show Hint
              </summary>
              <p className="text-dark-700 text-sm mt-2">{step.hint}</p>
            </details>
          )}

          <div className="flex justify-between mt-6">
            <Button
              variant="secondary"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              &larr; Previous
            </Button>

            {currentStep === project.steps.length - 1 ? (
              isProjectComplete ? (
                <Link href="/projects">
                  <Button>Back to Projects</Button>
                </Link>
              ) : (
                <Button
                  onClick={handleStepComplete}
                  disabled={!validationStatus && !completedSteps.includes(currentStep)}
                  className={(!validationStatus && !completedSteps.includes(currentStep)) ? "opacity-50 cursor-not-allowed" : ""}
                >
                  Complete Project 🎉
                </Button>
              )
            ) : (
              <Button
                onClick={handleStepComplete}
                disabled={!validationStatus && !completedSteps.includes(currentStep)}
                className={(!validationStatus && !completedSteps.includes(currentStep)) ? "opacity-50 cursor-not-allowed" : ""}
              >
                Next Step &rarr;
              </Button>
            )}
          </div>

          {!validationStatus && !completedSteps.includes(currentStep) && (
            <p className="text-xs text-center text-dark-400 mt-2">
              Run your code successfully to proceed to the next step.
            </p>
          )}

          {/* All steps completed */}
          {isProjectComplete && (
            <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6 sm:p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="text-5xl sm:text-6xl block mb-4 animate-bounce">🏆</span>
              <h3 className="text-xl sm:text-2xl font-bold text-dark-900 mb-2">
                Project Completed!
              </h3>
              <p className="text-dark-600 mb-6 text-base sm:text-lg">
                You earned {project.xpReward} XP. Amazing work mastering concepts like {project.concepts.slice(0, 2).join(", ")}!
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <Button onClick={handleTryAgain} variant="secondary">
                  Try Again 🔄
                </Button>
                <Button onClick={triggerCelebration} variant="secondary">
                  Celebrate Again 🎉
                </Button>
                <Link href="/projects">
                  <Button size="lg" className="w-full sm:w-auto">Find Another Project</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
