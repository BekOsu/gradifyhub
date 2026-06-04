"use client";

import { useTransition } from "react";
import { adminToggleCoursePublished } from "~/actions/admin";

interface CoursePublishToggleProps {
  courseId: string;
  isPublished: boolean;
  onToggle?: () => void;
}

export function CoursePublishToggle({ courseId, isPublished, onToggle }: CoursePublishToggleProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const result = await adminToggleCoursePublished(courseId, !isPublished);
      if (result.success && onToggle) {
        onToggle();
      }
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition ${
        isPublished
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      } disabled:opacity-50`}
    >
      {isPending ? "…" : isPublished ? "Published" : "Draft"}
    </button>
  );
}
