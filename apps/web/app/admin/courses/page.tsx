import Link from "next/link";
import { getCourses } from "@repo/db/queries/courses";
import { CoursePublishToggle } from "~/components/admin/course-publish-toggle";
import { CourseDeleteButton } from "~/components/admin/course-delete-button";

export default async function AdminCoursesPage() {
  const courses = await getCourses();
  const publishedCount = courses.filter((c) => c.isPublished).length;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "AI/ML": "bg-blue-100 text-blue-700",
      "Web Dev": "bg-orange-100 text-orange-700",
      "Backend": "bg-purple-100 text-purple-700",
      "DevOps": "bg-red-100 text-red-700",
      "Data": "bg-green-100 text-green-700",
      "CS Fundamentals": "bg-indigo-100 text-indigo-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      "beginner": "bg-green-100 text-green-700",
      "intermediate": "bg-amber-100 text-amber-700",
      "advanced": "bg-red-100 text-red-700",
    };
    return colors[level] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Draft courses are hidden from the public /courses page until published.
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
        >
          + Add course
        </Link>
      </div>

      <div className="rounded-xl border">
        <div className="border-b bg-muted/30 px-5 py-3">
          <p className="text-sm font-semibold">
            {publishedCount} of {courses.length} courses published
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            No courses yet.{" "}
            <Link href="/admin/courses/new" className="underline hover:text-foreground">
              Create the first one
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-semibold truncate ${course.isPublished ? "text-foreground" : "text-muted-foreground"}`}>
                      {course.title}
                    </p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${getCategoryColor(course.category)}`}>
                      {course.category}
                    </span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${getLevelColor(course.level)}`}>
                      {course.level}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">{course.provider}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground/60 font-mono">{course.slug}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <CoursePublishToggle courseId={course.id} isPublished={course.isPublished} />
                  <Link
                    href={`/admin/courses/${course.id}/edit`}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                  >
                    Edit
                  </Link>
                  <CourseDeleteButton courseId={course.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
