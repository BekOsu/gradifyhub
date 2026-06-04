"use client";

import { useTransition } from "react";
import { adminDeleteBlogPost } from "~/actions/admin";

interface BlogPostDeleteButtonProps {
  postId: string;
  onDelete?: () => void;
}

export function BlogPostDeleteButton({ postId, onDelete }: BlogPostDeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    startTransition(async () => {
      const result = await adminDeleteBlogPost(postId);
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
