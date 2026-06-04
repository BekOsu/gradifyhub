export default function AssessmentLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-40 rounded-lg bg-muted" />
        <div className="h-4 w-64 rounded-lg bg-muted" />
      </div>
      <div className="h-48 rounded-xl bg-muted" />
      <div className="flex gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-7 w-16 rounded-full bg-muted" />
        ))}
      </div>
      <div className="h-12 w-40 rounded-full bg-muted" />
    </div>
  );
}

