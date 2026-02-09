"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

const STEPS = [
  {
    title: "What's your Python experience?",
    subtitle: "This helps Py tailor lessons to your level.",
    field: "skill_level" as const,
    options: [
      { value: "beginner", label: "Beginner", icon: "🌱", description: "New to coding or just starting out" },
      { value: "intermediate", label: "Intermediate", icon: "🌿", description: "Know the basics, ready to level up" },
      { value: "advanced", label: "Advanced", icon: "🌳", description: "Comfortable with Python, want to master it" },
    ],
  },
  {
    title: "What's your learning goal?",
    subtitle: "We'll personalize your journey based on this.",
    field: "learning_goal" as const,
    options: [
      { value: "general", label: "General Programming", icon: "💻", description: "Learn Python as a versatile skill" },
      { value: "automation", label: "Automation", icon: "🤖", description: "Automate tasks and workflows" },
      { value: "data", label: "Data Analysis", icon: "📊", description: "Work with data and visualizations" },
      { value: "web", label: "Web Development", icon: "🌐", description: "Build web apps and APIs" },
    ],
  },
];

const DAILY_GOALS = [
  { value: "5", label: "5 min", description: "Quick daily check-in" },
  { value: "15", label: "15 min", description: "Recommended" },
  { value: "30", label: "30 min", description: "Committed" },
  { value: "60", label: "60 min", description: "Power learner" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({
    daily_goal_minutes: "15", // Default
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  const handleSelect = (value: string) => {
    setSelections({ ...selections, [currentStep.field]: value });
  };

  const saveAndRedirect = async (useDefaults = false) => {
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to complete onboarding.");
        setSaving(false);
        return;
      }

      const profileData = useDefaults
        ? {
            skill_level: "beginner",
            learning_goal: "general",
            daily_goal_minutes: 15,
          }
        : {
            skill_level: selections.skill_level || "beginner",
            learning_goal: selections.learning_goal || "general",
            daily_goal_minutes: parseInt(selections.daily_goal_minutes || "15", 10),
          };

      const { error: updateError } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", user.id);

      if (updateError) {
        console.error("Failed to update profile:", updateError);
        setError("Failed to save your preferences. Please try again.");
        setSaving(false);
        return;
      }

      // Use window.location to force full page reload and fresh profile data
      window.location.href = "/dashboard?tour=true";
    } catch (err) {
      console.error("Failed to save onboarding:", err);
      setError("An unexpected error occurred. Please try again.");
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (!isLastStep) {
      setStep(step + 1);
      return;
    }
    // Final step — save to Supabase
    await saveAndRedirect(false);
  };

  const handleSkip = async () => {
    await saveAndRedirect(true);
  };

  const selectedValue = selections[currentStep.field];

  return (
    <div className="min-h-screen bg-dark-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header with logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-3xl">🐍</span>
            <span className="font-bold text-xl text-dark-900">PyMentor AI</span>
          </div>
          <p className="text-dark-500 text-sm">Let&apos;s personalize your learning experience</p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i <= step ? "bg-primary-500" : "bg-dark-200"
              }`}
              aria-label={`Step ${i + 1} ${i <= step ? "(completed)" : ""}`}
            />
          ))}
        </div>

        <Card>
          <CardContent className="p-6 sm:p-8">
            <h1 className="text-xl sm:text-2xl font-bold text-dark-900 mb-1 text-center">
              {currentStep.title}
            </h1>
            <p className="text-dark-500 text-center mb-6 text-sm">
              {currentStep.subtitle}
            </p>

            <div className="space-y-2.5">
              {currentStep.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedValue === option.value
                      ? "border-primary-500 bg-primary-50"
                      : "border-dark-200 hover:border-dark-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{option.icon}</span>
                    <div>
                      <div className="font-medium text-dark-900">{option.label}</div>
                      <div className="text-sm text-dark-500">{option.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Daily goal selector on last step */}
            {isLastStep && selectedValue && (
              <div className="mt-6 pt-6 border-t border-dark-100">
                <p className="text-sm font-medium text-dark-700 mb-3">Daily learning goal (optional)</p>
                <div className="flex gap-2">
                  {DAILY_GOALS.map((goal) => (
                    <button
                      key={goal.value}
                      onClick={() => setSelections({ ...selections, daily_goal_minutes: goal.value })}
                      className={`flex-1 py-2 px-3 rounded-lg text-center transition-all ${
                        selections.daily_goal_minutes === goal.value
                          ? "bg-primary-500 text-white"
                          : "bg-dark-100 text-dark-600 hover:bg-dark-200"
                      }`}
                    >
                      <div className="text-sm font-medium">{goal.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg mt-4">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between mt-8">
              {step > 0 ? (
                <Button variant="ghost" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              ) : (
                <Button variant="ghost" onClick={handleSkip} disabled={saving}>
                  Skip for now
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={!selectedValue || saving}
              >
                {saving ? "Saving..." : isLastStep ? "Get Started" : "Next"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Skip notice */}
        {step === 0 && (
          <p className="text-center text-xs text-dark-400 mt-4">
            You can always update these in Settings later
          </p>
        )}
      </div>
    </div>
  );
}
