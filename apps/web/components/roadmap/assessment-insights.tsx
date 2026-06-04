import Link from "next/link";

type Dimension = { key: string; label: string; isCritical: boolean };

type Props = {
  dimensions: Dimension[];
  knowledgeScores: Record<string, number> | null;
  earnedLevels: Record<string, number> | null;
};

function band(score: number): "focus" | "review" | "good" {
  if (score < 45) return "focus";
  if (score < 70) return "review";
  return "good";
}

const BAND_STYLES = {
  focus:  { chip: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40",   score: "text-red-600 dark:text-red-400",   badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",   label: "Focus" },
  review: { chip: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40", score: "text-amber-600 dark:text-amber-400", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300", label: "Review" },
  good:   { chip: "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/40",  score: "text-green-600 dark:text-green-400",  badge: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",  label: "Strong" },
};

export function AssessmentInsights({ dimensions, knowledgeScores, earnedLevels }: Props) {
  if (!knowledgeScores && !earnedLevels) return null;

  const scored = dimensions
    .map((d) => {
      const mcq = knowledgeScores?.[d.key];
      const level = earnedLevels?.[d.key];
      // Prefer earned level (self-assessment); fall back to MCQ score
      const score = level !== undefined ? level * 25 : (mcq ?? null);
      return { ...d, score };
    })
    .filter((d) => d.score !== null) as Array<Dimension & { score: number }>;

  if (scored.length === 0) return null;

  // Sort: focus first, then review, then good; within each group sort by score asc
  const sorted = [...scored].sort((a, b) => {
    const ba = band(a.score);
    const bb = band(b.score);
    const order = { focus: 0, review: 1, good: 2 };
    if (order[ba] !== order[bb]) return order[ba] - order[bb];
    return a.score - b.score;
  });

  const focusCount = sorted.filter((d) => band(d.score) === "focus").length;

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Assessment snapshot</p>
          <p className="text-xs text-muted-foreground">
            {focusCount > 0
              ? `${focusCount} dimension${focusCount > 1 ? "s" : ""} to prioritise — start there in the roadmap below`
              : "All dimensions looking solid — keep going"}
          </p>
        </div>
        <Link
          href="/assessment"
          className="shrink-0 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Retake
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {sorted.map((d) => {
          const b = band(d.score);
          const s = BAND_STYLES[b];
          return (
            <div
              key={d.key}
              className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 ${s.chip}`}
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{d.label}</p>
                {d.isCritical && (
                  <p className="text-[10px] text-muted-foreground">critical</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className={`text-sm font-bold tabular-nums ${s.score}`}>{d.score}%</p>
                <span className={`inline-block rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${s.badge}`}>
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
