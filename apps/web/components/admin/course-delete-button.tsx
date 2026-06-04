"use client";

import { useTransition } from "react";
import { adminDeleteCourse } from "~/actions/admin";

interface CourseDeleteButtonProps {
  courseId: string;
  onDelete?: () => void;
}

export function CourseDeleteButton({ courseId, onDelete }: CourseDeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }

    startTransition(async () => {
      const result = await adminDeleteCourse(courseId);
      if (result.success && onDelete) {
        onDelete();
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
