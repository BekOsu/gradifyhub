"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Circle, Clock, MinusCircle, X, ExternalLink } from "lucide-react";
import { setNodeProgress } from "~/actions/roadmap-catalog";

type ContentItem = { id: string; type: string; title: string; url: string; order: number };
type CatalogNode = {
  id: string; nodeId: string; type: string; label: string;
  description: string | null; parentNodeId: string | null; order: number;
  content: ContentItem[];
};
type NodeStatus = "done" | "in-progress" | "skip";

// ── Keyword matcher: maps catalog node labels → assessment dimension keys ─────
const DIMENSION_KEYWORDS: Record<string, string[]> = {
  // Backend
  core_language:  ["language", "node.js", "nodejs", "python", "golang", "java", "ruby", "php", "runtime", "programming language"],
  apis:           ["api", "rest", "http", "graphql", "grpc", "openapi", "websocket", "endpoint"],
  databases:      ["database", "sql", "nosql", "postgresql", "mongodb", "orm", "relational", "scaling", "indexing"],
  system_design:  ["system design", "architect", "scalab", "microservice", "distributed", "design pattern"],
  messaging:      ["message", "kafka", "rabbitmq", "queue", "event", "stream", "pubsub", "broker"],
  auth_security:  ["auth", "security", "jwt", "oauth", "ssl", "tls", "cors", "hashing", "encryption", "owasp"],
  caching:        ["cach", "cdn", "redis", "memcach"],
  testing:        ["test", "tdd", "bdd"],
  observability:  ["log", "metric", "monitor", "observ", "trace", "telemetry", "alerting"],
  delivery:       ["ci", "cd", "docker", "container", "deploy", "pipeline", "version control", "git"],
  // Frontend
  html_css:       ["html", "css", "layout", "flexbox", "grid", "sass", "tailwind"],
  javascript:     ["javascript", "typescript", "es6", "dom", "browser"],
  frameworks:     ["react", "vue", "angular", "next", "svelte", "framework"],
  performance:    ["performance", "web vital", "lighthouse", "optimization", "core web"],
  accessibility:  ["accessib", "a11y", "aria", "wcag"],
  // AI
  python:                  ["python", "pandas", "numpy", "scripting"],
  llm_fundamentals_evals:  ["machine learning", "neural", "model training", "deep learning", "evaluation", "evals", "benchmark"],
  context_engineering:     ["llm", "prompt", "gpt", "language model", "transformer", "context", "structured output"],
  rag_retrieval:           ["rag", "retrieval", "embedding", "vector search", "rerank", "hybrid search"],
  agentic_systems:         ["agent", "agentic", "langgraph", "tool use", "multi-agent", "orchestration"],
  voice_multimodal:        ["voice", "speech", "stt", "tts", "audio", "real-time", "barge-in"],
  tooling_observability:   ["mlops", "pipeline", "serving", "observab", "monitoring", "eval harness"],
};

function matchDimension(
  label: string,
  dimensionScores: Record<string, number>,
): { key: string; score: number } | null {
  const lower = label.toLowerCase();
  for (const [key, keywords] of Object.entries(DIMENSION_KEYWORDS)) {
    if (!(key in dimensionScores)) continue;
    if (keywords.some((kw) => lower.includes(kw))) {
      return { key, score: dimensionScores[key]! };
    }
  }
  return null;
}

// ── Score → visual style ──────────────────────────────────────────────────────
function scoreBand(score: number): "focus" | "review" | "good" {
  if (score < 45) return "focus";
  if (score < 70) return "review";
  return "good";
}

const BAND = {
  focus:  { border: "border-l-red-400",   bg: "bg-red-50 dark:bg-red-950/30",    badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",    label: "Focus" },
  review: { border: "border-l-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300", label: "Review" },
  good:   { border: "border-l-green-400", bg: "bg-green-50 dark:bg-green-950/30", badge: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",  label: "Strong" },
};

// ── Status icons ──────────────────────────────────────────────────────────────
function StatusIcon({ status, size = 4 }: { status: NodeStatus | undefined; size?: number }) {
  const cls = `h-${size} w-${size} shrink-0`;
  if (status === "done")        return <CheckCircle2 className={`${cls} text-green-500`} />;
  if (status === "in-progress") return <Clock        className={`${cls} text-amber-500`} />;
  if (status === "skip")        return <MinusCircle  className={`${cls} text-muted-foreground/40`} />;
  return <Circle className={`${cls} text-muted-foreground/20`} />;
}

const CONTENT_ICON: Record<string, string> = { article: "📄", video: "🎬", course: "📚", official: "📖", opensource: "💻" };
const CONTENT_LABEL: Record<string, string> = { article: "Article", video: "Video", course: "Course", official: "Official Docs", opensource: "Open Source" };

// ── Props ─────────────────────────────────────────────────────────────────────
type Props = {
  roadmapId: string;
  nodes: CatalogNode[];
  initialProgress: Record<string, NodeStatus>;
  dimensionScores?: Record<string, number>;
  availableLessonDimensions?: string[];
};

export function RoadmapDiagram({ roadmapId, nodes, initialProgress, dimensionScores = {}, availableLessonDimensions = [] }: Props) {
  void roadmapId;
  const [progress, setProgress] = useState<Record<string, NodeStatus>>(initialProgress);
  const [selected, setSelected] = useState<CatalogNode | null>(null);
  const [, startTransition]     = useTransition();

  const sorted     = [...nodes].sort((a, b) => a.order - b.order);
  const sections   = sorted.filter((n) => !n.parentNodeId);
  const childrenOf = (id: string) => sorted.filter((n) => n.parentNodeId === id);

  const doneCount  = sections.filter((n) => progress[n.id] === "done").length;
  const totalCount = sections.length;

  function applyStatus(nodeId: string, status: NodeStatus | null) {
    const prev = progress[nodeId] ?? null;
    setProgress((p) => {
      const u = { ...p };
      if (status === null) delete u[nodeId]; else u[nodeId] = status;
      return u;
    });
    startTransition(async () => {
      const res = await setNodeProgress(nodeId, status);
      if (!res.success) {
        setProgress((p) => {
          const r = { ...p };
          if (prev === null) delete r[nodeId]; else r[nodeId] = prev;
          return r;
        });
      }
    });
  }

  const selStatus   = selected ? progress[selected.id] : undefined;
  const selChildren = selected ? childrenOf(selected.id) : [];

  return (
    <div className="flex gap-6 items-start">

      {/* ── Diagram column ──────────────────────────────────────────────────── */}
      <div className={`min-w-0 transition-all ${selected ? "hidden sm:block sm:w-[52%]" : "w-full"}`}>

        {/* Progress strip */}
        <div className="mb-6 flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%` }}
            />
          </div>
          <span className="shrink-0 tabular-nums">{doneCount}/{totalCount}</span>
        </div>

        {/* Node sections */}
        <div className="relative space-y-0">
          {sections.map((section, i) => {
            const children   = childrenOf(section.id);
            const status     = progress[section.id];
            const isSelected = selected?.id === section.id;
            const dim        = matchDimension(section.label, dimensionScores);
            const band       = dim ? BAND[scoreBand(dim.score)] : null;

            return (
              <div key={section.id} className="relative">
                {/* Connector line between sections */}
                {i > 0 && (
                  <div className="absolute -top-4 left-6 h-4 w-px bg-border" />
                )}

                <div
                  className={`rounded-xl border-2 border-l-4 overflow-hidden transition-all ${
                    isSelected
                      ? "border-primary border-l-primary shadow-sm"
                      : band
                      ? `border-border ${band.border} ${band.bg}`
                      : "border-border bg-card"
                  } mb-8`}
                >
                  {/* Section header — clickable */}
                  <button
                    type="button"
                    onClick={() => setSelected(isSelected ? null : section)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <StatusIcon status={status} size={5} />
                    <span className="flex-1 font-semibold text-sm">{section.label}</span>
                    {dim && (
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${band!.badge}`}>
                        {band!.label} · {dim.score}%
                      </span>
                    )}
                    {children.length > 0 && (
                      <span className="shrink-0 text-[11px] text-muted-foreground">{children.length} topics</span>
                    )}
                  </button>

                  {/* Child nodes */}
                  {children.length > 0 && (
                    <div className="border-t px-4 py-3 flex flex-wrap gap-2">
                      {children.map((child) => {
                        const cs = progress[child.id];
                        const isChildSelected = selected?.id === child.id;
                        return (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() => setSelected(isChildSelected ? null : child)}
                            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                              cs === "done"
                                ? "border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                                : cs === "in-progress"
                                ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                : cs === "skip"
                                ? "border-border bg-muted/40 text-muted-foreground line-through"
                                : isChildSelected
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border bg-background hover:border-primary/40 hover:bg-primary/5"
                            }`}
                          >
                            <StatusIcon status={cs} size={3} />
                            {child.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Detail panel ────────────────────────────────────────────────────── */}
      {selected && (
        <div className="w-full sm:w-[48%] sticky top-20 rounded-xl border bg-background shadow-sm flex flex-col overflow-hidden max-h-[85vh]">

          {/* Panel header */}
          <div className="flex items-start justify-between gap-3 border-b px-4 py-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <StatusIcon status={selStatus} size={5} />
              <p className="font-semibold text-sm leading-snug">{selected.label}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Panel body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">

            {selected.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{selected.description}</p>
            )}

            {/* Status actions */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mark as</p>
              <div className="flex flex-wrap gap-2">
                {(["done", "in-progress", "skip"] as NodeStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => applyStatus(selected.id, selStatus === s ? null : s)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      selStatus === s
                        ? s === "done"
                          ? "border-green-500 bg-green-500 text-white"
                          : s === "in-progress"
                          ? "border-amber-400 bg-amber-400 text-white"
                          : "border-muted-foreground/50 bg-muted text-muted-foreground"
                        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {s === "done" ? "✓ Done" : s === "in-progress" ? "◑ In progress" : "— Skip"}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-topics */}
            {selChildren.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subtopics</p>
                <div className="space-y-1">
                  {selChildren.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => setSelected(child)}
                      className="w-full flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-xs transition-colors hover:border-primary/30 hover:bg-primary/5"
                    >
                      <StatusIcon status={progress[child.id]} size={4} />
                      <span className="flex-1">{child.label}</span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          applyStatus(child.id, progress[child.id] === "done" ? null : "done");
                        }}
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold cursor-pointer transition-colors ${
                          progress[child.id] === "done"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-muted text-muted-foreground hover:bg-green-100 hover:text-green-700"
                        }`}
                      >
                        {progress[child.id] === "done" ? "Done" : "Mark done"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Resources */}
            {selected.content.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Resources</p>
                <div className="space-y-1.5">
                  {selected.content.map((c) => (
                    <a
                      key={c.id}
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      <span className="text-base shrink-0">{CONTENT_ICON[c.type] ?? "🔗"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-medium group-hover:text-primary">{c.title}</p>
                        <p className="text-[10px] text-muted-foreground">{CONTENT_LABEL[c.type] ?? c.type}</p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 group-hover:text-primary" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Learn about this topic */}
            {(() => {
              const dim = matchDimension(selected.label, dimensionScores);
              const hasLessons = dim && availableLessonDimensions.includes(dim.key);
              return hasLessons ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Learn</p>
                  <a
                    href={`/learn?focus=${dim.key}`}
                    className="group flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 transition-colors hover:border-blue-300 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:hover:border-blue-800 dark:hover:bg-blue-900"
                  >
                    <span className="text-base shrink-0">📖</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Learn about this topic</p>
                      <p className="text-[10px] text-blue-600 dark:text-blue-400">View lessons & assessments</p>
                    </div>
                  </a>
                </div>
              ) : null;
            })()}

            {!selected.description && selected.content.length === 0 && selChildren.length === 0 && !(() => {
              const dim = matchDimension(selected.label, dimensionScores);
              return dim && availableLessonDimensions.includes(dim.key);
            })() && (
              <p className="text-sm text-muted-foreground">No resources added for this topic yet.</p>
            )}
          </div>

          {/* Panel footer */}
          <div className="shrink-0 border-t px-4 py-2.5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                const idx = sorted.findIndex((n) => n.id === selected.id);
                const prev = sorted[idx - 1];
                if (prev) setSelected(prev);
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ← Previous
            </button>
            {selStatus !== "done" && (
              <button
                type="button"
                onClick={() => {
                  applyStatus(selected.id, "done");
                  const idx = sorted.findIndex((n) => n.id === selected.id);
                  const next = sorted[idx + 1];
                  if (next) setSelected(next);
                }}
                className="rounded-full bg-foreground px-4 py-1.5 text-xs font-semibold text-background hover:bg-foreground/90"
              >
                Mark done & next →
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                const idx = sorted.findIndex((n) => n.id === selected.id);
                const next = sorted[idx + 1];
                if (next) setSelected(next);
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
