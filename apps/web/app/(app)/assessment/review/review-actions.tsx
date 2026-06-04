"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitFinalResponse, abandonAttempt } from "~/actions/assessment";

export function ReviewActions({ attemptId, hasUnanswered }: { attemptId: string; hasUnanswered: boolean }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [abandoning, setAbandoning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const result = await submitFinalResponse(attemptId);

    if (!result.success) {
      setError(result.error ?? "Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    router.push(`/assessment/results/${result.attemptId}`);
  }

  async function handleAbandon() {
    setAbandoning(true);
    setError(null);

    const result = await abandonAttempt({ attemptId });

    if (!result.success) {
      setError(result.error ?? "Something went wrong. Please try again.");
      setAbandoning(false);
      return;
    }

    router.push("/assessment");
  }

  return (
    <div className="border-t pt-6 space-y-4">
      <div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1" />

        <div className="flex flex-col gap-2 sm:flex-row">
          {!showConfirm ? (
            <>
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={abandoning}
                className="rounded-md border border-destructive bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/20 disabled:opacity-50"
              >
                Abandon attempt
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || hasUnanswered}
                className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? "Submitting Assessment…" : "Submit final Assessment"}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground py-2">
                Are you sure? You can start a fresh attempt anytime.
              </p>
              <button
                type="button"
                onClick={handleAbandon}
                disabled={abandoning}
                className="rounded-md bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                {abandoning ? "Abandoning…" : "Yes, abandon"}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={abandoning}
                className="rounded-md border border-input bg-background px-4 py-2.5 text-sm font-semibold hover:bg-muted disabled:opacity-50"
              >
                Keep attempting
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
