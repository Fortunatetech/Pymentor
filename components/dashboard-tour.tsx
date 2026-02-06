"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function DashboardTour() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const shouldTour = searchParams.get("tour") === "true";

    useEffect(() => {
        if (shouldTour) {
            const driverObj = driver({
                showProgress: true,
                allowClose: true,
                doneBtnText: "Done",
                nextBtnText: "Next",
                prevBtnText: "Previous",
                steps: [
                    {
                        element: "#tour-welcome",
                        popover: {
                            title: "Welcome to PyMentor!",
                            description: "We're excited to have you. Let's take a quick tour of your new dashboard.",
                            side: "bottom",
                            align: "start",
                        },
                    },
                    {
                        element: "#tour-stats",
                        popover: {
                            title: "Track Your Progress",
                            description: "Here you can see your completed lessons, time spent learning, and total XP earned.",
                            side: "bottom",
                            align: "start",
                        },
                    },
                    {
                        element: "#tour-challenge",
                        popover: {
                            title: "Daily Challenges",
                            description: "Complete daily coding challenges to earn bonus XP and keep your streak alive!",
                            side: "top",
                            align: "start",
                        },
                    },
                    {
                        element: "#tour-paths",
                        popover: {
                            title: "Learning Paths",
                            description: "Choose a path to start your journey. We recommend starting with the basics!",
                            side: "top",
                            align: "start",
                        },
                    },
                ],
                onDestroyStarted: () => {
                    // Remove the ?tour=true param without reloading
                    router.replace("/dashboard", { scroll: false });
                    driverObj.destroy();
                },
            });

            driverObj.drive();
        }
    }, [shouldTour, router]);

    return null;
}
