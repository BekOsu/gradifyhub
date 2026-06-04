import { requireAuth } from "~/lib/auth/session";
import { getUserVocabulary, getUserVocabularyStats } from "@repo/db/queries/vocabulary";
import { hasVocabularyItems } from "~/lib/english/personalization";
import Link from "next/link";
import { ArrowRight, BarChart3 } from "lucide-react";
import { DeleteVocabButton } from "./delete-vocab-button";
import { AddWordForm } from "./add-word-form";
import { VocabOnboarding } from "./vocab-onboarding";

export default async function VocabPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;
  const selectedCategory = params.category || "All";

  const isFirstVisit = !(await hasVocabularyItems(user.id));
  if (isFirstVisit) {
    return <VocabOnboarding />;
  }

  const [vocabItems, stats] = await Promise.all([
    getUserVocabulary(user.id, {
      category: selectedCategory === "All" ? undefined : selectedCategory,
    }),
    getUserVocabularyStats(user.id),
  ]);

  const categories = ["All", "Daily Life", "Work", "Technical", "Opinion", "Social"];
  const categoryCount = Object.keys(stats.byCategory).filter((k) => (stats.byCategory[k] ?? 0) > 0).length;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Daily Life":
        return "bg-blue-100 text-blue-700";
      case "Work":
        return "bg-purple-100 text-purple-700";
      case "Technical":
        return "bg-orange-100 text-orange-700";
      case "Opinion":
        return "bg-pink-100 text-pink-700";
      case "Social":
        return "bg-teal-100 text-teal-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getMasteryColor = (score: number) => {
    if (score >= 70) return "bg-green-100";
    if (score >= 40) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getMasteryTextColor = (score: number) => {
    if (score >= 70) return "text-green-700";
    if (score >= 40) return "text-yellow-700";
    return "text-red-700";
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 pb-12 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            My Vocabulary
          </h1>
        </div>
        {stats.dueNow > 0 && (
          <Link
            href="/english/vocab/review"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-brand-green/90 hover:shadow-md active:scale-[0.98]"
          >
            Review now
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Stats row */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <div className="group rounded-2xl border p-5 transition-all duration-150 hover:border-border/80 hover:shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
                {stats.total}
              </p>
              <p className="mt-1 text-xs font-medium text-foreground">Total Words</p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted">
              <BarChart3 className="h-4 w-4 text-muted-foreground/50" />
            </div>
          </div>
        </div>

        <div
          className={`group rounded-2xl border p-5 transition-all duration-150 hover:shadow-sm ${
            stats.dueNow > 0
              ? "border-amber-200/70 bg-amber-50/60 dark:border-amber-900/30 dark:bg-amber-950/20"
              : "hover:border-border/80"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={`text-2xl font-bold tabular-nums tracking-tight ${stats.dueNow > 0 ? "text-amber-600" : "text-foreground"}`}>
                {stats.dueNow}
              </p>
              <p className="mt-1 text-xs font-medium text-foreground">Due Now</p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border p-5 transition-all duration-150 hover:border-border/80 hover:shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
                {stats.learned}
              </p>
              <p className="mt-1 text-xs font-medium text-foreground">Learned</p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border p-5 transition-all duration-150 hover:border-border/80 hover:shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
                {categoryCount}
              </p>
              <p className="mt-1 text-xs font-medium text-foreground">Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => {
          const isActive = cat === selectedCategory;
          const href = cat === "All" ? "/english/vocab" : `/english/vocab?category=${encodeURIComponent(cat)}`;

          return (
            <Link
              key={cat}
              href={href}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-brand-green text-white shadow-sm"
                  : "border border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground"
              }`}
            >
              {cat}
            </Link>
          );
        })}
      </div>

      {/* Add word form */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Add a word</h2>
        <AddWordForm />
      </div>

      {/* Vocabulary list */}
      {vocabItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center">
          <p className="text-sm font-semibold text-foreground">
            Your vocabulary vault is empty.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first word above, or mine vocabulary from YouTube.
          </p>
          <Link
            href="/english/vocab/mine"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-brand-green px-4 py-2.5 text-sm font-semibold text-brand-green transition-all duration-150 hover:bg-brand-green/5"
          >
            Mine from YouTube
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {vocabItems.map((item) => {
            const now = new Date();
            const isDueNow = item.nextReviewAt <= now;

            return (
              <div
                key={item.userVocabId}
                className="group rounded-xl border bg-card p-4 transition-all duration-150 hover:shadow-sm"
              >
                <div className="flex items-start gap-4">
                  {/* Left: phrase and meaning */}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{item.phrase}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.meaning}</p>
                  </div>

                  {/* Center: badges */}
                  <div className="flex flex-col gap-2 text-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {item.state === "new" ? "New" : item.state === "learning" ? "Learning" : item.state === "review" ? "Review" : "Relearning"}
                    </span>
                  </div>

                  {/* Right: mastery bar and next review */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="w-24 space-y-1">
                      <div className={`h-2 rounded-full ${getMasteryColor(item.masteryScore)}`} style={{ width: `${item.masteryScore}%` }} />
                      <p className={`text-[11px] font-semibold ${getMasteryTextColor(item.masteryScore)}`}>
                        {item.masteryScore}%
                      </p>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {isDueNow ? (
                        <span className="text-amber-600 font-medium">Due now</span>
                      ) : (
                        `Next: ${item.nextReviewAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                      )}
                    </p>
                  </div>

                  {/* Delete button */}
                  <DeleteVocabButton userVocabId={item.userVocabId} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
