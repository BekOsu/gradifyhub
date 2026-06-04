"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { JourneyStatus } from "~/lib/journey/status";

interface JourneyBannerProps {
  journey: JourneyStatus;
}

export function JourneyBanner({ journey }: JourneyBannerProps) {
  const pathname = usePathname();
  const onCtaPage = pathname === journey.cta.href || pathname.startsWith(journey.cta.href + "/");

  return (
    <section className="mb-6 rounded-xl border bg-muted/20 p-4 md:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Journey status</p>
          <h2 className="mt-1 text-base font-semibold">{journey.headline}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{journey.message}</p>
        </div>
        {!onCtaPage && (
          <Link
            href={journey.cta.href}
            className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shrink-0"
          >
            {journey.cta.label}
          </Link>
        )}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        {journey.steps.map((step, index) => (
          <div key={step.id} className="rounded-lg border bg-background px-3 py-2">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                  step.status === "complete"
                    ? "bg-green-500 text-white"
                    : step.status === "current"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </span>
              <p className="text-xs font-medium">{step.title}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
