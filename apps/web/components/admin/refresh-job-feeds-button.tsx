"use client";

import { useState, useTransition } from "react";
import { refreshAllJobFeeds } from "~/actions/job-feed";

type Status =
  | { kind: "idle" }
  | { kind: "success"; updated: number }
  | { kind: "error"; message: string };

export function RefreshJobFeedsButton() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  function handleClick() {
    startTransition(async () => {
      try {
        const result = await refreshAllJobFeeds();
        setStatus({ kind: "success", updated: result.updated });
        setTimeout(() => setStatus({ kind: "idle" }), 4000);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setStatus({ kind: "error", message });
        setTimeout(() => setStatus({ kind: "idle" }), 4000);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-50"
      >
        {isPending && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-spin"
            aria-hidden="true"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        )}
        {isPending ? "Refreshing…" : "Refresh job feeds"}
      </button>
      {status.kind === "success" && (
        <span className="text-sm font-medium text-green-600">
          Updated {status.updated} track(s)
        </span>
      )}
      {status.kind === "error" && (
        <span className="text-sm font-medium text-red-600">
          Failed — {status.message}
        </span>
      )}
    </div>
  );
}
