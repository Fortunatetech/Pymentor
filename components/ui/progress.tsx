import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "accent" | "gradient";
  showLabel?: boolean;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  size = "md",
  variant = "primary",
  showLabel = false,
  className,
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-dark-700">{value}</span>
          <span className="text-dark-500">{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div
        className={cn("bg-dark-100 rounded-full overflow-hidden", {
          "h-1.5": size === "sm",
          "h-2": size === "md",
          "h-3": size === "lg",
        })}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500", {
            "bg-primary-500": variant === "primary",
            "bg-accent-500": variant === "accent",
            "bg-gradient-to-r from-accent-400 to-orange-500": variant === "gradient",
          })}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
