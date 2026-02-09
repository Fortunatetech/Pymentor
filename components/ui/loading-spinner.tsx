"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    label?: string;
    className?: string;
    fullPage?: boolean;
}

const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
};

export function LoadingSpinner({
    size = "md",
    label,
    className,
    fullPage = false,
}: LoadingSpinnerProps) {
    const spinner = (
        <div className={cn("flex flex-col items-center gap-3", className)}>
            <div
                className={cn(
                    "animate-spin rounded-full border-2 border-primary-500 border-t-transparent",
                    sizeClasses[size]
                )}
                role="status"
                aria-label={label || "Loading"}
            />
            {label && (
                <span className="text-sm text-dark-500 animate-pulse">{label}</span>
            )}
        </div>
    );

    if (fullPage) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                {spinner}
            </div>
        );
    }

    return spinner;
}

interface LoadingCardProps {
    lines?: number;
    className?: string;
}

export function LoadingCard({ lines = 3, className }: LoadingCardProps) {
    return (
        <div
            className={cn(
                "animate-pulse bg-white rounded-xl border border-dark-100 p-6",
                className
            )}
        >
            <div className="h-4 bg-dark-200 rounded w-1/3 mb-4" />
            <div className="space-y-3">
                {Array.from({ length: lines }).map((_, i) => (
                    <div
                        key={i}
                        className="h-3 bg-dark-100 rounded"
                        style={{ width: `${100 - i * 15}%` }}
                    />
                ))}
            </div>
        </div>
    );
}

interface LoadingGridProps {
    count?: number;
    className?: string;
}

export function LoadingGrid({ count = 4, className }: LoadingGridProps) {
    return (
        <div className={cn("grid md:grid-cols-2 gap-4", className)}>
            {Array.from({ length: count }).map((_, i) => (
                <LoadingCard key={i} lines={i % 2 === 0 ? 3 : 4} />
            ))}
        </div>
    );
}

interface PageLoadingProps {
    title?: string;
}

export function PageLoading({ title = "Loading..." }: PageLoadingProps) {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
                <LoadingSpinner size="lg" className="mb-4" />
                <p className="text-dark-500 animate-pulse">{title}</p>
            </div>
        </div>
    );
}
