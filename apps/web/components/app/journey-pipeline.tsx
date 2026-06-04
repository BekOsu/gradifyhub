"use client";

import { Fragment } from "react";
import Link from "next/link";
import { CheckCircle2, UserCircle, ClipboardList, Map, BookOpen } from "lucide-react";
import { cn } from "~/lib/utils";

const STEP_ICONS = {
  onboarding: UserCircle,
  assessment: ClipboardList,
  roadmap: Map,
  learning: BookOpen,
} as const;

interface PipelineStep {
  id: string;
  title: string;
  description: string;
  status: "complete" | "current" | "upcoming";
}

interface JourneyPipelineProps {
  steps: PipelineStep[];
  headline: string;
  message: string;
  cta: { href: string; label: string };
}

export function JourneyPipeline({ steps, headline, message, cta }: JourneyPipelineProps) {
  return (
    <section className="rounded-xl border bg-gradient-to-br from-muted/40 to-background p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Your journey
          </p>
          <h2 className="mt-1 text-base font-semibold">{headline}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{message}</p>
        </div>
        <Link
          href={cta.href}
          className="shrink-0 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {cta.label}
        </Link>
      </div>

      {/* ── Desktop: horizontal pipeline ── */}
      <div className="mt-8 hidden sm:block">
        {/* Circles + connectors */}
        <div className="flex items-center">
          {steps.map((step, i) => {
            const Icon = STEP_ICONS[step.id as keyof typeof STEP_ICONS] ?? UserCircle;
            const isComplete = step.status === "complete";
            const isCurrent = step.status === "current";
            const isLast = i === steps.length - 1;

            return (
              <Fragment key={step.id}>
                <div
                  className={cn(
                    "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
                    isComplete && "border-green-500 bg-green-500 text-white shadow-md shadow-green-200/60",
                    isCurrent && "border-primary bg-primary/10 text-primary shadow-md shadow-primary/20",
                    !isComplete && !isCurrent && "border-border bg-background text-muted-foreground/40",
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5" strokeWidth={2.5} />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                  {isCurrent && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                  )}
                </div>

                {!isLast && (
                  <div
                    className={cn(
                      "h-[2px] flex-1 rounded-full transition-colors duration-500",
                      isComplete ? "bg-green-400" : "bg-border",
                    )}
                  />
                )}
              </Fragment>
            );
          })}
        </div>

        {/* Labels */}
        <div className="mt-3 grid grid-cols-4">
          {steps.map((step) => {
            const isComplete = step.status === "complete";
            const isCurrent = step.status === "current";
            return (
              <div key={step.id} className="flex flex-col items-center px-1 text-center">
                <span
                  className={cn(
                    "text-xs font-semibold leading-tight",
                    isComplete && "text-green-600",
                    isCurrent && "text-primary",
                    !isComplete && !isCurrent && "text-muted-foreground/50",
                  )}
                >
                  {step.title}
                </span>
                {isCurrent && (
                  <span className="mt-0.5 text-[10px] text-muted-foreground">
                    {step.description}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Mobile: vertical pipeline ── */}
      <div className="mt-6 flex flex-col sm:hidden">
        {steps.map((step, i) => {
          const Icon = STEP_ICONS[step.id as keyof typeof STEP_ICONS] ?? UserCircle;
          const isComplete = step.status === "complete";
          const isCurrent = step.status === "current";
          const isLast = i === steps.length - 1;

          return (
            <div key={step.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                    isComplete && "border-green-500 bg-green-500 text-white",
                    isCurrent && "border-primary bg-primary/10 text-primary",
                    !isComplete && !isCurrent && "border-border bg-background text-muted-foreground/40",
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  {isCurrent && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                  )}
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "my-1 w-[2px] flex-1 rounded-full",
                      isComplete ? "bg-green-400" : "bg-border",
                    )}
                  />
                )}
              </div>
              <div className={cn("min-h-[2.5rem] pt-1", !isLast && "pb-2")}>
                <p
                  className={cn(
                    "text-sm font-semibold",
                    isComplete && "text-green-600",
                    isCurrent && "text-primary",
                    !isComplete && !isCurrent && "text-muted-foreground/50",
                  )}
                >
                  {step.title}
                </p>
                {isCurrent && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
