"use client";

import { useTransition } from "react";
import { adminToggleTrack } from "~/actions/admin";

export function TrackToggle({ trackId, enabled }: { trackId: string; enabled: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(async () => { await adminToggleTrack(trackId, !enabled); })}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
        enabled
          ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
    >
      {isPending ? (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" aria-hidden="true">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      ) : (
        <span className={`h-1.5 w-1.5 rounded-full ${enabled ? "bg-green-500" : "bg-muted-foreground"}`} />
      )}
      {enabled ? "Enabled" : "Disabled"}
    </button>
  );
}