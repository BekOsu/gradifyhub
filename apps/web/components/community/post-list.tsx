"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deletePostAction } from "~/actions/community";
import { cn } from "~/lib/utils";
import type { PostWithUser } from "~/lib/community";

const CATEGORY_META: Record<string, { emoji: string; label: string; color: string }> = {
  win:      { emoji: "🎉", label: "Win",      color: "bg-green-100 text-green-700" },
  question: { emoji: "❓", label: "Question", color: "bg-amber-100 text-amber-700" },
  resource: { emoji: "📚", label: "Resource", color: "bg-blue-100 text-blue-700" },
  general:  { emoji: "💬", label: "General",  color: "bg-muted text-muted-foreground" },
};

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name: string | null, email: string): string {
  if (name) return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return email[0]?.toUpperCase() ?? "?";
}

function PostRow({ post, isOwn }: { post: PostWithUser; isOwn: boolean }) {
  const [deleted, setDeleted] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (deleted) return null;

  const meta = CATEGORY_META[post.category] ?? CATEGORY_META.general!;
  const initials = getInitials(post.user.name, post.user.email);

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePostAction(post.id);
      if (result.success) setDeleted(true);
    });
  }

  return (
    <article className="flex gap-3 rounded-xl border bg-background p-4 shadow-sm transition-shadow hover:shadow-lift">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold truncate">
            {post.user.name ?? post.user.email.split("@")[0]}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              meta.color,
            )}
          >
            {meta.emoji} {meta.label}
          </span>
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
            {timeAgo(new Date(post.createdAt))}
          </span>
          {isOwn && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              aria-label="Delete post"
              className="shrink-0 rounded p-1 text-muted-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap break-words">
          {post.body}
        </p>
      </div>
    </article>
  );
}

interface PostListProps {
  posts: PostWithUser[];
  currentUserId: string | undefined;
}

export function PostList({ posts, currentUserId }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-xl border bg-muted/20 px-6 py-12 text-center">
        <p className="text-2xl">👋</p>
        <p className="mt-2 text-sm font-medium">No posts yet.</p>
        <p className="mt-1 text-sm text-muted-foreground">Be the first to share a win or ask a question.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostRow key={post.id} post={post} isOwn={post.userId === currentUserId} />
      ))}
    </div>
  );
}
