"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { MockQuestion } from "@repo/contracts/interview-prep";
import { evaluateAnswerAction } from "~/actions/interview-practice";

type Evaluation = {
  score: number;
  feedback: string;
  exampleAnswer: string;
};

const TYPE_LABELS: Record<MockQuestion["type"], string> = {
  technical: "Technical",
  behavioral: "Behavioral",
  "system-design": "System Design",
  coding: "Coding",
};

const DIFFICULTY_STYLES: Record<MockQuestion["difficulty"], string> = {
  easy: "text-green-600 dark:text-green-400",
  medium: "text-amber-600 dark:text-amber-400",
  hard: "text-red-600 dark:text-red-400",
};

function scoreColor(score: number): string {
  if (score >= 70) return "text-green-600 dark:text-green-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Strong answer";
  if (score >= 70) return "Good answer";
  if (score >= 50) return "Partial — review the example";
  return "Needs improvement";
}

export function PracticeClient({
  sessionId,
  questions,
}: {
  sessionId: string;
  questions: MockQuestion[];
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const question = questions[index];
  const isLast = index === questions.length - 1;

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await evaluateAnswerAction(sessionId, index, answer);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setEvaluation({ score: result.score, feedback: result.feedback, exampleAnswer: result.exampleAnswer });
    });
  }

  function next() {
    if (isLast) {
      router.push(`/interview-prep/${sessionId}`);
      return;
    }
    setIndex((i) => i + 1);
    setAnswer("");
    setEvaluation(null);
    setError(null);
  }

  if (!question) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Question {index + 1} of {questions.length}</span>
          <span>{Math.round(((index) / questions.length) * 100)}% done</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-primary transition-all"
            style={{ width: `${((index) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="rounded-xl border p-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {TYPE_LABELS[question.type]}
          </span>
          <span className={`text-xs font-medium capitalize ${DIFFICULTY_STYLES[question.difficulty]}`}>
            {question.difficulty}
          </span>
        </div>
        <p className="text-base font-semibold leading-snug">{question.question}</p>
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground/70">Hint: </span>
          {question.hint}
        </p>
      </div>

      {/* Answer textarea */}
      {!evaluation && (
        <div className="space-y-3">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here…"
            rows={8}
            className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring resize-none"
            disabled={isPending}
          />
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          <button
            type="button"
            onClick={submit}
            disabled={isPending || answer.trim().length < 10}
            className="inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Evaluating…" : "Submit answer"}
          </button>
        </div>
      )}

      {/* Evaluation result */}
      {evaluation && (
        <div className="space-y-4">
          {/* Score */}
          <div className="rounded-xl border p-5 space-y-1 text-center">
            <p className={`text-5xl font-bold tabular-nums ${scoreColor(evaluation.score)}`}>
              {evaluation.score}
            </p>
            <p className="text-sm font-medium text-muted-foreground">{scoreLabel(evaluation.score)}</p>
          </div>

          {/* Feedback */}
          <div className="rounded-xl border p-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Feedback</p>
            <p className="text-sm leading-relaxed">{evaluation.feedback}</p>
          </div>

          {/* Example answer */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Model answer</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{evaluation.exampleAnswer}</p>
          </div>

          <button
            type="button"
            onClick={next}
            className="inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {isLast ? "Finish practice →" : "Next question →"}
          </button>
        </div>
      )}
    </div>
  );
}
