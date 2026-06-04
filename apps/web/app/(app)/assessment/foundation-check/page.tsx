"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

type Answer = "yes" | "tried" | "no";

const QUESTIONS = [
  {
    id: "python",
    question: "Can you write a Python function?",
    options: [
      { value: "yes" as Answer, label: "Yes", points: 1 },
      { value: "tried" as Answer, label: "Tried it once", points: 1 },
      { value: "no" as Answer, label: "No", points: 0 },
    ],
  },
  {
    id: "api",
    question: "What is an API?",
    options: [
      { value: "yes" as Answer, label: "I use them regularly", points: 1 },
      { value: "tried" as Answer, label: "Heard of it / tried once", points: 1 },
      { value: "no" as Answer, label: "No idea", points: 0 },
    ],
  },
  {
    id: "database",
    question: "Have you used a database (SQL, MongoDB, etc.)?",
    options: [
      { value: "yes" as Answer, label: "Yes", points: 1 },
      { value: "tried" as Answer, label: "Tried once", points: 1 },
      { value: "no" as Answer, label: "No", points: 0 },
    ],
  },
  {
    id: "cli",
    question: "Comfortable with command line / terminal?",
    options: [
      { value: "yes" as Answer, label: "Yes", points: 1 },
      { value: "tried" as Answer, label: "A little", points: 1 },
      { value: "no" as Answer, label: "No", points: 0 },
    ],
  },
  {
    id: "git",
    question: "Ever used Git for version control?",
    options: [
      { value: "yes" as Answer, label: "Yes", points: 1 },
      { value: "tried" as Answer, label: "Tried it", points: 1 },
      { value: "no" as Answer, label: "No", points: 0 },
    ],
  },
];

export default function FoundationCheckPage() {
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
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

      const response = await fetch("/api/actions/foundation-check", {
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
        router.push("/assessment/foundation-path");
      } else {
        router.push("/assessment");
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
        href="/assessment"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to assessment
      </Link>

      {/* ── Hero ── */}
      <div className="space-y-4">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            Foundation Check
          </span>
          <h1 className="text-3xl font-bold tracking-tight">
            Let&apos;s see where you&apos;re starting from
          </h1>
          <p className="text-base text-muted-foreground max-w-lg">
            Quick 5-question check to understand your baseline. This helps us recommend the right starting point — no pressure, be honest!
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
        <p className="text-xs text-muted-foreground text-center">
          Takes ~2 minutes
        </p>
      </div>
    </div>
  );
}
