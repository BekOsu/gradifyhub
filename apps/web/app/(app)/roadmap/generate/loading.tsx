export default function GenerateLoading() {
  return (
    <div className="mx-auto max-w-lg space-y-8 py-24 text-center">
      <div className="relative mx-auto h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-muted" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-brand-green" />
      </div>

      <div className="space-y-2">
        <p className="text-lg font-semibold">Building your Roadmap…</p>
        <p className="text-sm text-muted-foreground">
          AI is analysing your Assessment signals, skill gaps, and target timeline to sequence your Roadmap.
          This takes about 15–30 seconds.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {["Scoring signals", "Mapping gaps", "Sequencing phases", "Estimating timelines"].map((step) => (
          <span
            key={step}
            className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}
