"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteCommentAction } from "~/actions/blog";
import { cn } from "~/lib/utils";
import type { CommentWithUser } from "~/lib/blog-comments";

interface CommentListProps {
  comments: CommentWithUser[];
  currentUserId: string | undefined;
}

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  }
  return email[0]?.toUpperCase() ?? "?";
}

function CommentRow({
  comment,
  isOwn,
}: {
  comment: CommentWithUser;
  isOwn: boolean;
}) {
  const [deleted, setDeleted] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (deleted) return null;

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCommentAction(comment.id);
      if (result.success) setDeleted(true);
    });
  }

  const initials = getInitials(comment.user.name, comment.user.email);

  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold truncate">
            {comment.user.name ?? comment.user.email.split("@")[0]}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            {timeAgo(new Date(comment.createdAt))}
          </span>
          {isOwn && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              aria-label="Delete comment"
              className={cn(
                "ml-auto shrink-0 rounded p-1 text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40",
              )}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap break-words">
          {comment.body}
        </p>
      </div>
    </div>
  );
}

export function CommentList({ comments, currentUserId }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        No comments yet. Be the first to share your thoughts.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((c) => (
        <CommentRow key={c.id} comment={c} isOwn={c.userId === currentUserId} />
      ))}
    </div>
  );
}
