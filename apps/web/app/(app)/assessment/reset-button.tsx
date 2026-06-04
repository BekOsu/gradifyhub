"use client";

import { useState } from "react";
import { startFreshAttempt } from "~/actions/assessment-start";
import { useRouter } from "next/navigation";

export function ResetAssessmentButton() {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    setLoading(true);
    try {
      const { attemptId, currentIndex } = await startFreshAttempt();
      router.push(`/assessment/q/${currentIndex + 1}?attempt=${attemptId}`);
    } catch {
      setLoading(false);
      setConfirm(false);
    }
  }

  if (!confirm) {
    return (
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
      >
        Start from scratch
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <p className="text-xs text-muted-foreground">Your progress will be lost.</p>
      <button
        type="button"
        onClick={() => void handleReset()}
        disabled={loading}
        className="rounded-md bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
      >
        {loading ? "Resetting…" : "Yes, reset"}
      </button>
      <button
        type="button"
        onClick={() => setConfirm(false)}
        disabled={loading}
        className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  );
}
