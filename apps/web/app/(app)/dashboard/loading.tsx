export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-muted" />
          <div className="h-4 w-24 rounded-lg bg-muted" />
        </div>
        <div className="h-16 w-20 rounded-xl bg-muted" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 h-48 rounded-xl bg-muted" />
        <div className="h-48 rounded-xl bg-muted" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-20 rounded-xl bg-muted" />
        <div className="h-20 rounded-xl bg-muted" />
        <div className="h-20 rounded-xl bg-muted" />
      </div>
    </div>
  );
}
