"use client";

import { useState, useTransition } from "react";
import { createPostAction, type PostCategory } from "~/actions/community";
import { cn } from "~/lib/utils";

const CATEGORIES: { value: PostCategory; label: string; emoji: string }[] = [
  { value: "win",      label: "Win",      emoji: "🎉" },
  { value: "question", label: "Question", emoji: "❓" },
  { value: "resource", label: "Resource", emoji: "📚" },
  { value: "general",  label: "General",  emoji: "💬" },
];

const MAX = 280;

interface PostFormProps {
  userInitials: string;
}

export function PostForm({ userInitials }: PostFormProps) {
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<PostCategory>("general");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const remaining = MAX - body.length;
  const canSubmit = body.trim().length >= 2 && body.length <= MAX;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);

    startTransition(async () => {
      const result = await createPostAction(body, category);
      if (result.success) {
        setBody("");
        setCategory("general");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-green/15 text-xs font-bold text-brand-green ring-2 ring-brand-green/20">
          {userInitials}
        </div>
        <div className="flex-1 space-y-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share a win, ask a question, or post a resource…"
            rows={3}
            disabled={isPending}
            className="w-full resize-none rounded-lg border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 focus:ring-0"
          />

          {/* Category chips */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all",
                  category === cat.value
                    ? "bg-brand-green text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between border-t pt-3">
            <span
              className={cn(
                "text-xs tabular-nums",
                remaining < 40 ? (remaining < 0 ? "text-destructive" : "text-amber-500") : "text-muted-foreground/40",
              )}
            >
              {remaining}
            </span>
            <div className="flex items-center gap-3">
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={!canSubmit || isPending}
                className="rounded-full bg-brand-green px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-brand-green/90 disabled:opacity-40"
              >
                {isPending ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
