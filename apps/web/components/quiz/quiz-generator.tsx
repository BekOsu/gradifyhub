"use client";

import { useState } from "react";
import { generateQuiz as generateQuizAction } from "~/actions/quiz";
import type { Quiz } from "~/lib/quiz/generate";
import { AlertCircle, ChevronDown, Loader2 } from "lucide-react";

export function QuizGenerator({ userPlan }: { userPlan: "free" | "pro" }) {
  const [topic, setTopic] = useState("");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [used, setUsed] = useState(0);

  async function handleGenerate() {
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);

    const result = await generateQuizAction(topic);

    if ("error" in result) {
      setError(result.error);
      if (result.code === "QUIZ_LIMIT_EXCEEDED" && result.used !== undefined) {
        setUsed(result.used);
      }
    } else {
      setQuiz(result.quiz);
      setUsed(result.remaining !== null ? 2 - result.remaining : 0);
    }

    setLoading(false);
  }

  const isLimitReached = userPlan === "free" && used >= 2;

  return (
    <div className="space-y-4 rounded-lg border p-6">
      <h2 className="text-xl font-semibold">AI Quiz Generator</h2>

      {/* Usage Bar (Free users only) */}
      {userPlan === "free" && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Daily limit: {used} / 2</span>
            <span className="text-muted-foreground">
              {Math.round((used / 2) * 100)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${(used / 2) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Input */}
      <div className="space-y-2">
        <label htmlFor="quiz-topic" className="text-sm font-medium">
          Topic
        </label>
        <input
          id="quiz-topic"
          type="text"
          placeholder="e.g., Python, React, Database Design"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading && !isLimitReached) {
              handleGenerate();
            }
          }}
          disabled={loading || isLimitReached}
          className="w-full rounded border bg-background px-3 py-2 text-sm disabled:opacity-50"
        />
      </div>

      {/* Button */}
      <button
        onClick={handleGenerate}
        disabled={loading || !topic.trim() || isLimitReached}
        className="w-full rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </span>
        ) : (
          "Generate Quiz"
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="rounded border border-destructive/20 bg-destructive/5 p-3">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
            <div className="text-sm text-destructive">
              <p>{error}</p>
              {error.includes("limit reached") && (
                <a
                  href="/pricing"
                  className="mt-2 inline-block text-xs font-semibold underline hover:no-underline"
                >
                  Upgrade to Pro →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quiz Display */}
      {quiz && (
        <div className="space-y-4 rounded-lg bg-muted/30 p-4">
          <div>
            <h3 className="font-semibold">{quiz.topic}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {quiz.description}
            </p>
          </div>

          <div className="space-y-6">
            {quiz.questions.map((q, i) => (
              <div key={q.id} className="space-y-2">
                <p className="font-medium text-sm">
                  Q{i + 1}: {q.text}
                </p>
                <div className="ml-4 space-y-2">
                  {q.options.map((opt, j) => (
                    <label
                      key={j}
                      className="flex items-center gap-2 text-sm cursor-default"
                    >
                      <input
                        type="radio"
                        name={`q${i}`}
                        disabled
                        className="cursor-default"
                      />
                      <span
                        className={
                          j === q.correctAnswer ? "text-green-600 font-medium" : ""
                        }
                      >
                        {String.fromCharCode(65 + j)}) {opt}
                      </span>
                      {j === q.correctAnswer && (
                        <span className="text-green-600">✓</span>
                      )}
                    </label>
                  ))}
                </div>
                <details className="text-sm text-muted-foreground cursor-pointer">
                  <summary className="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary">
                    <ChevronDown className="h-4 w-4" />
                    Explanation
                  </summary>
                  <p className="mt-2 ml-4 text-xs leading-relaxed">
                    {q.explanation}
                  </p>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
