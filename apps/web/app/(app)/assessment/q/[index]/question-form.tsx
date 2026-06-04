"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useCallback } from "react";
import { submitResponse, skipQuestion } from "~/actions/assessment";
import { useAssessmentTimer } from "~/lib/assessment/timer";
import { Timer } from "./timer";

type AssessmentChoice = { id: string; label: string };
type AssessmentItem = {
  id: string;
  stem: string;
  choices: AssessmentChoice[];
  dimension: string;
};

export function QuestionForm({
  attemptId,
  item,
  signalLens,
  currentIndex,
  total,
  previousAnswer,
  canGoBack,
  skippedQuestions,
  startedAt,
  pausedAt,
  totalPauseMs,
  fromReview = false,
  timeExpiredAt,
}: {
  attemptId: string;
  item: AssessmentItem;
  signalLens: string;
  currentIndex: number;
  total: number;
  previousAnswer?: string;
  canGoBack: boolean;
  answeredQuestions: Set<number>;
  skippedQuestions: Set<number>;
  startedAt: Date;
  pausedAt: Date | null;
  totalPauseMs: number;
  fromReview?: boolean;
  timeExpiredAt: string | null;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(previousAnswer ?? null);
  const [skipped, setSkipped] = useState(skippedQuestions.has(currentIndex));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeExpired, setTimeExpired] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const startTime = useRef(Date.now());
  useAssessmentTimer(startedAt, pausedAt, totalPauseMs);

  const handleTimerExpired = useCallback(async () => {
    setTimeExpired(true);
    setLoading(true);
    setSubmitError(null);

    try {
      // Submit empty answer (null) and advance to next question
      const result = await submitResponse({
        attemptId,
        itemId: item.id,
        choiceId: null,
        timeMs: Date.now() - startTime.current,
      });

      if (result.success) {
        if (result.done) {
          router.push(`/roadmap/generate`);
        } else {
          router.push(`/assessment/q/${(result.nextIndex ?? 0) + 1}?attempt=${attemptId}`);
        }
      } else {
        setSubmitError(result.error ?? "Failed to submit answer. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("[assessment] failed to auto-submit on timer expiry:", err);
      setSubmitError("Connection error. Please check your network and refresh.");
      setLoading(false);
    }
  }, [attemptId, item.id, router]);

  async function saveAnswer() {
    if (!selected) {
      setError("Please select an answer.");
      return false;
    }

    const timeMs = Date.now() - startTime.current;
    const result = await submitResponse({
      attemptId,
      itemId: item.id,
      choiceId: selected,
      timeMs,
    });

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return false;
    }

    return result;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await saveAnswer();
    if (!result) {
      setLoading(false);
      return;
    }

    if (fromReview) {
      router.push(`/assessment/review`);
    } else if (result.done) {
      router.push(`/roadmap/generate`);
    } else {
      router.push(`/assessment/q/${(result.nextIndex ?? 0) + 1}?attempt=${attemptId}`);
    }
  }

  async function handleNext() {
    if (skipped) {
      if (fromReview || currentIndex + 1 === total) {
        router.push(`/assessment/review`);
      } else {
        router.push(`/assessment/q/${currentIndex + 2}?attempt=${attemptId}`);
      }
      return;
    }

    if (!selected) {
      setError("Please select an answer or skip this question.");
      return;
    }

    setLoading(true);
    const result = await saveAnswer();
    if (!result) {
      setLoading(false);
      return;
    }

    if (result.done) {
      router.push(`/roadmap/generate`);
    } else if (fromReview || currentIndex + 1 === total) {
      router.push(`/assessment/review`);
    } else {
      router.push(`/assessment/q/${currentIndex + 2}?attempt=${attemptId}`);
    }
  }

  async function handlePrevious() {
    if (fromReview) {
      router.push(`/assessment/review`);
      return;
    }

    if (selected && !skipped) {
      setLoading(true);
      const result = await saveAnswer();
      if (!result) {
        setLoading(false);
        return;
      }
    }

    router.push(`/assessment/q/${currentIndex}?attempt=${attemptId}`);
  }

  async function handleSkip() {
    setLoading(true);
    const result = await skipQuestion({ attemptId, itemId: item.id });
    if (!result.success) {
      setError(result.error ?? "Could not skip this question.");
      setLoading(false);
      return;
    }
    setSkipped(true);
    setLoading(false);
  }

  const LABELS = ["A", "B", "C", "D", "E"];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <Timer
        attemptId={attemptId}
        timeExpiredAt={timeExpiredAt}
        startedAt={startedAt.toISOString()}
        totalPauseMs={totalPauseMs}
        onExpired={handleTimerExpired}
        perQuestion={true}
        questionIndex={currentIndex}
      />

      {/* Question */}
      <div className="space-y-2">
        <p className="text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl">{item.stem}</p>
        <p className="text-xs text-muted-foreground/70 italic">{signalLens}</p>
      </div>

      {/* Status chips */}
      {(previousAnswer && !skipped) || skipped ? (
        <div className="flex gap-2">
          {previousAnswer && !skipped && (
            <span className="inline-flex items-center rounded-full border border-brand-green/25 bg-brand-green/8 px-2.5 py-0.5 text-xs font-medium text-brand-green">
              Previously answered
            </span>
          )}
          {skipped && (
            <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600">
              Skipped
            </span>
          )}
        </div>
      ) : null}

      {/* Choices */}
      <div className="flex flex-col gap-2.5">
        {item.choices.map((choice, i) => {
          const isSelected = selected === choice.id;
          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => {
                setSelected(choice.id);
                setSkipped(false);
              }}
              disabled={skipped}
              className={`group flex items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-150 sm:p-5 ${
                isSelected
                  ? "border-brand-green/40 bg-brand-green/5 shadow-sm ring-1 ring-brand-green/20"
                  : "border-border bg-card hover:border-border/80 hover:bg-muted/40 hover:shadow-sm"
              } ${skipped ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  isSelected
                    ? "bg-brand-green text-white"
                    : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                }`}
              >
                {LABELS[i]}
              </span>
              <span className={`text-sm leading-relaxed ${isSelected ? "font-medium text-foreground" : "text-foreground/85"}`}>
                {choice.label}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}

      {submitError && (
        <div className="space-y-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-2.5">
          <p className="text-sm text-destructive">{submitError}</p>
          {timeExpired && (
            <button
              type="button"
              onClick={() => {
                setSubmitError(null);
                handleTimerExpired();
              }}
              disabled={loading}
              className="text-xs font-medium text-destructive underline hover:no-underline"
            >
              Retry submission
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-5">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={!canGoBack || loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground disabled:opacity-40"
        >
          {fromReview ? "← Review" : "← Previous"}
        </button>

        <div className="flex items-center gap-3">
          {!selected && !skipped && (
            <button
              type="button"
              onClick={handleSkip}
              disabled={loading}
              className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Skip
            </button>
          )}

          {skipped ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={loading || timeExpired}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-green px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-green/90 active:scale-[0.98] disabled:opacity-50"
            >
              {fromReview ? "Back to review →" : currentIndex + 1 === total ? "Review results →" : "Next →"}
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || !selected}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-green px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-green/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Saving…" : fromReview ? "Save answer" : currentIndex + 1 === total ? "Finish" : "Continue →"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
