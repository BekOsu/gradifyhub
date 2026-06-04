"use client";

import { useState, useMemo } from "react";
import { CourseCard } from "./course-card";

type Category = "All" | "AI/ML" | "Web Dev" | "Backend" | "DevOps" | "Data" | "CS Fundamentals";
type Level = "All" | "beginner" | "intermediate" | "advanced";

interface CourseGridProps {
  courses: Array<{
    id: string;
    title: string;
    description: string;
    provider: string;
    imageUrl: string | null;
    courseUrl: string;
    level: string;
    category: string;
    durationHours: number | null;
    studentCount: number | null;
    rating: number | null;
    isFree: boolean;
  }>;
}

const CATEGORIES: Category[] = ["All", "AI/ML", "Web Dev", "Backend", "DevOps", "Data", "CS Fundamentals"];
const LEVELS: Level[] = ["All", "beginner", "intermediate", "advanced"];

export function CourseGrid({ courses }: CourseGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [selectedLevel, setSelectedLevel] = useState<Level>("All");

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const categoryMatch = selectedCategory === "All" || course.category === selectedCategory;
      const levelMatch = selectedLevel === "All" || course.level === selectedLevel;
      return categoryMatch && levelMatch;
    });
  }, [courses, selectedCategory, selectedLevel]);

  const getCategoryCount = (cat: Category) => {
    if (cat === "All") return courses.length;
    return courses.filter((c) => c.category === cat).length;
  };

  const getLevelCount = (lvl: Level) => {
    if (lvl === "All") return courses.length;
    return courses.filter((c) => c.level === lvl).length;
  };

  return (
    <div className="space-y-6">
      {/* Category filters */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-900">Category</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-brand-green text-white"
                  : "border border-gray-200 bg-white text-gray-900 hover:border-brand-green hover:bg-brand-green/5"
              }`}
            >
              {cat} <span className="ml-1 text-xs opacity-75">({getCategoryCount(cat)})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Level filters */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-900">Level</p>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedLevel === lvl
                  ? "bg-brand-green text-white"
                  : "border border-gray-200 bg-white text-gray-900 hover:border-brand-green hover:bg-brand-green/5"
              }`}
            >
              {lvl === "All" ? "All Levels" : lvl} <span className="ml-1 text-xs opacity-75">({getLevelCount(lvl)})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-600">
        Showing <span className="font-semibold">{filteredCourses.length}</span> course
        {filteredCourses.length !== 1 ? "s" : ""}
      </p>

      {/* Course grid */}
      {filteredCourses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
          <p className="text-sm text-gray-600">No courses found matching your filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
      )}
    </div>
  );
}
