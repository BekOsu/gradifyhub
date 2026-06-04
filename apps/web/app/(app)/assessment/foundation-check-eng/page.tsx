"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

type Answer = "yes" | "tried" | "no";

const QUESTIONS = [
  {
    id: "reading",
    question: "Can you read and understand English technical documentation (API docs, READMEs)?",
    options: [
      { value: "yes" as Answer, label: "Yes — comfortable", points: 1 },
      { value: "tried" as Answer, label: "With some effort", points: 1 },
      { value: "no" as Answer, label: "Very difficult for me", points: 0 },
    ],
  },
  {
    id: "listening",
    question: "Can you follow English technical talks or podcasts (conference talks, tutorials)?",
    options: [
      { value: "yes" as Answer, label: "Yes — at normal speed", points: 1 },
      { value: "tried" as Answer, label: "At slower speed / with subtitles", points: 1 },
      { value: "no" as Answer, label: "Very hard to follow", points: 0 },
    ],
  },
  {
    id: "speaking",
    question: "Can you participate in English stand-ups or live meetings?",
    options: [
      { value: "yes" as Answer, label: "Yes — confidently", points: 1 },
      { value: "tried" as Answer, label: "With preparation", points: 1 },
      { value: "no" as Answer, label: "Not yet", points: 0 },
    ],
  },
  {
    id: "writing",
    question: "Can you write clear PR descriptions, Slack messages, or code comments in English?",
    options: [
      { value: "yes" as Answer, label: "Yes", points: 1 },
      { value: "tried" as Answer, label: "Basic writing, needs improvement", points: 1 },
      { value: "no" as Answer, label: "Very limited", points: 0 },
    ],
  },
  {
    id: "cultural",
    question: "Are you comfortable with English workplace norms (directness, feedback culture, tone)?",
    options: [
      { value: "yes" as Answer, label: "Yes — mostly comfortable", points: 1 },
      { value: "tried" as Answer, label: "Getting used to it", points: 1 },
      { value: "no" as Answer, label: "It feels quite different from my background", points: 0 },
    ],
  },
];

export default function FoundationCheckEngPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === QUESTIONS.length;

  const handleAnswer = (questionId: string, value: Answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!allAnswered || loading) return;
    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch("/api/actions/foundation-check-eng", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error("Invalid response format from server");
      }

      if (!response.ok) {
        throw new Error(result?.error || "Failed to submit foundation check");
      }

      if (result.needsFoundationPath) {
        router.push("/assessment/foundation-path-eng");
      } else {
        router.push("/roadmap?track=english-proficiency");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-16 px-4 sm:px-6 lg:px-8">
      {/* ── Back nav ── */}
      <Link
        href="/roadmap?track=english-proficiency"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to English track
      </Link>

      {/* ── Hero ── */}
      <div className="space-y-4">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-600">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
            English Proficiency · Foundation Check
          </span>
          <h1 className="text-3xl font-bold tracking-tight">
            How&apos;s your English for work?
          </h1>
          <p className="text-base text-muted-foreground max-w-lg">
            5 self-rated questions about your English in a tech workplace. Be honest — this helps us show you the most useful lessons first.
          </p>
        </div>
      </div>

      {/* ── Questions ── */}
      <div className="space-y-6">
        {QUESTIONS.map((q, idx) => (
          <div key={q.id} className="space-y-3">
            <p className="text-sm font-semibold">
              <span className="text-muted-foreground">{idx + 1}.</span> {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card cursor-pointer transition-colors hover:bg-muted"
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={opt.value}
                    checked={answers[q.id] === opt.value}
                    onChange={() => handleAnswer(q.id, opt.value)}
                    className="h-4 w-4 rounded-full"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* ── CTA ── */}
      <div className="space-y-3">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || loading}
          className="w-full rounded-lg bg-foreground px-4 py-3 text-sm font-semibold text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-foreground/90"
        >
          {loading ? "Checking..." : allAnswered ? "See my results" : `Answer all questions (${answeredCount}/5)`}
        </button>
        <p className="text-xs text-muted-foreground text-center">Takes ~2 minutes</p>
      </div>
    </div>
  );
}
