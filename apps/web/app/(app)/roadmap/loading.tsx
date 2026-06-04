export default function RoadmapLoading() {
  return (
    <div className="flex h-full animate-pulse gap-0">
      <div className="w-48 shrink-0 border-r bg-muted/30" />
      <div className="flex-1 p-8 space-y-6">
        <div className="space-y-2">
          <div className="h-7 w-56 rounded-lg bg-muted" />
          <div className="h-4 w-40 rounded-lg bg-muted" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 w-32 rounded-lg bg-muted" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
