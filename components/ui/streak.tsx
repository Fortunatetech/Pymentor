"use client";

import { cn } from "@/lib/utils";

interface StreakProps {
  days: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Streak({ days, size = "md", className }: StreakProps) {
  const isActive = days > 0;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl",
        isActive
          ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/30"
          : "bg-dark-100 text-dark-500",
        {
          "px-3 py-1.5": size === "sm",
          "px-4 py-2": size === "md",
          "px-6 py-4": size === "lg",
        },
        className
      )}
    >
      <span className={cn({
        "text-lg": size === "sm",
        "text-xl": size === "md",
        "text-3xl": size === "lg",
      })}>
        🔥
      </span>
      <div>
        <div className={cn("font-bold", {
          "text-base": size === "sm",
          "text-lg": size === "md",
          "text-2xl": size === "lg",
        })}>
          {days}
        </div>
        <div className={cn("opacity-80", {
          "text-xs": size === "sm" || size === "md",
          "text-sm": size === "lg",
        })}>
          day{days !== 1 ? "s" : ""} streak
        </div>
      </div>
    </div>
  );
}

interface XPDisplayProps {
  xp: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function XPDisplay({ xp, size = "md", className }: XPDisplayProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 bg-white border border-dark-200 rounded-xl",
        {
          "px-3 py-1.5": size === "sm",
          "px-4 py-2": size === "md",
          "px-6 py-4": size === "lg",
        },
        className
      )}
    >
      <span className={cn({
        "text-lg": size === "sm",
        "text-xl": size === "md",
        "text-3xl": size === "lg",
      })}>
        ⭐
      </span>
      <div>
        <div className={cn("font-bold text-dark-900", {
          "text-base": size === "sm",
          "text-lg": size === "md",
          "text-2xl": size === "lg",
        })}>
          {xp.toLocaleString()}
        </div>
        <div className={cn("text-dark-500", {
          "text-xs": size === "sm" || size === "md",
          "text-sm": size === "lg",
        })}>
          XP
        </div>
      </div>
    </div>
  );
}
