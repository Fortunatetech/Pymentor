import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            // Variants
            "bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/30 focus:ring-primary-500":
              variant === "primary",
            "bg-white hover:bg-dark-50 text-dark-700 border border-dark-200 focus:ring-dark-500":
              variant === "secondary",
            "text-dark-600 hover:text-dark-900 hover:bg-dark-100 focus:ring-dark-500":
              variant === "ghost",
            "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500":
              variant === "danger",
            // Sizes
            "text-sm px-4 py-2": size === "sm",
            "text-base px-6 py-3": size === "md",
            "text-lg px-8 py-4": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
