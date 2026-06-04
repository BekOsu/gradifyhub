"use client";
import { useTransition, useState } from "react";
import { recordOutcomeAction } from "./actions";

const OUTCOMES = ["hired", "promoted", "freelance", "salary"] as const;
type Outcome = (typeof OUTCOMES)[number];

const LABELS: Record<Outcome, string> = {
  hired: "New job",
  promoted: "Promoted",
  freelance: "Freelance project",
  salary: "Salary increase",
};

export function OutcomeTracker({ currentOutcome }: { currentOutcome?: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (outcome: Outcome) => {
    if (isPending) return;
    setError(null);
    const formData = new FormData();
    formData.set("outcome", outcome);
    startTransition(async () => {
      const result = await recordOutcomeAction(null, formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <section className="rounded-xl border p-5">
      <h2 className="text-sm font-semibold">Track your outcome</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Your outcome data helps calibrate Roadmap recommendations for everyone.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {OUTCOMES.map((outcome) => {
          const isSelected = currentOutcome === outcome;
          return (
            <button
              key={outcome}
              type="button"
              disabled={isPending}
              onClick={() => handleSelect(outcome)}
              className={`w-full rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                isSelected
                  ? "border-brand-green bg-brand-green/10 text-brand-green"
                  : "hover:border-muted-foreground/50 hover:bg-muted/50"
              }`}
            >
              {isPending ? "…" : isSelected ? `✓ ${LABELS[outcome]}` : LABELS[outcome]}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="mt-3 text-xs text-destructive">{error}</p>
      )}
      {!error && currentOutcome && (
        <p className="mt-3 text-xs text-muted-foreground">
          Recorded. This helps your Roadmap improve for everyone on a similar path.
        </p>
      )}
    </section>
  );
}
