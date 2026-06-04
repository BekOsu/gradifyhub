"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  submitSourceAction,
  acceptVocabItemAction,
  getSourceHistoryAction,
  getSourceItemsAction,
  analyzeTextAction,
} from "~/actions/english/mine";
import Link from "next/link";
import { ChevronLeft, Loader2, Check, Youtube, FileText, Type, ArrowRight } from "lucide-react";
import { CURATED_SOURCES } from "./curated-sources";

type ExtractedItem = {
  vocabId: string;
  phrase: string;
  meaning: string;
  category: string;
  difficulty: string;
  example: string | null;
  frequencyScore: number;
  technicalRelevance: number;
};

type HistorySource = {
  id: string;
  kind: string;
  url: string | null;
  title: string | null;
  status: string;
  itemCount: number;
  createdAt: Date;
};

function levelColor(level: string) {
  switch (level) {
    case "beginner": return "bg-green-100 text-green-700";
    case "intermediate": return "bg-amber-100 text-amber-700";
    case "advanced": return "bg-red-100 text-red-700";
    default: return "bg-zinc-100 text-zinc-600";
  }
}

export function VocabMineClient() {
  const [url, setUrl] = useState("");
  const [kind, setKind] = useState<"youtube" | "article">("youtube");
  const [step, setStep] = useState<"idle" | "extracting" | "analyzing" | "done" | "error">("idle");
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [accepted, setAccepted] = useState<Set<string>>(new Set());
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [errorMsg, setErrorMsg] = useState("");
  const [history, setHistory] = useState<HistorySource[]>([]);
  const [directText, setDirectText] = useState("");
  const [textMode, setTextMode] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const loadHistory = async () => {
      const result = await getSourceHistoryAction();
      if (result.success && result.sources) {
        setHistory(result.sources);
      }
    };
    loadHistory();
  }, []);

  const runExtraction = useCallback((extractUrl: string, extractKind: "youtube" | "article") => {
    startTransition(async () => {
      setStep("extracting");
      setErrorMsg("");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStep("analyzing");
      const result = await submitSourceAction(extractUrl, extractKind);
      if (result.success && result.sourceId) {
        const itemsResult = await getSourceItemsAction(result.sourceId);
        if (itemsResult.success && itemsResult.items) {
          setItems(itemsResult.items);
          setStep("done");
          setAccepted(new Set());
          setSkipped(new Set());
          const updatedHistory = await getSourceHistoryAction();
          if (updatedHistory.success && updatedHistory.sources) {
            setHistory(updatedHistory.sources);
          }
        } else {
          setStep("error");
          setErrorMsg(itemsResult.error || "Failed to fetch extracted items");
        }
      } else {
        setStep("error");
        setErrorMsg(result.error || "Failed to extract vocabulary");
      }
    });
  }, []);

  const handleSubmitText = useCallback((text: string, skipDelay = false) => {
    if (!text.trim()) return;
    startTransition(async () => {
      setStep("extracting");
      setErrorMsg("");
      if (!skipDelay) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
      setStep("analyzing");
      const result = await analyzeTextAction(text);
      if (result.success && result.sourceId) {
        const itemsResult = await getSourceItemsAction(result.sourceId);
        if (itemsResult.success && itemsResult.items) {
          setItems(itemsResult.items);
          setStep("done");
          setAccepted(new Set());
          setSkipped(new Set());
          const updatedHistory = await getSourceHistoryAction();
          if (updatedHistory.success && updatedHistory.sources) {
            setHistory(updatedHistory.sources);
          }
        } else {
          setStep("error");
          setErrorMsg(itemsResult.error || "Failed to fetch extracted items");
        }
      } else {
        setStep("error");
        setErrorMsg((!result.success ? result.error : undefined) || "Failed to analyze text");
      }
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const textParam = params.get("text");
    const sourceParam = params.get("source");
    if (textParam && textParam.length > 10) {
      const decoded = decodeURIComponent(textParam).slice(0, 5000);
      setDirectText(decoded);
      setTextMode(true);
      if (sourceParam === "bookmarklet") {
        setTimeout(() => handleSubmitText(decoded, true), 300);
      }
    }
  }, [handleSubmitText]);

  const handleMineSource = (sourceUrl: string, sourceKind: "youtube" | "article") => {
    setKind(sourceKind);
    setTextMode(false);
    setUrl(sourceUrl);
    runExtraction(sourceUrl, sourceKind);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textMode) {
      handleSubmitText(directText);
    } else {
      if (!url.trim()) return;
      runExtraction(url, kind);
    }
  };

  const handleReset = () => {
    setStep("idle");
    setUrl("");
    setItems([]);
    setAccepted(new Set());
    setSkipped(new Set());
    setErrorMsg("");
    setTextMode(false);
    setDirectText("");
  };

  const handleAcceptItem = (vocabId: string) => {
    startTransition(async () => {
      const result = await acceptVocabItemAction(vocabId);
      if (result.success) {
        const newAccepted = new Set(accepted);
        newAccepted.add(vocabId);
        setAccepted(newAccepted);
      }
    });
  };

  const handleSkipItem = (vocabId: string) => {
    const newSkipped = new Set(skipped);
    newSkipped.add(vocabId);
    setSkipped(newSkipped);
  };

  const handleAcceptAll = () => {
    startTransition(async () => {
      const visibleItems = items.filter((item) => !skipped.has(item.vocabId));
      for (const item of visibleItems) {
        if (!accepted.has(item.vocabId)) {
          await acceptVocabItemAction(item.vocabId);
        }
      }
      const newAccepted = new Set(accepted);
      for (const item of visibleItems) {
        newAccepted.add(item.vocabId);
      }
      setAccepted(newAccepted);
    });
  };

  const handleSkipAll = () => {
    const newSkipped = new Set(skipped);
    for (const item of items) {
      if (!accepted.has(item.vocabId)) {
        newSkipped.add(item.vocabId);
      }
    }
    setSkipped(newSkipped);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-700";
      case "intermediate": return "bg-amber-100 text-amber-700";
      case "advanced": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Daily Life": return "bg-blue-100 text-blue-700";
      case "Work": return "bg-purple-100 text-purple-700";
      case "Technical": return "bg-orange-100 text-orange-700";
      case "Opinion": return "bg-pink-100 text-pink-700";
      case "Social": return "bg-teal-100 text-teal-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const kindLabel = (k: string) => {
    if (k === "youtube") return "YouTube";
    if (k === "text") return "Text";
    return "Article";
  };

  const visibleItems = items.filter((item) => !skipped.has(item.vocabId));
  const isExtracting = step === "extracting" || step === "analyzing";

  return (
    <div className="min-h-screen space-y-8 px-4 py-6 sm:px-0">
      {/* Back button */}
      <div className="mx-auto max-w-3xl">
        <Link
          href="/english/vocab"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Vocabulary
        </Link>
      </div>

      {/* Header */}
      <div className="mx-auto max-w-3xl space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Mine Vocabulary</h1>
        <p className="text-muted-foreground">Extract useful phrases from YouTube videos, articles, or any text</p>
      </div>

      {/* Curated sources — shown when idle or after completion */}
      {(step === "idle" || step === "done" || step === "error") && (
        <div className="mx-auto max-w-3xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 px-0.5">
            Ready to mine — click any source
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {CURATED_SOURCES.map((src) => (
              <button
                key={src.id}
                type="button"
                onClick={() => handleMineSource(src.url, src.kind)}
                disabled={isPending}
                className="text-left rounded-xl border bg-card px-4 py-3.5 transition-all hover:border-brand-green/40 hover:shadow-sm group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${levelColor(src.level)}`}>
                        {src.level}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{src.source}</span>
                    </div>
                    <p className="text-[13px] font-semibold text-foreground leading-snug">{src.title}</p>
                    <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">{src.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-brand-green transition-colors shrink-0 mt-0.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      {(step === "idle" || step === "done" || step === "error") && (
        <div className="mx-auto max-w-3xl flex items-center gap-4">
          <div className="flex-1 border-t" />
          <span className="text-xs text-muted-foreground/50 font-medium">or paste your own URL / text</span>
          <div className="flex-1 border-t" />
        </div>
      )}

      {/* URL input card */}
      <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Toggle buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setKind("youtube"); setTextMode(false); }}
              disabled={isExtracting}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                kind === "youtube" && !textMode
                  ? "bg-brand-green text-white shadow-sm"
                  : "border bg-muted text-foreground hover:bg-muted/80"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Youtube className="h-4 w-4" />
              YouTube
            </button>
            <button
              type="button"
              onClick={() => { setKind("article"); setTextMode(false); }}
              disabled={isExtracting}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                kind === "article" && !textMode
                  ? "bg-brand-green text-white shadow-sm"
                  : "border bg-muted text-foreground hover:bg-muted/80"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <FileText className="h-4 w-4" />
              Article
            </button>
            <button
              type="button"
              onClick={() => { setTextMode(true); }}
              disabled={isExtracting}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                textMode
                  ? "bg-brand-green text-white shadow-sm"
                  : "border bg-muted text-foreground hover:bg-muted/80"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Type className="h-4 w-4" />
              Text
            </button>
          </div>

          {/* URL or Text input */}
          {textMode ? (
            <textarea
              value={directText}
              onChange={(e) => setDirectText(e.target.value)}
              placeholder="Paste text to analyze (article, email, documentation, etc.)..."
              rows={5}
              disabled={isExtracting}
              className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 disabled:opacity-50 resize-none"
            />
          ) : (
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={
                kind === "youtube"
                  ? "https://youtube.com/watch?v=..."
                  : "https://example.com/article"
              }
              disabled={isExtracting}
              className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 disabled:opacity-50"
            />
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={
                (textMode ? !directText.trim() : !url.trim()) || isPending || isExtracting
              }
              className="flex-1 rounded-lg bg-brand-green px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Extract Vocabulary
            </button>

            {(step === "done" || step === "error") && (
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border bg-muted px-4 py-2.5 text-sm font-semibold transition-all hover:bg-muted/80"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Step indicators */}
      {(step === "extracting" || step === "analyzing" || step === "done") && (
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                step === "extracting" || step === "analyzing" || step === "done"
                  ? "bg-brand-green" : "bg-muted"
              }`}>
                {step === "extracting" ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <Check className="h-5 w-5 text-white" />
                )}
              </div>
              <span className="text-xs font-semibold text-foreground">Fetching transcript</span>
            </div>

            <div className="flex-1 h-0.5 bg-muted" />

            <div className="flex flex-col items-center gap-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                step === "analyzing" || step === "done" ? "bg-brand-green" : "bg-muted"
              }`}>
                {step === "analyzing" ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : step === "done" ? (
                  <Check className="h-5 w-5 text-white" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                )}
              </div>
              <span className="text-xs font-semibold text-foreground">Analyzing content</span>
            </div>

            <div className="flex-1 h-0.5 bg-muted" />

            <div className="flex flex-col items-center gap-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                step === "done" ? "bg-brand-green" : "bg-muted"
              }`}>
                {step === "done" ? (
                  <Check className="h-5 w-5 text-white" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                )}
              </div>
              <span className="text-xs font-semibold text-foreground">Done</span>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {step === "error" && (
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-700">{errorMsg}</p>
          <button
            onClick={handleReset}
            className="mt-4 rounded-lg bg-red-100 px-4 py-2.5 text-sm font-semibold text-red-700 transition-all hover:bg-red-200"
          >
            Try again
          </button>
        </div>
      )}

      {/* Results area */}
      {step === "done" && items.length > 0 && (
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {visibleItems.length} phrase{visibleItems.length !== 1 ? "s" : ""} extracted —{" "}
              <span className="text-brand-green">{accepted.size} accepted</span>
            </h2>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAcceptAll}
              disabled={isPending || visibleItems.length === 0}
              className="flex-1 rounded-lg bg-brand-green px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Accept All
            </button>
            <button
              onClick={handleSkipAll}
              disabled={isPending}
              className="flex-1 rounded-lg border bg-muted px-4 py-2.5 text-sm font-semibold transition-all hover:bg-muted/80"
            >
              Skip All
            </button>
          </div>

          {visibleItems.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {visibleItems.map((item) => (
                <div key={item.vocabId} className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold text-foreground">{item.phrase}</p>
                    <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-medium ${getDifficultyColor(item.difficulty)}`}>
                      {item.difficulty}
                    </span>
                  </div>
                  <div>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{item.meaning}</p>
                  {item.example && (
                    <p className="text-sm italic text-muted-foreground">{item.example}</p>
                  )}
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Frequency: {item.frequencyScore}/10</span>
                    <span>Technical: {item.technicalRelevance}/10</span>
                  </div>
                  {accepted.has(item.vocabId) ? (
                    <div className="flex items-center gap-2 rounded-lg bg-green-100 px-3 py-2">
                      <Check className="h-4 w-4 text-green-700" />
                      <span className="text-sm font-semibold text-green-700">Added ✓</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptItem(item.vocabId)}
                        disabled={isPending}
                        className="flex-1 rounded-lg bg-brand-green px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add to Vault
                      </button>
                      <button
                        onClick={() => handleSkipItem(item.vocabId)}
                        className="flex-1 rounded-lg border bg-muted px-3 py-2 text-sm font-semibold transition-all hover:bg-muted/80"
                      >
                        Skip
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border bg-muted p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No new vocabulary found — all phrases may already be in your vault.
              </p>
            </div>
          )}
        </div>
      )}

      {step === "done" && items.length === 0 && (
        <div className="mx-auto max-w-3xl rounded-2xl border bg-muted p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No new vocabulary found — all phrases may already be in your vault.
          </p>
        </div>
      )}

      {/* Source history */}
      <div className="mx-auto max-w-3xl border-t pt-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Past submissions</h2>

        {history.length > 0 ? (
          <div className="space-y-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-semibold text-muted-foreground">URL / Source</th>
                  <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Type</th>
                  <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Status</th>
                  <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Items</th>
                  <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((source) => (
                  <tr key={source.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-2 text-foreground">
                      {source.url ? (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-green hover:underline truncate max-w-xs block"
                        >
                          {source.url.length > 40 ? source.url.slice(0, 40) + "..." : source.url}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">Direct text</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                        {kindLabel(source.kind)}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        source.status === "done"
                          ? "bg-green-100 text-green-700"
                          : source.status === "pending"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {source.status === "done" ? "Done" : source.status === "pending" ? "Pending" : "Failed"}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-foreground">{source.itemCount}</td>
                    <td className="py-3 px-2 text-muted-foreground">
                      {new Date(source.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No past submissions yet.</p>
        )}
      </div>
    </div>
  );
}
