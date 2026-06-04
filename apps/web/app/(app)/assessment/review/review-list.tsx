"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

type ReviewRow = {
  index: number;
  question: string;
  stem: string;
  stemTruncated: string;
  userChoice: string | null;
  dimension: string;
  status: "answered" | "skipped" | "unanswered";
  allChoices: Array<{ id: string; label: string }>;
  selectedChoiceId: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  answered: "bg-green-500/10 text-green-700 dark:text-green-300",
  skipped: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  unanswered: "bg-red-500/10 text-red-700 dark:text-red-300",
};

const STATUS_DOT: Record<string, string> = {
  answered: "bg-green-500",
  skipped: "bg-yellow-500",
  unanswered: "bg-red-500",
};

const DIMENSION_LABELS: Record<string, string> = {
  python:                  "Python for AI",
  llm_fundamentals_evals:  "LLM Fundamentals & Evals",
  context_engineering:     "Context Engineering",
  rag_retrieval:           "RAG & Retrieval",
  agentic_systems:         "Agentic Systems",
  voice_multimodal:        "Voice & Multimodal",
  system_design:           "System Design",
  tooling_observability:   "Tooling & Observability",
  soft_skills:             "Professional Skills",
};

export function ReviewList({ rows }: { rows: ReviewRow[]; attemptId?: string }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.index} className="border rounded-lg bg-background overflow-hidden">
          {/* Collapsed row */}
          <button
            type="button"
            onClick={() => setExpandedIndex(expandedIndex === row.index ? null : row.index)}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors"
          >
            <div className={`h-2 w-2 rounded-full shrink-0 ${STATUS_DOT[row.status]}`} />

            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-foreground">{row.question}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {DIMENSION_LABELS[row.dimension] ?? row.dimension}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{row.stemTruncated}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${STATUS_COLORS[row.status]}`}
              >
                {row.status === "answered"
                  ? row.userChoice ?? "Answered"
                  : row.status === "skipped"
                    ? "Skipped"
                    : "No answer yet"}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  expandedIndex === row.index ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          {/* Expanded content */}
          {expandedIndex === row.index && (
            <div className="border-t bg-muted/30 px-4 py-4 space-y-3">
              <div>
                <p className="text-sm font-medium mb-2">Question</p>
                <p className="text-sm text-foreground leading-relaxed">{row.stem}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Choices</p>
                <div className="space-y-2">
                  {row.allChoices.map((choice) => (
                    <div
                      key={choice.id}
                      className={`p-3 rounded-lg border text-sm ${
                        row.selectedChoiceId === choice.id
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-input bg-background text-foreground"
                      }`}
                    >
                      {choice.label}
                      {row.selectedChoiceId === choice.id && (
                        <span className="ml-2 text-xs font-semibold">(selected)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={`/assessment/q/${row.index + 1}?from-review=true`}
                className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Edit answer
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
