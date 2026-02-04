"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

const STEPS = [
  {
    title: "What's your Python experience?",
    subtitle: "This helps Py tailor lessons to your level.",
    field: "skill_level" as const,
    options: [
      { value: "beginner", label: "Beginner", description: "I've never coded before or just starting out" },
      { value: "intermediate", label: "Intermediate", description: "I know the basics and want to go further" },
      { value: "advanced", label: "Advanced", description: "I'm comfortable with Python and want to master it" },
    ],
  },
  {
    title: "What do you want to learn Python for?",
    subtitle: "We'll recommend the best learning path for you.",
    field: "learning_goal" as const,
    options: [
      { value: "general", label: "General Programming", description: "Learn Python as a general-purpose language" },
      { value: "automation", label: "Automation", description: "Automate tasks, scripts, and workflows" },
      { value: "data", label: "Data Analysis", description: "Work with data, pandas, and visualizations" },
      { value: "web", label: "Web Development", description: "Build web apps and APIs" },
    ],
  },
  {
    title: "Set your daily learning goal",
    subtitle: "Consistency is key. Even a few minutes a day makes a difference!",
    field: "daily_goal_minutes" as const,
    options: [
      { value: "5", label: "5 minutes", description: "Quick daily check-in" },
      { value: "15", label: "15 minutes", description: "Steady learner (recommended)" },
      { value: "30", label: "30 minutes", description: "Committed learner" },
      { value: "60", label: "60 minutes", description: "Power learner" },
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const currentStep = STEPS[step];

  const handleSelect = (value: string) => {
    setSelections({ ...selections, [currentStep.field]: value });
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    // Final step — save to Supabase
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("profiles")
          .update({
            skill_level: selections.skill_level || "beginner",
            learning_goal: selections.learning_goal || "general",
            daily_goal_minutes: parseInt(selections.daily_goal_minutes || "15", 10),
          })
          .eq("id", user.id);
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to save onboarding:", err);
      router.push("/dashboard");
    }
  };

  const selectedValue = selections[currentStep.field];

  return (
    <div className="min-h-screen bg-dark-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i <= step ? "bg-primary-500" : "bg-dark-200"
              }`}
            />
          ))}
        </div>

        <Card>
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold text-dark-900 mb-2 text-center">
              {currentStep.title}
            </h1>
            <p className="text-dark-500 text-center mb-8">
              {currentStep.subtitle}
            </p>

            <div className="space-y-3">
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
                  <div className="font-medium text-dark-900">{option.label}</div>
                  <div className="text-sm text-dark-500 mt-1">{option.description}</div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-8">
              {step > 0 ? (
                <Button variant="ghost" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              ) : (
                <div />
              )}
              <Button
                onClick={handleNext}
                disabled={!selectedValue || saving}
              >
                {saving ? "Saving..." : step < STEPS.length - 1 ? "Next" : "Get Started"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
