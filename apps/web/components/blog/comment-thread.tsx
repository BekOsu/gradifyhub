"use client";

import { useState, useTransition } from "react";
import { Trash2, Reply } from "lucide-react";
import { deleteCommentAction, addCommentAction } from "~/actions/blog";
import { cn } from "~/lib/utils";
import type { CommentWithUser } from "~/lib/blog-comments";

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
  if (name) return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return email[0]?.toUpperCase() ?? "?";
}

function ReplyForm({
  slug,
  parentId,
  userInitials,
  onCancel,
}: {
  slug: string;
  parentId: string;
  userInitials: string;
  onCancel: () => void;
}) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (body.trim().length < 2) return;
    setError(null);
    startTransition(async () => {
      const res = await addCommentAction(slug, body, parentId);
      if (res.success) {
        setBody("");
        onCancel();
      } else {
        setError(res.error ?? "Failed to post reply.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-green/15 text-[10px] font-bold text-brand-green ring-1 ring-brand-green/20">
        {userInitials}
      </div>
      <div className="flex-1 space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a reply…"
          rows={2}
          disabled={isPending}
          className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-brand-green/50 focus:ring-2 focus:ring-brand-green/20"
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={body.trim().length < 2 || isPending}
            className="rounded-full bg-brand-green px-3 py-1 text-xs font-semibold text-white disabled:opacity-40"
          >
            {isPending ? "Posting…" : "Reply"}
          </button>
          <button type="button" onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground">
            Cancel
          </button>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>
    </form>
  );
}

function CommentRow({
  comment,
  slug,
  currentUserId,
  userInitials,
  depth,
}: {
  comment: CommentWithUser;
  slug: string;
  currentUserId: string | undefined;
  userInitials: string;
  depth: number;
}) {
  const [deleted, setDeleted] = useState(false);
  const [replying, setReplying] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (deleted) return null;

  const initials = getInitials(comment.user.name, comment.user.email);
  const isOwn = comment.userId === currentUserId;

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteCommentAction(comment.id);
      if (res.success) setDeleted(true);
    });
  }

  return (
    <div className={cn("flex gap-3", depth > 0 && "pl-6 border-l border-muted/50")}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold">
            {comment.user.name ?? comment.user.email.split("@")[0]}
          </span>
          <span className="text-xs text-muted-foreground">{timeAgo(new Date(comment.createdAt))}</span>
          {isOwn && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              aria-label="Delete"
              className="ml-auto rounded p-1 text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap break-words">
          {comment.body}
        </p>

        {/* Reply button (max 1 level deep) */}
        {currentUserId && depth === 0 && (
          <button
            onClick={() => setReplying((r) => !r)}
            className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Reply className="h-3 w-3" />
            Reply
          </button>
        )}

        {replying && (
          <ReplyForm
            slug={slug}
            parentId={comment.id}
            userInitials={userInitials}
            onCancel={() => setReplying(false)}
          />
        )}

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => (
              <CommentRow
                key={reply.id}
                comment={reply}
                slug={slug}
                currentUserId={currentUserId}
                userInitials={userInitials}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface CommentThreadProps {
  comments: CommentWithUser[];
  slug: string;
  currentUserId: string | undefined;
  userInitials: string;
}

export function CommentThread({ comments, slug, currentUserId, userInitials }: CommentThreadProps) {
  if (comments.length === 0) {
    return (
      <p className="py-2 text-sm text-muted-foreground">
        No comments yet. Be the first to share your thoughts.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((c) => (
        <CommentRow
          key={c.id}
          comment={c}
          slug={slug}
          currentUserId={currentUserId}
          userInitials={userInitials}
          depth={0}
        />
      ))}
    </div>
  );
}

