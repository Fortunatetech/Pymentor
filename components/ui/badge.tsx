import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "accent" | "success" | "warning" | "error";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
        {
          "bg-dark-100 text-dark-700": variant === "default",
          "bg-primary-100 text-primary-700": variant === "primary",
          "bg-accent-100 text-accent-700": variant === "accent",
          "bg-green-100 text-green-700": variant === "success",
          "bg-yellow-100 text-yellow-700": variant === "warning",
          "bg-red-100 text-red-700": variant === "error",
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
