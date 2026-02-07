"use client";

import { useEffect, useRef, useCallback } from "react";

const IDLE_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes
const HEARTBEAT_INTERVAL_MS = 60 * 1000; // 60 seconds

export function useLessonTimer(lessonId: string) {
    // Accumulated time that hasn't been saved to DB yet
    const unsavedSecondsRef = useRef(0);
    // Timestamp of last user interaction (mouse/key)
    const lastActivityTimeRef = useRef(Date.now());
    // Ref to track if we should send beacon on unmount
    const shouldSendBeaconRef = useRef(true);

    // Helper to send data (Beacon or Fetch)
    const sendTimeUpdate = useCallback(
        (seconds: number, useBeacon = false) => {
            if (seconds <= 0) return;

            const data = { timeSpent: seconds };
            const blob = new Blob([JSON.stringify(data)], {
                type: "application/json",
            });
            const url = `/api/lessons/${lessonId}`;

            if (useBeacon && navigator.sendBeacon) {
                navigator.sendBeacon(url, blob);
            } else {
                fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                    keepalive: true, // Important for unmount fetches if not using beacon
                }).catch((e) => console.error("Heartbeat failed", e));
            }
        },
        [lessonId]
    );

    // 1. Activity Listener (Mouse/Key)
    useEffect(() => {
        const handleActivity = () => {
            lastActivityTimeRef.current = Date.now();
        };

        // Throttle these slightly if performance is an issue, but native events are usually fine
        window.addEventListener("mousemove", handleActivity);
        window.addEventListener("keydown", handleActivity);
        window.addEventListener("click", handleActivity);
        window.addEventListener("scroll", handleActivity);

        return () => {
            window.removeEventListener("mousemove", handleActivity);
            window.removeEventListener("keydown", handleActivity);
            window.removeEventListener("click", handleActivity);
            window.removeEventListener("scroll", handleActivity);
        };
    }, []);

    // 2. Timer Interval & Heartbeat
    useEffect(() => {
        const intervalId = setInterval(() => {
            // Check rules:
            // A. Tab must be visible
            if (document.hidden) return;

            // B. User must not be idle
            if (Date.now() - lastActivityTimeRef.current > IDLE_THRESHOLD_MS) return;

            // Increment
            unsavedSecondsRef.current += 1;

            // Heartbeat check
            if (unsavedSecondsRef.current >= HEARTBEAT_INTERVAL_MS / 1000) {
                const timeToSend = unsavedSecondsRef.current;
                unsavedSecondsRef.current = 0; // Reset pending
                sendTimeUpdate(timeToSend, false);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [sendTimeUpdate]);

    // 3. Unmount Beacon
    useEffect(() => {
        return () => {
            if (shouldSendBeaconRef.current && unsavedSecondsRef.current > 0) {
                sendTimeUpdate(unsavedSecondsRef.current, true);
            }
        };
    }, [sendTimeUpdate]);

    // 4. Exposed method to stop active tracking and get final time
    // This is used when the user clicks "Complete Lesson"
    const stopAndGetTime = useCallback(() => {
        shouldSendBeaconRef.current = false; // Disable beacon since we are saving manually
        const finalTime = unsavedSecondsRef.current;
        unsavedSecondsRef.current = 0;
        return finalTime;
    }, []);

    return { stopAndGetTime };
}
