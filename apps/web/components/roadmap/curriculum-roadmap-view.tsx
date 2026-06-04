"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Lock } from "lucide-react";
import { setNodeProgress } from "~/actions/roadmap-catalog";

type ContentItem = { id: string; type: string; title: string; url: string; order: number };
type CatalogNode = {
  id: string;
  nodeId: string;
  type: string;
  label: string;
  description: string | null;
  parentNodeId: string | null;
  order: number;
  content: ContentItem[];
  lessonId?: string | null;
  dimension?: string | null;
  difficulty?: string | null;
};

type Props = {
  nodes: CatalogNode[];
  initialProgress: Record<string, string>;
  dimensionScores?: Record<string, number>;
  lessonsMap?: Record<string, string>;
  lessonSequenceMap?: Record<string, number>;
  titleByGlobalIndex?: Record<number, string>;
  userMaxCompletedSequence?: number;
};

const DIFFICULTY_BADGES: Record<string, { badge: string; color: string; order: number }> = {
  beginner: { badge: "L1", color: "bg-green-500/10 text-green-600 dark:text-green-400", order: 0 },
  intermediate: { badge: "L2", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400", order: 1 },
  advanced: { badge: "L3", color: "bg-red-500/10 text-red-600 dark:text-red-400", order: 2 },
};

function scoreToBand(score: number | undefined): "focus" | "review" | "good" {
  if (!score) return "focus";
  if (score < 0.45) return "focus";
  if (score < 0.70) return "review";
  return "good";
}

const BAND = {
  focus: { bg: "bg-red-50 dark:bg-red-950/20", label: "Focus" },
  review: { bg: "bg-amber-50 dark:bg-amber-950/20", label: "Review" },
  good: { bg: "bg-green-50 dark:bg-green-950/20", label: "Strong" },
};

export function CurriculumRoadmapView({
  nodes,
  initialProgress,
  dimensionScores = {},
  lessonsMap = {},
  lessonSequenceMap = {},
  titleByGlobalIndex = {},
  userMaxCompletedSequence = 0,
}: Props) {
  const [progress, setProgress] = useState<Record<string, string>>(initialProgress);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Organize nodes: dimensions (parents) and lessons (children)
  const dimensions = nodes.filter((n) => !n.parentNodeId).sort((a, b) => a.order - b.order);
  const childrenOf = (id: string) => nodes.filter((n) => n.parentNodeId === id).sort((a, b) => a.order - b.order);

  function applyStatus(nodeId: string, status: string | null) {
    const prevStatus = progress[nodeId] ?? null;
    setProgress((p) => {
      const u = { ...p };
      if (status === null) delete u[nodeId];
      else u[nodeId] = status;
      return u;
    });
    setError(null);
    startTransition(async () => {
      const result = await setNodeProgress(nodeId, status as "done" | "in-progress" | "skip" | null);
      if (!result.success) {
        setError(result.error ?? "Failed to update progress");
        setProgress((p) => {
          const u = { ...p };
          if (prevStatus === null) delete u[nodeId];
          else u[nodeId] = prevStatus;
          return u;
        });
      }
    });
  }

  return (
    <div className="space-y-10">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {dimensions.map((dim) => {
        const lessons = childrenOf(dim.id);
        const dimScore = dimensionScores[dim.dimension || ""] || 0;
        const band = scoreToBand(dimScore);
        const completedCount = lessons.filter((l) => progress[l.id] === "done").length;

        return (
          <div key={dim.id} className={`rounded-2xl p-6 transition-all ${BAND[band].bg}`}>
            {/* Dimension header */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <h3 className="text-lg font-bold text-foreground">{dim.label}</h3>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  {BAND[band].label}
                </span>
              </div>

              {/* Score bar */}
              <div className="flex items-center gap-3">
                <div className="h-2 w-32 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-green-500 transition-all"
                    style={{ width: `${Math.min(100, dimScore * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{Math.round(dimScore * 100)}%</span>
                <span className="text-sm text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">{completedCount}/{lessons.length} complete</span>
              </div>
            </div>

            {/* Lesson cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {lessons.map((lesson, idx) => {
                const status = progress[lesson.id];
                const isCompleted = status === "done";
                const diffBadge = DIFFICULTY_BADGES[lesson.difficulty || "beginner"] || DIFFICULTY_BADGES.beginner;

                const lessonSeq = lesson.lessonId ? lessonSequenceMap[lesson.lessonId] ?? 0 : 0;
                const hasSequence = lessonSeq > 0;
                const isLocked =
                  !isCompleted && hasSequence && lessonSeq > userMaxCompletedSequence + 1;
                const prevTitle = isLocked
                  ? titleByGlobalIndex[lessonSeq - 1] ?? "the previous lesson"
                  : null;

                return (
                  <div key={lesson.id} className="relative group">
                    {/* Progression arrow */}
                    {idx < lessons.length - 1 && (
                      <div className="hidden sm:flex absolute -right-2 top-1/2 -translate-y-1/2 -translate-x-full text-muted-foreground/30 pointer-events-none">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}

                    {/* Card container */}
                    <div
                      className={`flex flex-col h-full rounded-xl border-2 p-4 transition-all ${
                        isCompleted
                          ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30"
                          : isLocked
                          ? "border-border bg-muted/40 opacity-60"
                          : "border-border bg-card hover:border-border/80 hover:shadow-sm"
                      }`}
                    >
                      {/* Header with level and status */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        {isLocked ? (
                          <span className="text-xs font-bold rounded-md px-2.5 py-1 uppercase tracking-wide bg-muted text-muted-foreground inline-flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Locked
                          </span>
                        ) : diffBadge ? (
                          <span className={`text-xs font-bold rounded-md px-2.5 py-1 uppercase tracking-wide ${diffBadge.color}`}>
                            {diffBadge.badge}
                          </span>
                        ) : null}
                        {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />}
                      </div>

                      {/* Lesson title and description */}
                      {isLocked ? (
                        <h4 className="font-semibold text-sm leading-snug text-muted-foreground mb-2">{lesson.label}</h4>
                      ) : lesson.lessonId && lessonsMap[lesson.lessonId] ? (
                        <Link href={`/learn/${lessonsMap[lesson.lessonId]}?from=roadmap`}>
                          <h4 className="font-semibold text-sm leading-snug text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2">
                            {lesson.label}
                          </h4>
                        </Link>
                      ) : (
                        <h4 className="font-semibold text-sm leading-snug text-foreground mb-2">{lesson.label}</h4>
                      )}
                      <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{lesson.description}</p>

                      {/* External resources */}
                      {!isLocked && lesson.content && lesson.content.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/40 space-y-1">
                          {lesson.content.map((c) => (
                            <a
                              key={c.id}
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <span className="shrink-0">
                                {c.type === "course" ? "📚" : c.type === "video" ? "🎥" : "📄"}
                              </span>
                              <span className="truncate">{c.title}</span>
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Footer with actions */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-3 border-t border-border/30">
                        {isLocked ? (
                          <p className="text-xs text-muted-foreground italic">
                            Unlock after &ldquo;{prevTitle}&rdquo;
                          </p>
                        ) : (
                          <>
                            <div className="flex items-center gap-1">
                              <Circle className={`h-3 w-3 ${isCompleted ? "text-green-500" : "text-muted-foreground/30"}`} />
                              <span>{isCompleted ? "Completed" : "Not started"}</span>
                            </div>

                            {/* Toggle completion button */}
                            <button
                              onClick={() => applyStatus(lesson.id, isCompleted ? null : "done")}
                              className="px-2 py-1 rounded text-xs font-medium bg-muted/40 hover:bg-muted/60 transition-colors"
                            >
                              {isCompleted ? "Undo" : "Mark done"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
