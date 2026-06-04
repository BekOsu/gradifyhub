"use client";

import Link from "next/link";

type Phase = {
  id: string;
  name: string;
  weeks: number;
  status: string;
  order: number;
  skills: { id: string; status: string }[];
};

export function PhaseNav({
  phases,
  activeIndex,
}: {
  phases: Phase[];
  activeIndex: number;
}) {
  return (
    <>
      {/* ── Desktop sidebar (lg+) ── */}
      <aside className="hidden w-56 shrink-0 flex-col gap-1 border-r p-4 lg:flex">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Phases
        </p>
        {phases.map((phase, i) => {
          const completed = phase.skills.filter((s) => s.status === "completed")
            .length;
          const total = phase.skills.length;
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <Link
              key={phase.id}
              href={`/roadmap?phase=${i + 1}`}
              className={`rounded-md px-3 py-2 text-sm transition-colors ${
                i === activeIndex
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <div className="font-medium">{phase.name}</div>
              <div className="mt-0.5 text-xs opacity-70">
                {phase.weeks}w · {pct}%
              </div>
            </Link>
          );
        })}
      </aside>

      {/* ── Mobile horizontal pill strip (< lg) ── */}
      <nav className="flex gap-2 overflow-x-auto border-b px-4 py-3 lg:hidden">
        {phases.map((phase, i) => (
          <Link
            key={phase.id}
            href={`/roadmap?phase=${i + 1}`}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              i === activeIndex
                ? "bg-primary text-primary-foreground"
                : "border bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            {phase.name}
          </Link>
        ))}
      </nav>
    </>
  );
}
