"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubscription } from "@/hooks";
import { Search } from "lucide-react";
import { projects as projectsData, ProjectLevel } from "./data";

const levels: { id: ProjectLevel | "all"; label: string }[] = [
  { id: "all", label: "All Levels" },
  { id: "fundamentals", label: "Fundamentals" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

export default function ProjectsPage() {
  const { isPro } = useSubscription();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<ProjectLevel | "all">("all");

  const projects = Object.values(projectsData);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.concepts.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLevel = selectedLevel === "all" || project.level === selectedLevel;

    return matchesSearch && matchesLevel;
  });

  // Group by level if no specific level filter is active
  const displayedLevels = selectedLevel === "all"
    ? ["fundamentals", "beginner", "intermediate", "advanced"]
    : [selectedLevel];

  // Helper to sort levels correctly
  const levelOrder = ["fundamentals", "beginner", "intermediate", "advanced"];
  const sortedLevels = displayedLevels.sort((a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Projects</h1>
          <p className="text-dark-500">Build real things to solidify your learning</p>
        </div>

        {!isPro && (
          <Link href="/pricing">
            <Button variant="secondary" size="sm" className="hidden md:flex">
              Upgrade to Pro
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <Input
            placeholder="Search projects by title, concept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {levels.map((level) => (
            <button
              key={level.id}
              onClick={() => setSelectedLevel(level.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedLevel === level.id
                ? "bg-primary-500 text-white"
                : "bg-white text-dark-600 hover:bg-dark-50 border border-dark-200"
                }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-10">
        {sortedLevels.map((level) => {
          const levelProjects = filteredProjects.filter((p) => p.level === level);

          if (levelProjects.length === 0) return null;

          return (
            <div key={level}>
              {selectedLevel === "all" && (
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg font-bold text-dark-900 capitalize">
                    {level} Projects
                  </h2>
                  <div className="h-px flex-1 bg-dark-200"></div>
                </div>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {levelProjects.map((project) => {
                  const isLocked = !project.isFree && !isPro;

                  return (
                    <Card key={project.id} hover className={`flex flex-col ${isLocked ? "opacity-75" : ""}`}>
                      <CardContent className="p-6 flex flex-col h-full">
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
                        <p className="text-dark-500 text-sm mb-4 flex-1">
                          {project.description}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {project.concepts.slice(0, 3).map((concept) => (
                            <span
                              key={concept}
                              className="text-xs bg-dark-100 text-dark-600 px-2 py-1 rounded"
                            >
                              {concept}
                            </span>
                          ))}
                          {project.concepts.length > 3 && (
                            <span className="text-xs text-dark-400 px-1 py-1">
                              +{project.concepts.length - 3}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-dark-100">
                          <span className="text-sm text-dark-500 flex items-center gap-1">
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
                              <Button size="sm">Start Project</Button>
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-dark-900 mb-2">No projects found</h3>
            <p className="text-dark-500">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setSelectedLevel("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {!isPro && (
        <div className="mt-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-3">Unlock All Projects</h3>
          <p className="text-primary-100 mb-6 max-w-md mx-auto">
            Get access to our complete library of real-world projects, portfolio builders, and advanced challenges.
          </p>
          <Link href="/pricing">
            <Button variant="secondary" size="lg" className="font-semibold">
              Upgrade to Pro
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
