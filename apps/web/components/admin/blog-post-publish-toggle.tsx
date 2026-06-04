"use client";

import { useTransition } from "react";
import { adminToggleBlogPostPublished } from "~/actions/admin";

interface BlogPostPublishToggleProps {
  postId: string;
  isPublished: boolean;
  onToggle?: () => void;
}

export function BlogPostPublishToggle({ postId, isPublished, onToggle }: BlogPostPublishToggleProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const result = await adminToggleBlogPostPublished(postId, !isPublished);
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
