"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks";

const projects = [
  {
    id: "1",
    title: "Number Guessing Game",
    description: "Build a game where the computer picks a random number and you try to guess it.",
    difficulty: "beginner",
    estimatedTime: "30 min",
    concepts: ["variables", "if-statements", "while-loops", "input"],
    isFree: true,
  },
  {
    id: "2",
    title: "To-Do List App",
    description: "Create a command-line to-do list with add, remove, and view tasks.",
    difficulty: "beginner",
    estimatedTime: "45 min",
    concepts: ["lists", "functions", "loops"],
    isFree: true,
  },
  {
    id: "3",
    title: "Password Generator",
    description: "Generate strong, random passwords with customizable length and characters.",
    difficulty: "beginner",
    estimatedTime: "30 min",
    concepts: ["strings", "random", "functions"],
    isFree: false,
  },
  {
    id: "4",
    title: "Quiz Game",
    description: "Build a multiple-choice quiz game with scoring and feedback.",
    difficulty: "intermediate",
    estimatedTime: "1 hour",
    concepts: ["dictionaries", "functions", "loops"],
    isFree: false,
  },
  {
    id: "5",
    title: "Weather Dashboard",
    description: "Fetch weather data from an API and display it beautifully.",
    difficulty: "intermediate",
    estimatedTime: "1.5 hours",
    concepts: ["APIs", "JSON", "functions"],
    isFree: false,
  },
  {
    id: "6",
    title: "Expense Tracker",
    description: "Track expenses, categorize them, and see spending summaries.",
    difficulty: "intermediate",
    estimatedTime: "2 hours",
    concepts: ["file I/O", "dictionaries", "functions"],
    isFree: false,
  },
];

export default function ProjectsPage() {
  const { isPro } = useSubscription();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Projects</h1>
          <p className="text-dark-500">Build real things to solidify your learning</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const isLocked = !project.isFree && !isPro;
          
          return (
            <Card key={project.id} hover className={isLocked ? "opacity-75" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge
                    variant={
                      project.difficulty === "beginner"
                        ? "primary"
                        : project.difficulty === "intermediate"
                        ? "accent"
                        : "default"
                    }
                  >
                    {project.difficulty}
                  </Badge>
                  {isLocked && (
                    <span className="text-lg" title="Pro only">🔒</span>
                  )}
                </div>
                
                <h3 className="font-semibold text-lg text-dark-900 mb-2">
                  {project.title}
                </h3>
                <p className="text-dark-500 text-sm mb-4">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.concepts.map((concept) => (
                    <span
                      key={concept}
                      className="text-xs bg-dark-100 text-dark-600 px-2 py-1 rounded"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-500">
                    ⏱️ {project.estimatedTime}
                  </span>
                  {isLocked ? (
                    <Link href="/pricing">
                      <Button size="sm" variant="secondary">
                        Unlock
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/projects/${project.id}`}>
                      <Button size="sm">Start</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!isPro && (
        <div className="mt-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Unlock All Projects</h3>
          <p className="text-primary-100 mb-4">
            Get access to all projects and build your portfolio
          </p>
          <Link href="/pricing">
            <Button variant="secondary">Upgrade to Pro</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
