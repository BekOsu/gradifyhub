export default function ResultsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-10 pb-16">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="h-6 w-36 animate-pulse rounded-full bg-muted" />
        <div className="h-8 w-72 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-96 animate-pulse rounded bg-muted" />
      </div>

      {/* Radar placeholder */}
      <div className="flex justify-center">
        <div className="h-64 w-64 animate-pulse rounded-full bg-muted/60" />
      </div>

      {/* Analysis in progress */}
      <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-6 text-center">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
        <p className="text-sm font-semibold">Analysing your diagnostic results…</p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Three specialist models are reviewing your technical, communication, and soft-skills signals in parallel. This takes about 10 seconds.
        </p>
      </div>

      {/* Grouped readiness skeletons */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border p-4 space-y-2">
            <div className="h-3 w-28 animate-pulse rounded bg-muted" />
            <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            <div className="h-1.5 w-full animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>

      {/* Dimension bar skeletons */}
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <div key={i}>
            <div className="mb-1.5 flex justify-between">
              <div className="h-3.5 w-28 animate-pulse rounded bg-muted" />
              <div className="h-3.5 w-12 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
