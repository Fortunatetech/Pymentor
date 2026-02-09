/**
 * Monitoring and Error Tracking Utilities
 * 
 * This module provides wrapper functions for error tracking and performance monitoring.
 * Uses Sentry as the backend but abstracts it to allow easy provider switching.
 */

import * as Sentry from "@sentry/nextjs";

/**
 * Capture an exception with optional context
 */
export function captureError(error: Error, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "development") {
        console.error("[Error]", error, context);
        return;
    }

    Sentry.captureException(error, {
        extra: context,
    });
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string }) {
    Sentry.setUser({
        id: user.id,
        email: user.email,
    });
}

/**
 * Clear user context (on logout)
 */
export function clearUser() {
    Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
    message: string,
    category?: string,
    data?: Record<string, unknown>
) {
    Sentry.addBreadcrumb({
        message,
        category,
        data,
        level: "info",
    });
}

/**
 * Start a performance transaction
 */
export function startTransaction(
    name: string,
    op: string
): Sentry.Span | undefined {
    return Sentry.startInactiveSpan({ name, op });
}

/**
 * Wrapper for API route handlers with error tracking
 */
export function withErrorTracking<T extends (...args: any[]) => Promise<Response>>(
    handler: T,
    routeName: string
): T {
    return (async (...args: any[]) => {
        try {
            return await handler(...args);
        } catch (error) {
            captureError(error as Error, { route: routeName });
            return new Response(
                JSON.stringify({ error: "server_error", message: "Internal server error" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }
    }) as T;
}


/**
 * Log a custom event for analytics
 */
export function logEvent(eventName: string, data?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "development") {
        console.log(`[Event] ${eventName}`, data);
        return;
    }

    Sentry.captureMessage(eventName, {
        level: "info",
        extra: data,
    });
}
