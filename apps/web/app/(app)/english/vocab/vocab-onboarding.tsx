"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { initializeVocabularyAction } from "~/actions/english/personalize";

export function VocabOnboarding() {
  const [phase, setPhase] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<{ count: number; categories: string[] } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleStart() {
    startTransition(async () => {
      setPhase("loading");
      const res = await initializeVocabularyAction();
      if (res.success) {
        setResult({ count: res.count ?? 0, categories: res.categories ?? [] });
        setPhase("done");
      } else {
        setErrorMsg(res.error ?? "Something went wrong.");
        setPhase("error");
      }
    });
  }

  if (phase === "loading") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-green border-t-transparent" />
        <div className="text-center">
          <p className="text-lg font-semibold">Personalizing your vocabulary list…</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Selecting phrases matched to your role and stack
          </p>
        </div>
      </div>
    );
  }

  if (phase === "done" && result) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-green/10 mx-auto">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-xl font-bold">Your list is ready</h2>
          <p className="mt-2 text-muted-foreground">
            <span className="font-semibold text-foreground">{result.count} words</span>{" "}
            across{" "}
            <span className="font-semibold text-foreground">{result.categories.length} categories</span>
          </p>
          {result.categories.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {result.categories.map((cat) => (
                <span
                  key={cat}
                  className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => router.refresh()}
            className="mt-6 w-full rounded-lg bg-brand-green px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            View my vocabulary
          </button>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-700">Something went wrong</p>
          <p className="mt-1 text-sm text-red-600">{errorMsg}</p>
          <button
            type="button"
            onClick={() => setPhase("idle")}
            className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold">Welcome to English Immersion</h2>
        <p className="mt-2 text-muted-foreground">
          We&apos;ll build a personalized vocabulary list based on your role, stack, and goals — so you
          learn the phrases that actually matter to your work.
        </p>
        <button
          type="button"
          onClick={handleStart}
          disabled={isPending}
          className="mt-6 w-full rounded-lg bg-brand-green px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Build my vocabulary list
        </button>
        <p className="mt-3 text-xs text-muted-foreground">
          Takes about 10 seconds. You can always add more words manually.
        </p>
      </div>
    </div>
  );
}
