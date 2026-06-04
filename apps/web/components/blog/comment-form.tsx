"use client";

import { useState, useTransition, useRef } from "react";
import { addCommentAction } from "~/actions/blog";
import { cn } from "~/lib/utils";

interface CommentFormProps {
  slug: string;
  userInitials: string;
}

export function CommentForm({ slug, userInitials }: CommentFormProps) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const remaining = 2000 - body.length;
  const canSubmit = body.trim().length >= 2 && body.length <= 2000;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);

    startTransition(async () => {
      const result = await addCommentAction(slug, body);
      if (result.success) {
        setBody("");
        textareaRef.current?.blur();
      } else {
        setError(result.error ?? "Failed to post comment.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-green/15 text-xs font-bold text-brand-green ring-2 ring-brand-green/20">
        {userInitials}
      </div>
      <div className="flex-1 space-y-2">
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your thoughts…"
          rows={3}
          disabled={isPending}
          className={cn(
            "w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand-green/50 focus:ring-2 focus:ring-brand-green/20",
            error && "border-destructive",
          )}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!canSubmit || isPending}
              className="rounded-full bg-brand-green px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-brand-green/90 disabled:opacity-40"
            >
              {isPending ? "Posting…" : "Post comment"}
            </button>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <span
            className={cn(
              "text-xs tabular-nums",
              remaining < 100 ? "text-amber-500" : "text-muted-foreground/50",
            )}
          >
            {remaining}
          </span>
        </div>
      </div>
    </form>
  );
}
