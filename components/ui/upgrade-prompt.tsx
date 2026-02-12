"use client";

import Link from "next/link";
import { Button } from "./button";
import { Card, CardContent } from "./card";

interface UpgradePromptProps {
  variant: "lesson-locked" | "module-complete" | "message-limit" | "challenge-locked" | "inline";
  messagesUsed?: number;
  className?: string;
}

const variantConfig = {
  "lesson-locked": {
    icon: "🔒",
    title: "This lesson requires Pro",
    description: "Upgrade to Pro to unlock all lessons, projects, and unlimited AI chat.",
    buttonText: "Unlock with Pro",
  },
  "module-complete": {
    icon: "🎉",
    title: "You've completed Module 1!",
    description: "Great work on the fundamentals! Upgrade to Pro to continue your Python journey with advanced modules.",
    buttonText: "Keep Learning with Pro",
  },
  "message-limit": {
    icon: "💬",
    title: "Daily message limit reached",
    description: "You've used all your free messages for today. Upgrade to Pro for 500 messages per day!",
    buttonText: "Get Unlimited Messages",
  },
  "challenge-locked": {
    icon: "🎯",
    title: "Daily Challenges are a Pro feature",
    description: "Upgrade to Pro to access daily coding challenges, earn bonus XP, and sharpen your skills.",
    buttonText: "Unlock Challenges",
  },
  "inline": {
    icon: "⭐",
    title: "Upgrade to Pro",
    description: "Get full access to all lessons, unlimited AI chat, daily challenges, and more.",
    buttonText: "View Plans",
  },
};

export function UpgradePrompt({ variant, messagesUsed, className = "" }: UpgradePromptProps) {
  const config = variantConfig[variant];

  if (variant === "inline") {
    return (
      <Link
        href="/pricing"
        className={`flex items-center gap-3 p-3 rounded-xl bg-primary-50 border border-primary-200 hover:bg-primary-100 transition-colors ${className}`}
      >
        <span className="text-xl">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-dark-900 text-sm">{config.title}</p>
          <p className="text-xs text-dark-500 truncate">{config.description}</p>
        </div>
        <Button size="sm" className="flex-shrink-0">{config.buttonText}</Button>
      </Link>
    );
  }

  return (
    <Card className={`border-primary-200 bg-gradient-to-br from-primary-50 to-white ${className}`}>
      <CardContent className="p-6 sm:p-8 text-center">
        <span className="text-4xl sm:text-5xl block mb-4">{config.icon}</span>
        <h3 className="text-xl sm:text-2xl font-bold text-dark-900 mb-2">
          {config.title}
        </h3>
        <p className="text-dark-500 mb-6 max-w-md mx-auto">
          {variant === "message-limit" && messagesUsed
            ? `You've used ${messagesUsed} of your 15 free daily messages. Upgrade to Pro for 500 messages per day!`
            : config.description}
        </p>
        <Link href="/pricing">
          <Button size="lg">{config.buttonText}</Button>
        </Link>
        <p className="text-xs text-dark-400 mt-3">
          Starting at $8/mo. Cancel anytime.
        </p>
      </CardContent>
    </Card>
  );
}
