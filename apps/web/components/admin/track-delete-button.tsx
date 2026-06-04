"use client";

import { useTransition } from "react";
import { adminDeleteTrack } from "~/actions/admin";

export function TrackDeleteButton({
  trackId,
  trackLabel,
}: {
  trackId: string;
  trackLabel: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete "${trackLabel}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await adminDeleteTrack(trackId);
      if (!result.success) {
        alert(result.error ?? "Delete failed.");
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
    >
      {isPending ? "…" : "Delete"}
    </button>
  );
}
