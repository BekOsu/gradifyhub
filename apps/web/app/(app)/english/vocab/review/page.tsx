"use client";

import { useEffect, useState, useTransition } from "react";
import { startReviewAction, submitGradeAction } from "~/actions/english/review";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type ReviewItem = {
  userVocabId: string;
  phrase: string;
  meaning: string;
  category: string;
  example: string | null;
  retrievability: number;
  stability: string;
  lastReviewedAt: Date | null;
};

type Phase = "loading" | "front" | "back" | "done";

export default function ReviewPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewed, setReviewed] = useState<{ grade: number }[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const init = async () => {
      const result = await startReviewAction(20);

      if (result.success && result.items) {
        const typedItems: ReviewItem[] = result.items.map((item) => ({
          ...item,
          lastReviewedAt: item.lastReviewedAt ? new Date(item.lastReviewedAt) : null,
        }));

        if (typedItems.length === 0) {
          setPhase("done");
        } else {
          setItems(typedItems);
          setPhase("front");
        }
      } else {
        setPhase("done");
      }
    };

    init();
  }, []);

  const handleRevealAnswer = () => {
    setPhase("back");
  };

  const handleGrade = (grade: 1 | 2 | 3 | 4) => {
    if (currentIndex >= items.length) return;

    const currentItem = items[currentIndex];
    if (!currentItem) return;

    startTransition(async () => {
      await submitGradeAction(currentItem.userVocabId, grade);

      const newReviewed = [...reviewed, { grade }];
      setReviewed(newReviewed);

      const nextIndex = currentIndex + 1;
      if (nextIndex >= items.length) {
        setPhase("done");
      } else {
        setCurrentIndex(nextIndex);
        setPhase("front");
      }
    });
  };

  if (phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-border border-t-brand-green" />
          <p className="mt-4 text-sm text-muted-foreground">Loading review session...</p>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    if (reviewed.length === 0) {
      return (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="max-w-sm text-center">
            <h1 className="text-2xl font-semibold text-foreground">Nothing due right now</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Great job! Check back tomorrow for more words to review.
            </p>
            <Link
              href="/english/vocab"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-brand-green/90 hover:shadow-md active:scale-[0.98]"
            >
              Back to Vocabulary
            </Link>
          </div>
        </div>
      );
    }

    const avgGrade = reviewed.reduce((sum, r) => sum + r.grade, 0) / reviewed.length;
    const avgLabel =
      avgGrade < 1.5
        ? "Mostly Again"
        : avgGrade < 2.5
        ? "Mostly Hard"
        : avgGrade < 3.5
        ? "Mostly Good"
        : "Mostly Easy";

    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-sm rounded-2xl border bg-card p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-foreground">Session Complete!</h1>

          <div className="mt-6 space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">Cards reviewed</p>
              <p className="mt-1 text-3xl font-bold text-foreground">{reviewed.length}</p>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">Performance</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{avgLabel}</p>
            </div>
          </div>

          <Link
            href="/english/vocab"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-brand-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-brand-green/90 hover:shadow-md active:scale-[0.98]"
          >
            Back to Vocabulary
          </Link>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];
  if (!currentItem) return null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Daily Life":
        return "bg-blue-100 text-blue-700";
      case "Work":
        return "bg-purple-100 text-purple-700";
      case "Technical":
        return "bg-orange-100 text-orange-700";
      case "Opinion":
        return "bg-pink-100 text-pink-700";
      case "Social":
        return "bg-teal-100 text-teal-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRetrievabilityColor = (score: number) => {
    if (score >= 70) return "bg-green-100 text-green-700";
    if (score >= 40) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const progressPct = Math.round(((currentIndex + 1) / items.length) * 100);

  return (
    <div className="min-h-screen space-y-6 px-4 py-6 sm:px-0">
      {/* Back button */}
      <div className="mx-auto max-w-lg">
        <Link
          href="/english/vocab"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      {/* Progress bar */}
      <div className="mx-auto max-w-lg space-y-2">
        <div className="h-1 w-full rounded-full bg-border">
          <div
            className="h-full rounded-full bg-brand-green transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-center text-xs text-muted-foreground">
          {currentIndex + 1} / {items.length}
        </p>
      </div>

      {/* Flashcard */}
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="w-full max-w-lg rounded-2xl border bg-card p-8 shadow-sm">
          {phase === "front" && (
            <div className="space-y-6 text-center">
              <p className="text-3xl font-bold text-foreground">{currentItem.phrase}</p>
              <button
                onClick={handleRevealAnswer}
                className="inline-flex items-center gap-2 rounded-xl border border-brand-green px-4 py-2.5 text-sm font-semibold text-brand-green transition-all duration-150 hover:bg-brand-green/5"
              >
                Reveal Answer
              </button>
            </div>
          )}

          {phase === "back" && (
            <div className="space-y-6">
              {/* Answer */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Meaning
                </p>
                <p className="text-xl font-semibold text-foreground">{currentItem.meaning}</p>
              </div>

              {/* Category badge */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Category
                </p>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${getCategoryColor(currentItem.category)}`}>
                  {currentItem.category}
                </span>
              </div>

              {/* Example */}
              {currentItem.example && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Example
                  </p>
                  <p className="italic text-muted-foreground">{currentItem.example}</p>
                </div>
              )}

              {/* Retrievability badge */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Retrievability
                </p>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${getRetrievabilityColor(currentItem.retrievability)}`}>
                  {Math.round(currentItem.retrievability)}%
                </span>
              </div>

              {/* Grade buttons */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={() => handleGrade(1)}
                  disabled={isPending}
                  className="w-full rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-700 transition-all duration-150 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Again
                </button>
                <button
                  onClick={() => handleGrade(2)}
                  disabled={isPending}
                  className="w-full rounded-xl bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-700 transition-all duration-150 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hard
                </button>
                <button
                  onClick={() => handleGrade(3)}
                  disabled={isPending}
                  className="w-full rounded-xl bg-blue-100 px-4 py-3 text-sm font-semibold text-blue-700 transition-all duration-150 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Good
                </button>
                <button
                  onClick={() => handleGrade(4)}
                  disabled={isPending}
                  className="w-full rounded-xl bg-green-100 px-4 py-3 text-sm font-semibold text-green-700 transition-all duration-150 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Easy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
