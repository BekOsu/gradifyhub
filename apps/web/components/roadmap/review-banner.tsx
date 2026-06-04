"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmRoadmap } from "~/actions/assessment-hitl";

type Phase = { id: string; name: string; weeks: number };

export function RoadmapReviewBanner({
  roadmapId,
  phases,
}: {
  roadmapId: string;
  phases: Phase[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  function togglePhase(id: string) {
    setSkipped((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleConfirm() {
    startTransition(async () => {
      const result = await confirmRoadmap(roadmapId, Array.from(skipped));
      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mb-6 rounded-xl border-2 border-primary/20 bg-primary/5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">Review your AI-generated roadmap</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Check any phases you already know — we will remove them and tighten your Roadmap.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {phases.map((p) => {
          const isSkipped = skipped.has(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => togglePhase(p.id)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                isSkipped
                  ? "border-green-500 bg-green-500/10 text-green-700 line-through"
                  : "border-input bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              <span
                className={`h-3.5 w-3.5 shrink-0 rounded border transition-colors ${
                  isSkipped ? "border-green-500 bg-green-500" : "border-muted-foreground"
                }`}
              />
              {p.name} · {p.weeks}w
            </button>
          );
        })}
      </div>

      {skipped.size > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          {skipped.size} phase{skipped.size > 1 ? "s" : ""} will be removed.{" "}
          {phases.length - skipped.size} remaining.
        </p>
      )}

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={pending}
          className="inline-flex items-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? "Saving…" : skipped.size > 0 ? "Remove selected & confirm" : "Looks good — confirm roadmap"}
        </button>
        <button
          type="button"
          onClick={() => {
            startTransition(async () => {
              await confirmRoadmap(roadmapId, []);
              router.refresh();
            });
          }}
          disabled={pending}
          className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          Skip review
        </button>
      </div>
    </div>
  );
}
