import type { Metadata } from "next";
import { getPublishedCourses } from "@repo/db/queries/courses";
import { CourseGrid } from "./course-grid";

export const metadata: Metadata = {
  title: "Free Courses — GradifyHub",
  description: "Browse 25+ free, high-quality courses from CS50, freeCodeCamp, DeepLearning.AI, and more. Filter by topic and level.",
};

export default async function CoursesPage() {
  const courses = await getPublishedCourses();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl space-y-6 px-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-brand-green">FREE COURSES</p>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Free Courses Handpicked for Developers
            </h1>
            <p className="text-lg text-gray-600">
              Curated free courses from the world&apos;s best educators — filtered, categorized, and ready to go.
            </p>
          </div>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <CourseGrid courses={courses} />
        </div>
      </section>
    </div>
  );
}
