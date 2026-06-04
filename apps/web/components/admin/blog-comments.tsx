"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { adminDeleteCommentAction } from "~/actions/blog";

interface CommentRow {
  id: string;
  slug: string;
  body: string;
  createdAt: Date;
  userName: string | null;
  userEmail: string | null;
}

function timeAgo(date: Date): string {
  const d = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  return `${d}d ago`;
}

function CommentAdminRow({ comment }: { comment: CommentRow }) {
  const [deleted, setDeleted] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (deleted) return null;

  function handleDelete() {
    startTransition(async () => {
      const result = await adminDeleteCommentAction(comment.id);
      if (result.success) setDeleted(true);
    });
  }

  const isOrphaned = !comment.userName && !comment.userEmail;

  return (
    <div className={`flex gap-4 rounded-xl border p-4 ${isOrphaned ? "border-amber-300 bg-amber-50/30" : ""}`}>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
          <span className={`font-semibold ${isOrphaned ? "text-amber-700" : "text-foreground"}`}>
            {comment.userName ?? comment.userEmail ?? "⚠️ User deleted (orphaned)"}
          </span>
          <span>·</span>
          <Link
            href={`/blog/${comment.slug}`}
            className="hover:text-foreground hover:underline underline-offset-4"
            target="_blank"
          >
            /blog/{comment.slug}
          </Link>
          <span>·</span>
          <span>{timeAgo(new Date(comment.createdAt))}</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground/80 line-clamp-3 whitespace-pre-wrap">
          {comment.body}
        </p>
      </div>
      <button
        onClick={handleDelete}
        disabled={isPending}
        aria-label="Delete comment"
        className="shrink-0 self-start rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function AdminBlogComments({ comments }: { comments: CommentRow[] }) {
  if (comments.length === 0) {
    return (
      <p className="rounded-xl border p-6 text-sm text-muted-foreground">
        No comments yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <CommentAdminRow key={c.id} comment={c} />
      ))}
    </div>
  );
}
