"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LessonError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const backHref = from === "foundation-path"
    ? "/assessment/foundation-path"
    : from === "roadmap"
      ? "/roadmap"
      : from === "learn"
        ? "/learn"
        : "/assessment";
  const backLabel = from === "foundation-path"
    ? "Back to foundation-path"
    : from === "roadmap"
      ? "Back to roadmap"
      : from === "learn"
        ? "Back to lessons"
        : "Back to assessment";

  useEffect(() => {
    // Log full error object to inspect in browser console
    console.error("[lesson-error] Full error:", error);
    if (error instanceof Error) {
      console.error("[lesson-error] Message:", error.message);
      console.error("[lesson-error] Stack:", error.stack);
    }
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl py-12 space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href={backHref} className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      </div>

      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 space-y-3">
        <h1 className="text-lg font-semibold text-destructive">Lesson failed to load</h1>
        <p className="text-sm text-muted-foreground">
          {error.message || "An error occurred while loading this lesson."}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/70">Error ID: {error.digest}</p>
        )}
        <p className="text-[10px] text-muted-foreground/40">build-marker: lesson-v7-separate-queries</p>
      </div>

      <button
        onClick={reset}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
