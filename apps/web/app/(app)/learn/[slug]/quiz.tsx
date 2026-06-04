"use client";

import { useState } from "react";
import Link from "next/link";
import { submitQuizAnswers } from "~/actions/quiz";

interface Choice {
  id: string;
  label: string;
  correct: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  choices: Choice[];
  order: number;
}

type LessonOrigin = "foundation-path" | "roadmap";

interface QuizSectionProps {
  lessonId: string;
  quizzes: QuizQuestion[];
  alreadyCompleted: boolean;
  origin: LessonOrigin;
}

function backHrefFor(origin: LessonOrigin): string {
  return origin === "foundation-path" ? "/assessment/foundation-path" : "/roadmap";
}

function backLabelFor(origin: LessonOrigin): string {
  return origin === "foundation-path" ? "Back to foundation-path" : "Back to roadmap";
}

export function QuizSection({
  lessonId,
  quizzes,
  alreadyCompleted,
  origin,
}: QuizSectionProps) {
  const [retaking, setRetaking] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showForm = !alreadyCompleted || retaking;
  const allAnswered = quizzes.every((q) => answers[q.id] !== undefined);

  function handleSelect(quizId: string, choiceId: string) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [quizId]: choiceId }));
  }

  async function handleSubmit() {
    if (!allAnswered || loading) return;
    setLoading(true);
    setError(null);

    try {
      const result = await submitQuizAnswers(
        lessonId,
        answers,
        quizzes.map((q) => ({
          id: q.id,
          choices: q.choices,
        })),
      );

      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setScore(result.score);
      setSubmitted(true);
    } catch (err) {
      console.error("[quiz] submit error:", err);
      setError("Failed to submit quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!showForm) {
    return (
      <div className="rounded-xl border p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Quiz complete</p>
            <p className="text-sm text-muted-foreground mt-0.5">You&apos;ve already completed this lesson.</p>
          </div>
          <button
            onClick={() => { setRetaking(true); setAnswers({}); setSubmitted(false); setScore(null); }}
            className="inline-flex rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Retake quiz
          </button>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={backHrefFor(origin)}
            className="inline-flex rounded-full border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            ← {backLabelFor(origin)}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-6">
      <h2 className="font-semibold text-base mb-6">Quiz</h2>

      <div className="space-y-8">
        {quizzes.map((q, i) => (
          <div key={q.id}>
            <p className="text-sm font-medium mb-3">{i + 1}. {q.question}</p>
            <div className="space-y-2">
              {q.choices.map((choice) => {
                const selected = answers[q.id] === choice.id;
                let cls = "flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm cursor-pointer transition-colors";
                if (submitted) {
                  cls += choice.correct
                    ? " border-green-500 bg-green-500/10 text-green-700"
                    : selected
                    ? " border-red-400 bg-red-500/10 text-red-700"
                    : " text-muted-foreground";
                } else {
                  cls += selected ? " border-primary bg-primary/5" : " hover:border-foreground/30";
                }
                return (
                  <label key={choice.id} className={cls}>
                    <input type="radio" name={q.id} value={choice.id} checked={selected} onChange={() => handleSelect(q.id, choice.id)} disabled={submitted} className="sr-only" />
                    <span className="h-4 w-4 rounded-full border flex-shrink-0 flex items-center justify-center">
                      {selected && <span className="h-2 w-2 rounded-full bg-current" />}
                    </span>
                    {choice.label}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <div className="mt-8 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-400 bg-red-500/10 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || loading}
            className="w-full rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Submitting..." : "Submit answers"}
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
            score !== null && score >= 70
              ? "bg-green-500/10 text-green-700"
              : score !== null && score >= 40
              ? "bg-amber-500/10 text-amber-700"
              : "bg-red-500/10 text-red-700"
          }`}>
            {score !== null && (
              <>You scored {score}%{" "}{score >= 70 ? "— great work!" : score >= 40 ? "— keep practicing." : "— review the lesson and try again."}</>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {score !== null && score < 70 && (
              <button
                onClick={() => {
                  setRetaking(true);
                  setAnswers({});
                  setSubmitted(false);
                  setScore(null);
                  setError(null);
                }}
                className="inline-flex rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                Retry quiz
              </button>
            )}
            <Link
              href={backHrefFor(origin)}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← {backLabelFor(origin)}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
