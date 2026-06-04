"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Heart, Bookmark, Share2 } from "lucide-react";
import { toggleLikeAction, toggleBookmarkAction, setReactionAction, type BlogReactionEmoji } from "~/actions/blog";
import { cn } from "~/lib/utils";

const EMOJIS: BlogReactionEmoji[] = ["👍", "❤️", "😂", "😮", "😢", "😡"];

interface ReactionBarProps {
  slug: string;
  initialLikeCount: number;
  initialLiked: boolean;
  initialBookmarked: boolean;
  initialReactions: { emoji: string; count: number }[];
  initialMyReaction: string | null;
  isLoggedIn: boolean;
}

export function ReactionBar({
  slug,
  initialLikeCount,
  initialLiked,
  initialBookmarked,
  initialReactions,
  initialMyReaction,
  isLoggedIn,
}: ReactionBarProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [reactions, setReactions] = useState(initialReactions);
  const [myReaction, setMyReaction] = useState<string | null>(initialMyReaction);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function handleLike() {
    if (!isLoggedIn) return;
    startTransition(async () => {
      const res = await toggleLikeAction(slug);
      if (res.success) {
        setLiked(res.liked ?? !liked);
        setLikeCount((n) => n + (res.liked ? 1 : -1));
      }
    });
  }

  function handleBookmark() {
    if (!isLoggedIn) return;
    startTransition(async () => {
      const res = await toggleBookmarkAction(slug);
      if (res.success) setBookmarked(res.bookmarked ?? !bookmarked);
    });
  }

  function handleReaction(emoji: BlogReactionEmoji) {
    if (!isLoggedIn) return;
    setPickerOpen(false);
    startTransition(async () => {
      const res = await setReactionAction(slug, emoji);
      if (!res.success) return;
      setMyReaction(res.active ?? null);
      setReactions((prev) => {
        const next = prev.filter((r) => r.emoji !== emoji && r.emoji !== myReaction);
        if (res.active) {
          const existing = prev.find((r) => r.emoji === emoji);
          next.push({ emoji, count: (existing?.count ?? 0) + 1 });
        }
        return next.sort((a, b) => b.count - a.count);
      });
    });
  }

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      void navigator.share({ url });
    } else {
      void navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Like */}
      <button
        onClick={handleLike}
        disabled={isPending || !isLoggedIn}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
          liked
            ? "bg-red-50 text-red-500 ring-1 ring-red-200"
            : "bg-muted text-muted-foreground hover:bg-muted/80",
          !isLoggedIn && "cursor-default opacity-60",
        )}
      >
        <Heart className={cn("h-4 w-4", liked && "fill-red-500")} />
        {likeCount > 0 && <span className="tabular-nums">{likeCount}</span>}
      </button>

      {/* Emoji reaction picker */}
      <div ref={pickerRef} className="relative">
        <button
          onClick={() => isLoggedIn && setPickerOpen((o) => !o)}
          className={cn(
            "flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
            myReaction
              ? "bg-amber-50 text-amber-600 ring-1 ring-amber-200"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
            !isLoggedIn && "cursor-default opacity-60",
          )}
        >
          <span>{myReaction ?? "😊"}</span>
          {reactions.length > 0 && (
            <span className="tabular-nums text-xs">
              {reactions.reduce((n, r) => n + r.count, 0)}
            </span>
          )}
        </button>

        {pickerOpen && (
          <div className="absolute bottom-full left-0 mb-2 flex gap-1 rounded-2xl border bg-background p-2 shadow-xl z-50">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={cn(
                  "rounded-xl p-1.5 text-xl transition-all hover:scale-125",
                  myReaction === emoji && "bg-amber-100 ring-2 ring-amber-400",
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reaction counts */}
      {reactions.map((r) => (
        <span
          key={r.emoji}
          className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
        >
          {r.emoji} <span className="tabular-nums">{r.count}</span>
        </span>
      ))}

      <div className="ml-auto flex items-center gap-2">
        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          disabled={isPending || !isLoggedIn}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
          className={cn(
            "rounded-full p-2 transition-all",
            bookmarked
              ? "text-brand-green bg-brand-green/10"
              : "text-muted-foreground hover:bg-muted",
            !isLoggedIn && "cursor-default opacity-60",
          )}
        >
          <Bookmark className={cn("h-4 w-4", bookmarked && "fill-brand-green")} />
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          aria-label="Share"
          className="rounded-full p-2 text-muted-foreground transition-all hover:bg-muted"
        >
          <Share2 className="h-4 w-4" />
          {copied && (
            <span className="absolute -translate-y-8 rounded bg-foreground px-2 py-0.5 text-xs text-background">
              Copied!
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

