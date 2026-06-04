import Link from "next/link";
import { CourseForm } from "~/components/admin/course-form";

export default function NewCoursePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/courses" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to courses
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Create a new course</h1>
      </div>
      <CourseForm mode="create" />
    </div>
  );
}
