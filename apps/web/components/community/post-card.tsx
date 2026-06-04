"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Trash2, Pin } from "lucide-react";
import { setReactionAction, deletePostAction, type CommunityReactionEmoji } from "~/actions/community";
import { ReactionPicker } from "./reaction-picker";
import { CommunityCommentThread } from "./comment-thread";
import { FollowButton } from "./follow-button";
import { cn } from "~/lib/utils";
import type { PostWithUser, CommentWithUser } from "~/lib/community";

export const CATEGORY_META: Record<string, { emoji: string; label: string; color: string }> = {
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
  return d < 7 ? `${d}d ago` : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name: string | null, email: string) {
  if (name) return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return email[0]?.toUpperCase() ?? "?";
}

interface PostCardProps {
  post: PostWithUser;
  currentUserId?: string;
  isFollowingAuthor?: boolean;
  userInitials?: string;
  comments?: CommentWithUser[];
  showComments?: boolean;
  pollCard?: React.ReactNode;
}

export function PostCard({
  post, currentUserId, isFollowingAuthor = false, userInitials = "?", comments = [], showComments = false, pollCard,
}: PostCardProps) {
  const [deleted, setDeleted] = useState(false);
  const [reactions, setReactions] = useState(post.reactionCounts);
  const [myReaction, setMyReaction] = useState<string | null>(post.myReaction ?? null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (deleted) return null;

  const meta = CATEGORY_META[post.category] ?? CATEGORY_META.general!;
  const initials = getInitials(post.user.name, post.user.email);
  const isOwn = post.userId === currentUserId;
  const tags = Array.isArray(post.tags) ? (post.tags as string[]) : [];
  const totalReactions = reactions.reduce((n, r) => n + r.count, 0);

  function handleReaction(emoji: CommunityReactionEmoji) {
    if (!currentUserId) return;
    setPickerOpen(false);
    startTransition(async () => {
      const res = await setReactionAction(post.id, emoji);
      if (!res.success) return;
      setMyReaction(res.active ?? null);
      setReactions((prev) => {
        const without = prev.filter((r) => r.emoji !== emoji && r.emoji !== myReaction);
        if (res.active) {
          const existing = prev.find((r) => r.emoji === emoji);
          without.push({ emoji, count: (existing?.count ?? 0) + 1 });
        }
        return without.sort((a, b) => b.count - a.count);
      });
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deletePostAction(post.id);
      if (res.success) setDeleted(true);
    });
  }

  return (
    <article className="rounded-xl border bg-background p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/profile/${post.userId}`} className="text-sm font-semibold hover:underline underline-offset-4">
              {post.user.name ?? post.user.email.split("@")[0]}
            </Link>
            {currentUserId && !isOwn && (
              <FollowButton targetUserId={post.userId} initialFollowing={isFollowingAuthor} />
            )}
            <span className={cn("inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold", meta.color)}>
              {meta.emoji} {meta.label}
            </span>
            {post.pinnedAt && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-500 font-semibold">
                <Pin className="h-2.5 w-2.5" /> Pinned
              </span>
            )}
            <span className="ml-auto text-xs text-muted-foreground shrink-0">{timeAgo(new Date(post.createdAt))}</span>
            {isOwn && (
              <button onClick={handleDelete} disabled={isPending} aria-label="Delete post"
                className="shrink-0 rounded p-1 text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive disabled:opacity-40">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Title */}
          {post.title && <p className="mt-1 text-sm font-semibold">{post.title}</p>}

          {/* Body */}
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap break-words">
            {post.body}
          </p>

          {/* Media */}
          {post.mediaUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.mediaUrl} alt="" className="mt-3 max-h-64 w-full rounded-xl object-cover" />
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Link key={tag} href={`/community/topics/${tag}`}
                  className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted/80">
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Poll */}
          {pollCard}
        </div>
      </div>

      {/* Reaction bar */}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
        {/* Reaction picker trigger */}
        <div className="relative">
          <button
            onClick={() => currentUserId && setPickerOpen((o) => !o)}
            data-testid={`post-reaction-trigger-${post.id}`}
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition-all",
              myReaction
                ? "bg-amber-50 text-amber-600 ring-1 ring-amber-200 font-semibold"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
              !currentUserId && "cursor-default opacity-60",
            )}
          >
            <span>{myReaction ?? "😊"}</span>
            {totalReactions > 0 && <span className="tabular-nums text-xs">{totalReactions}</span>}
          </button>
          <ReactionPicker
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onPick={handleReaction}
            myReaction={myReaction}
          />
        </div>

        {/* Per-emoji counts */}
        {reactions.map((r) => (
          <span key={r.emoji} className="flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-xs text-muted-foreground">
            {r.emoji} <span className="tabular-nums">{r.count}</span>
          </span>
        ))}

        <div className="ml-auto">
          <Link href={`/community/${post.id}`} className="text-xs text-muted-foreground hover:text-foreground">
            View thread →
          </Link>
        </div>
      </div>

      {/* Comment thread (collapsible) */}
      <div className="mt-3">
        <CommunityCommentThread
          comments={comments}
          postId={post.id}
          currentUserId={currentUserId}
          userInitials={userInitials}
          showInput={showComments}
        />
      </div>
    </article>
  );
}

