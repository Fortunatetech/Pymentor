"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CodePlayground } from "@/components/editor/code-playground";
import { useSubscription } from "@/hooks";
import { projects } from "../data";
import confetti from "canvas-confetti";

export default function ProjectPage() {
  const params = useParams();
  const { isPro } = useSubscription();
  const projectId = params.id as string;
  const project = projects[projectId];

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  // validationStatus: null = not run, false = failed, true = passed
  const [validationStatus, setValidationStatus] = useState<boolean | null>(null);

  // Reset validation status when changing steps
  useEffect(() => {
    setValidationStatus(null);
  }, [currentStep]);

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

  const handleStepComplete = () => {
    if (!completedSteps.includes(currentStep)) {
      const newCompleted = [...completedSteps, currentStep];
      setCompletedSteps(newCompleted);

      // Check if this was the last step
      if (newCompleted.length === project.steps.length) {
        triggerCelebration();
      }
    }

    if (currentStep < project.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const triggerCelebration = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

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
    // If we have an expected output, strict check is handled by onSuccess prop
    // If NO expected output, simply running the code without error count as success
    if (!step.expectedOutput) {
      // Simple heuristic: if output is not empty and doesn't look like a traceback
      // Note: The playground handles error display, but we get raw output here.
      // However, CodePlayground passes clean error as output on failure.
      // We can rely on CodePlayground's internal state via onSuccess/onFailure props mostly.

      // Ideally we'd check if output contains "Traceback" or "Error", but CodePlayground
      // cleans it.
      // Let's assume onRun is called with the output. 
      // We'll trust the user if it ran and produced output.
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

  return (
    <div className="-m-8 min-h-screen flex">
      {/* Left Sidebar - Steps */}
      <div className="w-72 bg-white border-r border-dark-200 p-4 overflow-auto shrink-0 flex flex-col h-screen sticky top-0">
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

        <div className="space-y-2 overflow-y-auto flex-1 pr-2">
          {project.steps.map((s, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
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

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto bg-dark-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-dark-900 mb-2">
              Step {currentStep + 1}: {step.title}
            </h1>
            <p className="text-dark-600 mb-4">{step.instruction}</p>

            {/* Validation Status Indicator */}
            {validationStatus === true && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <span>✓</span> Step Validated
              </div>
            )}
          </div>

          <div className="flex gap-4 items-start mb-6">
            <div className="flex-1">
              <CodePlayground
                key={currentStep} // Force reset on step change
                initialCode={step.starterCode}
                expectedOutput={step.expectedOutput}
                onRun={handleCodeRun}
                onSuccess={handleSuccess}
                onFailure={handleFailure}
              />
            </div>
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
              completedSteps.length === project.steps.length ? (
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
          {completedSteps.length === project.steps.length && (
            <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="text-6xl block mb-4 animate-bounce">🏆</span>
              <h3 className="text-2xl font-bold text-dark-900 mb-2">
                Project Completed!
              </h3>
              <p className="text-dark-600 mb-6 text-lg">
                You earned {project.xpReward} XP. Amazing work mastering concepts like {project.concepts.slice(0, 2).join(", ")}!
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={triggerCelebration} variant="secondary">
                  Celebrate Again 🎉
                </Button>
                <Link href="/projects">
                  <Button size="lg">Find Another Project</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
