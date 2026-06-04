import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseById } from "@repo/db/queries/courses";
import { CourseForm } from "~/components/admin/course-form";

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params;
  const course = await getCourseById(id);

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/courses" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to courses
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Edit: {course.title}</h1>
      </div>
      <CourseForm
        mode="edit"
        initial={{
          id: course.id,
          slug: course.slug,
          title: course.title,
          description: course.description,
          provider: course.provider,
          imageUrl: course.imageUrl,
          courseUrl: course.courseUrl,
          level: course.level,
          category: course.category,
          tags: course.tags,
          durationHours: course.durationHours,
          studentCount: course.studentCount,
          rating: course.rating,
          isFree: course.isFree,
          order: course.order,
        }}
      />
    </div>
  );
}
