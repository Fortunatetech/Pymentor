import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Adjust sample rate for production
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Set to false in development
    enabled: process.env.NODE_ENV === "production",

    // Filter out sensitive data
    beforeSend(event) {
        // Remove sensitive headers
        if (event.request?.headers) {
            delete event.request.headers["cookie"];
            delete event.request.headers["authorization"];
        }
        return event;
    },
});
