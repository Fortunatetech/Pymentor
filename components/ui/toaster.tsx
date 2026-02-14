"use client"

import { useToast } from "./use-toast"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import * as React from "react"
import { X } from "lucide-react"

export function Toaster() {
    const { toasts, dismiss } = useToast()

    return (
        <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
            {toasts.map(function ({ id, title, description, variant, duration = 3000, ...props }) {
                return (
                    <ToastItem
                        key={id}
                        id={id!}
                        title={title}
                        description={description}
                        variant={variant}
                        duration={duration}
                        onDismiss={() => dismiss(id)}
                        {...props}
                    />
                )
            })}
        </div>
    )
}

function ToastItem({
    id,
    title,
    description,
    variant,
    duration,
    onDismiss
}: {
    id: string,
    title?: React.ReactNode,
    description?: React.ReactNode,
    variant?: "default" | "destructive" | "success",
    duration: number,
    onDismiss: () => void
}) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => setIsVisible(true))

        // Auto dismiss
        const timer = setTimeout(() => {
            setIsVisible(false)
            setTimeout(onDismiss, 300) // Wait for exit animation
        }, duration)

        return () => clearTimeout(timer)
    }, [duration, onDismiss])

    return (
        <div
            className={cn(
                "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all duration-300 ease-in-out mb-4",
                // Animation classes
                isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",

                // Variants
                variant === "destructive" && "border-red-500 bg-red-500 text-white",
                // Custom success variant
                variant === "success" && "border-green-500 bg-green-500 text-white",
                // Default
                (!variant || variant === "default") && "border-dark-200 bg-white text-dark-950"
            )}
        >
            <div className="grid gap-1">
                {title && <div className="text-sm font-semibold">{title}</div>}
                {description && <div className="text-sm opacity-90">{description}</div>}
            </div>
            <button
                onClick={() => {
                    setIsVisible(false)
                    setTimeout(onDismiss, 300)
                }}
                className={cn(
                    "absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
                    variant === "destructive" || variant === "success"
                        ? "text-red-50/50 hover:text-red-50 focus:ring-red-400 focus:ring-offset-red-600"
                        : "text-dark-950/50 hover:text-dark-950"
                )}
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    )
}
