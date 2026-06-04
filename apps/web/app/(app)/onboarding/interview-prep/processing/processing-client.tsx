"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  { id: "jd_extracted",       label: "Reading the job description",        detail: "Extracting company, role, requirements, and tech stack" },
  { id: "cv_parsed",          label: "Parsing your background",             detail: "Identifying your current skills and experience" },
  { id: "company_researched", label: "Researching the company",             detail: "Tech stack, engineering culture, and interview style" },
  { id: "gaps_analyzed",      label: "Identifying your skill gaps",         detail: "Your profile vs job requirements" },
  { id: "plan_built",         label: "Building your day-by-day prep plan",  detail: "Prioritised tasks until your interview" },
  { id: "questions_generated","label": "Generating mock interview questions","detail": "Targeted to your gaps and the role" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

function extractionMessage(source?: "pdf" | "docx" | "text"): string | null {
  if (source === "pdf") return "CV text extracted from PDF successfully.";
  if (source === "docx") return "CV text extracted from DOCX successfully.";
  if (source === "text") return "CV text loaded successfully.";
  return null;
}

export function ProcessingClient({
  sessionId,
  cvExtractionSource,
}: {
  sessionId: string;
  cvExtractionSource?: "pdf" | "docx" | "text";
}) {
  const router = useRouter();
  const [completed, setCompleted] = useState<Set<StepId>>(new Set());
  const [active, setActive] = useState<StepId | null>("jd_extracted");
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const res = await fetch("/api/interview-prep/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        if (!res.ok || !res.body) {
          setFailed("Pipeline request failed. Please try again.");
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (!cancelled) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          for (const line of text.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const event = JSON.parse(line.slice(6)) as { step: string; error?: string };

            if (event.step === "error") {
              setFailed(event.error ?? "Something went wrong.");
              return;
            }

            if (event.step === "done") {
              setActive(null);
              router.push(`/interview-prep/${sessionId}`);
              return;
            }

            const stepId = event.step as StepId;
            setCompleted((prev) => new Set([...prev, stepId]));

            // Set the next pending step as active
            const nextIdx = STEPS.findIndex((s) => s.id === stepId) + 1;
            if (nextIdx < STEPS.length) {
              setActive(STEPS[nextIdx]!.id);
            }
          }
        }
      } catch {
        if (!cancelled) setFailed("Connection interrupted. Please try again.");
      }
    }

    void run();
    return () => { cancelled = true; };
  }, [sessionId, router]);

  if (failed) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <p className="text-2xl font-bold tracking-tight">Something went wrong</p>
        <p className="text-sm text-muted-foreground">{failed}</p>
        <button
          onClick={() => router.push("/onboarding/interview-prep")}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    );
  }

  const isDone = active === null && completed.size === STEPS.length;

  const cvMessage = extractionMessage(cvExtractionSource);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {isDone ? "Your prep plan is ready" : "Preparing your plan…"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isDone ? "Taking you to your plan…" : "Our agents are working in parallel. This takes about 30 seconds."}
        </p>
      </div>

      {cvMessage && (
        <p className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-700 dark:text-emerald-300">
          {cvMessage}
        </p>
      )}

      <div className="w-full max-w-sm flex flex-col gap-2.5">
        {STEPS.map((step) => {
          const state = completed.has(step.id) ? "done" : active === step.id ? "active" : "pending";

          return (
            <div
              key={step.id}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-300 ${
                state === "done"
                  ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
                  : state === "active"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-muted/20 opacity-40"
              }`}
            >
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                {state === "done" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : state === "active" ? (
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                )}
              </span>
              <div className="flex flex-col gap-0.5">
                <span className={`text-sm font-medium ${state === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
                  {step.label}
                </span>
                <span className="text-xs text-muted-foreground">{step.detail}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

