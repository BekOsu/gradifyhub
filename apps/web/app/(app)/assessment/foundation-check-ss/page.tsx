"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

type Answer = "yes" | "tried" | "no";

const QUESTIONS = [
  {
    id: "written",
    question: "Have you written a pull request description or technical spec for a teammate?",
    options: [
      { value: "yes" as Answer, label: "Yes — regularly", points: 1 },
      { value: "tried" as Answer, label: "Once or twice", points: 1 },
      { value: "no" as Answer, label: "Not yet", points: 0 },
    ],
  },
  {
    id: "discovery",
    question: "Have you led or participated in a scoping / discovery call with a client or stakeholder?",
    options: [
      { value: "yes" as Answer, label: "Yes", points: 1 },
      { value: "tried" as Answer, label: "Sat in on one", points: 1 },
      { value: "no" as Answer, label: "No", points: 0 },
    ],
  },
  {
    id: "async",
    question: "Do you communicate progress updates asynchronously (Slack, Loom, written stand-up)?",
    options: [
      { value: "yes" as Answer, label: "Yes — it's my default", points: 1 },
      { value: "tried" as Answer, label: "Sometimes", points: 1 },
      { value: "no" as Answer, label: "I prefer live meetings", points: 0 },
    ],
  },
  {
    id: "codereview",
    question: "Have you given or received a thorough code review (comments, suggestions, back-and-forth)?",
    options: [
      { value: "yes" as Answer, label: "Yes", points: 1 },
      { value: "tried" as Answer, label: "A few times", points: 1 },
      { value: "no" as Answer, label: "No", points: 0 },
    ],
  },
  {
    id: "conflict",
    question: "Have you navigated a work conflict or disagreement with a colleague or manager?",
    options: [
      { value: "yes" as Answer, label: "Yes, resolved it well", points: 1 },
      { value: "tried" as Answer, label: "Tried, mixed results", points: 1 },
      { value: "no" as Answer, label: "Avoided it / not happened", points: 0 },
    ],
  },
];

export default function FoundationCheckSSPage() {
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

      const response = await fetch("/api/actions/foundation-check-ss", {
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
        router.push("/assessment/foundation-path-ss");
      } else {
        router.push("/roadmap?track=soft-skills");
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
        href="/roadmap?track=soft-skills"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Soft Skills track
      </Link>

      {/* ── Hero ── */}
      <div className="space-y-4">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-600">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
            Soft Skills · Foundation Check
          </span>
          <h1 className="text-3xl font-bold tracking-tight">
            Where are you starting?
          </h1>
          <p className="text-base text-muted-foreground max-w-lg">
            5 quick questions about your workplace experience. No right or wrong answers — this helps us recommend the right starting point.
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
