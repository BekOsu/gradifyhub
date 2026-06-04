"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Progress } from "@repo/ui/progress";
import { CheckCircle2, Circle, Clock, MinusCircle, X, ExternalLink, ArrowRight } from "lucide-react";
import { setNodeProgress } from "~/actions/roadmap-catalog";

type ContentItem = { id: string; type: string; title: string; url: string; order: number };
type CatalogNode = {
  id: string; nodeId: string; type: string; label: string;
  description: string | null; parentNodeId: string | null; order: number;
  content: ContentItem[];
};
type NodeStatus = "done" | "in-progress" | "skip";

const CONTENT_ICON: Record<string, string> = {
  article:    "📄",
  video:      "🎬",
  course:     "📚",
  official:   "📖",
  opensource: "💻",
};
const CONTENT_LABEL: Record<string, string> = {
  article:    "Article",
  video:      "Video",
  course:     "Course",
  official:   "Official Docs",
  opensource: "Open Source",
};

type Props = {
  roadmap: { id: string; slug: string; title: string; description: string | null; nodeCount: number };
  nodes: CatalogNode[];
  initialProgress: Record<string, NodeStatus>;
  isLoggedIn: boolean;
};

function StatusIcon({ status }: { status: NodeStatus | undefined }) {
  if (status === "done")        return <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />;
  if (status === "in-progress") return <Clock        className="h-5 w-5 shrink-0 text-amber-500" />;
  if (status === "skip")        return <MinusCircle  className="h-5 w-5 shrink-0 text-muted-foreground/40" />;
  return <Circle className="h-5 w-5 shrink-0 text-muted-foreground/30" />;
}

export function CatalogViewer({ nodes, initialProgress, isLoggedIn }: Props) {
  const [progress, setProgress] = useState<Record<string, NodeStatus>>(initialProgress);
  const [selected, setSelected]  = useState<CatalogNode | null>(null);
  const [, startTransition]      = useTransition();

  const sorted       = [...nodes].sort((a, b) => a.order - b.order);
  const topicNodes   = sorted.filter((n) => !n.parentNodeId);
  const childrenOf   = (id: string) => sorted.filter((n) => n.parentNodeId === id);

  const doneCount  = topicNodes.filter((n) => progress[n.id] === "done").length;
  const totalCount = topicNodes.length;
  const nextTopic  = topicNodes.find((n) => !progress[n.id] || progress[n.id] === "in-progress");

  function applyStatus(nodeId: string, status: NodeStatus | null) {
    if (!isLoggedIn) return;
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
  const allSorted   = sorted;

  function openNext() {
    if (!selected) return;
    const idx = allSorted.findIndex((n) => n.id === selected.id);
    const next = allSorted[idx + 1];
    if (next) setSelected(next);
  }
  function openPrev() {
    if (!selected) return;
    const idx = allSorted.findIndex((n) => n.id === selected.id);
    const prev = allSorted[idx - 1];
    if (prev) setSelected(prev);
  }

  return (
    <div className="space-y-4">

      {/* Progress bar */}
      <div className="rounded-xl border bg-muted/20 p-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{doneCount} / {totalCount} topics completed</span>
          <span className="text-muted-foreground">
            {totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0}%
          </span>
        </div>
        <Progress value={totalCount > 0 ? (doneCount / totalCount) * 100 : 0} />
        {!isLoggedIn && (
          <p className="pt-1 text-xs text-muted-foreground">
            <Link href="/sign-in" className="font-semibold text-foreground underline underline-offset-4 hover:text-primary">
              Sign in
            </Link>{" "}
            to save your progress.
          </p>
        )}
      </div>

      {/* Continue banner */}
      {isLoggedIn && nextTopic && doneCount < totalCount && (
        <button
          type="button"
          onClick={() => setSelected(nextTopic)}
          className="w-full flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-left transition-colors hover:bg-primary/10"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">Continue learning</p>
            <p className="text-sm font-medium">{nextTopic.label}</p>
          </div>
        </button>
      )}

      {isLoggedIn && doneCount === totalCount && totalCount > 0 && (
        <div className="rounded-xl border border-green-300 bg-green-50 px-4 py-4 dark:border-green-800 dark:bg-green-950">
          <p className="font-semibold text-green-700 dark:text-green-300">You completed this roadmap!</p>
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex gap-4 items-start">

        {/* Topic list */}
        <div className={`space-y-0.5 min-w-0 ${selected ? "hidden sm:block sm:w-[45%]" : "w-full"}`}>
          {topicNodes.map((topic) => {
            const children    = childrenOf(topic.id);
            const topicStatus = progress[topic.id];
            const isSelected  = selected?.id === topic.id;

            return (
              <div key={topic.id}>
                <button
                  type="button"
                  onClick={() => setSelected(isSelected ? null : topic)}
                  className={`group w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all hover:bg-muted/60 ${
                    isSelected ? "bg-muted ring-1 ring-border" : ""
                  }`}
                >
                  <StatusIcon status={topicStatus} />
                  <span className={`flex-1 text-sm font-medium ${topicStatus === "done" ? "text-muted-foreground line-through" : ""}`}>
                    {topic.label}
                  </span>
                  {topic.id === nextTopic?.id && doneCount < totalCount && (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      Next
                    </span>
                  )}
                  {children.length > 0 && (
                    <span className="shrink-0 text-[11px] text-muted-foreground">{children.length}</span>
                  )}
                </button>

                {children.length > 0 && (
                  <div className="ml-8 space-y-0.5 pb-1">
                    {children.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => setSelected(child)}
                        className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-all hover:bg-muted/40 ${
                          selected?.id === child.id ? "bg-muted" : ""
                        }`}
                      >
                        <StatusIcon status={progress[child.id]} />
                        <span className={`text-xs ${progress[child.id] === "done" ? "text-muted-foreground line-through" : ""}`}>
                          {child.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-full sm:w-[55%] sticky top-20 rounded-xl border bg-background shadow-sm flex flex-col overflow-hidden max-h-[80vh]">

            <div className="flex items-start justify-between gap-3 border-b px-4 py-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <StatusIcon status={selStatus} />
                <p className="font-semibold text-sm leading-snug truncate">{selected.label}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">

              {selected.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">{selected.description}</p>
              )}

              {isLoggedIn ? (
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
              ) : (
                <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                  <Link href="/sign-in" className="font-semibold text-foreground underline underline-offset-4">Sign in</Link>{" "}
                  to track your progress.
                </div>
              )}

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
                        <StatusIcon status={progress[child.id]} />
                        <span className="flex-1">{child.label}</span>
                        {isLoggedIn && (
                          <span
                            onClick={(e) => { e.stopPropagation(); applyStatus(child.id, progress[child.id] === "done" ? null : "done"); }}
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer ${
                              progress[child.id] === "done"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : "bg-muted text-muted-foreground hover:bg-green-100 hover:text-green-700"
                            }`}
                          >
                            {progress[child.id] === "done" ? "Done" : "Mark done"}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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

              {!selected.description && selected.content.length === 0 && selChildren.length === 0 && (
                <p className="text-sm text-muted-foreground">No resources added for this topic yet.</p>
              )}
            </div>

            <div className="shrink-0 border-t px-4 py-2.5 flex items-center justify-between">
              <button type="button" onClick={openPrev} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                ← Previous
              </button>
              {isLoggedIn && selStatus !== "done" && (
                <button
                  type="button"
                  onClick={() => { applyStatus(selected.id, "done"); openNext(); }}
                  className="rounded-full bg-foreground px-4 py-1.5 text-xs font-semibold text-background transition-colors hover:bg-foreground/90"
                >
                  Mark done & next →
                </button>
              )}
              <button type="button" onClick={openNext} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
