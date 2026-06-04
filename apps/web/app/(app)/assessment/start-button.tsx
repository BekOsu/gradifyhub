"use client";

import Link from "next/link";
import { useState } from "react";
import { startAttempt } from "~/actions/assessment-start";
import { useRouter } from "next/navigation";

export function StartAssessmentButton({ label = "Start diagnostic" }: { label?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    setLoading(true);
    setError(null);
    try {
      const { attemptId, currentIndex } = await startAttempt();
      router.push(`/assessment/q/${currentIndex + 1}?attempt=${attemptId}`);
    } catch (err) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : "unknown";
      if (msg === "monthly_assessment_limit_reached") {
        setError("You've used your 1 free assessment this month. Upgrade to Pro for unlimited diagnostics.");
      } else {
        setError("Could not start assessment. Please try again.");
      }
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => void handleStart()}
        disabled={loading}
        className="inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "Starting…" : label}
      </button>
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}{" "}
          {error.includes("Upgrade") && (
            <Link href="/pricing" className="font-semibold underline underline-offset-4">
              See plans →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
