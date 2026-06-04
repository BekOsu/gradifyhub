"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitSelfAssessment } from "~/actions/self-assessment";
import type { SelfAssessmentAnswer } from "~/lib/journey/self-assessment-questions";

const LEVEL_META = [
  { key: 0, label: "None yet", subtitle: "haven't worked in this area" },
  { key: 1, label: "L1 — Foundations", subtitle: "can do with help" },
  { key: 2, label: "L2 — Working", subtitle: "does this unsupervised" },
  { key: 3, label: "L3 — Designing", subtitle: "makes architectural choices" },
  { key: 4, label: "L4 — Teaching", subtitle: "sets the bar for others" },
] as const;

interface Dimension {
  key: string;
  label: string;
  isCritical: boolean;
  levels: { L1: string; L2: string; L3: string; L4: string };
  mcqScore?: number;
  existingLevel?: number;
}

interface SelfAssessmentFormProps {
  dimensions: Dimension[];
}

const ALL_YES: SelfAssessmentAnswer[] = ["yes", "yes", "yes", "yes", "yes"];
const ALL_NO: SelfAssessmentAnswer[] = ["no", "no", "no", "no", "no"];

function levelToAnswers(n: number) {
  return {
    l1: n >= 1 ? ALL_YES : ALL_NO,
    l2: n >= 2 ? ALL_YES : ALL_NO,
    l3: n >= 3 ? ALL_YES : ALL_NO,
    l4: n >= 4 ? ALL_YES : ALL_NO,
  };
}

export function SelfAssessmentForm({ dimensions }: SelfAssessmentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [selections, setSelections] = useState<Record<string, number>>(() =>
    Object.fromEntries(dimensions.map((d) => [d.key, d.existingLevel ?? 0])),
  );

  const current = dimensions[step];
  if (!current) return null;

  const selected = selections[current.key] ?? 0;

  const levelDescriptions: Record<number, string> = {
    1: current.levels.L1,
    2: current.levels.L2,
    3: current.levels.L3,
    4: current.levels.L4,
  };

  function handleSubmit() {
    setError(null);
    const input = {
      dimensions: dimensions.map((d) => ({
        dimension: d.key,
        ...levelToAnswers(selections[d.key] ?? 0),
      })),
    };

    startTransition(async () => {
      const result = await submitSelfAssessment(input);
      if (!result.success) {
        setError(result.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.push("/roadmap/generate");
    });
  }

  const isLast = step === dimensions.length - 1;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Skill {step + 1} of {dimensions.length}
        </span>
        <div className="flex gap-1">
          {dimensions.map((d, i) => (
            <button
              key={d.key}
              onClick={() => setStep(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === step
                  ? "bg-primary"
                  : i < step
                    ? "bg-primary/40"
                    : "bg-muted"
              }`}
              aria-label={`Go to ${d.label}`}
            />
          ))}
        </div>
      </div>

      {/* Dimension card */}
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-1 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">{current.label}</h2>
            {current.isCritical && (
              <span className="mt-1 inline-block rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
                Critical for your track
              </span>
            )}
          </div>
          {current.mcqScore !== undefined && (
            <div className="shrink-0 text-right text-xs text-muted-foreground">
              MCQ baseline
              <div className="text-sm font-semibold text-foreground">
                {current.mcqScore}%
              </div>
            </div>
          )}
        </div>

        <p className="mb-5 text-xs text-muted-foreground">
          Pick the highest level that honestly describes where you are with{" "}
          <span className="font-medium text-foreground">{current.label}</span>.
        </p>

        {/* Level cards */}
        <div className="space-y-2.5">
          {LEVEL_META.map(({ key: lvl, label, subtitle }) => {
            const isSelected = selected === lvl;
            const description = levelDescriptions[lvl];

            return (
              <button
                key={lvl}
                type="button"
                onClick={() =>
                  setSelections((prev) => ({ ...prev, [current.key]: lvl }))
                }
                className={`w-full rounded-lg border p-4 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border bg-background hover:border-primary/40 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {label}
                      </span>
                      <span className="text-xs text-muted-foreground">{subtitle}</span>
                    </div>
                    {description && (
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {description}
                      </p>
                    )}
                  </div>
                  <div
                    className={`shrink-0 h-4 w-4 rounded-full border-2 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-40"
        >
          Previous
        </button>
        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Save & Generate Roadmap"}
          </button>
        ) : (
          <button
            onClick={() => setStep((s) => Math.min(dimensions.length - 1, s + 1))}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
