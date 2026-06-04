"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import {
  ClipboardList,
  Map,
  BookOpen,
  Hammer,
  MessageSquare,
  FileText,
  Briefcase,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { cn } from "~/lib/utils";

const steps = [
  {
    id: "assessment",
    title: "Assessment",
    short: "Find your baseline",
    detail:
      "We map your technical, communication, and collaboration signals to identify your highest-impact skill gaps.",
    icon: ClipboardList,
    color: "from-violet-500/10 to-violet-500/5",
    accent: "text-violet-600",
    ring: "ring-violet-500/30 shadow-violet-200/60",
    node: "bg-violet-500 border-violet-500",
  },
  {
    id: "roadmap",
    title: "Roadmap",
    short: "One path, one next step",
    detail:
      "Your Roadmap is built from your Assessment. One personalised path from where you are to where the market needs you.",
    icon: Map,
    color: "from-blue-500/10 to-blue-500/5",
    accent: "text-blue-600",
    ring: "ring-blue-500/30 shadow-blue-200/60",
    node: "bg-blue-500 border-blue-500",
  },
  {
    id: "learn",
    title: "Learn",
    short: "Focus on what matters",
    detail:
      "You work through targeted lessons and quizzes aligned to the exact gaps blocking your hiring progress.",
    icon: BookOpen,
    color: "from-emerald-500/10 to-emerald-500/5",
    accent: "text-emerald-600",
    ring: "ring-emerald-500/30 shadow-emerald-200/60",
    node: "bg-emerald-500 border-emerald-500",
  },
  {
    id: "build",
    title: "Build",
    short: "Create proof",
    detail:
      "You turn learning into portfolio-ready outputs that show practical execution, not just theory.",
    icon: Hammer,
    color: "from-amber-500/10 to-amber-500/5",
    accent: "text-amber-600",
    ring: "ring-amber-500/30 shadow-amber-200/60",
    node: "bg-amber-500 border-amber-500",
  },
  {
    id: "interview",
    title: "Interview Prep",
    short: "The decisive rehearsal",
    detail:
      "AI-calibrated mock interviews at your exact Assessment level — the confrontation that proves you're ready.",
    icon: MessageSquare,
    color: "from-rose-500/10 to-rose-500/5",
    accent: "text-rose-600",
    ring: "ring-rose-500/30 shadow-rose-200/60",
    node: "bg-rose-500 border-rose-500",
  },
  {
    id: "resume",
    title: "Resume",
    short: "Present your value",
    detail:
      "Build a clean, professional resume that highlights verified skills and evidence from your work.",
    icon: FileText,
    color: "from-indigo-500/10 to-indigo-500/5",
    accent: "text-indigo-600",
    ring: "ring-indigo-500/30 shadow-indigo-200/60",
    node: "bg-indigo-500 border-indigo-500",
  },
  {
    id: "hired",
    title: "Get Hired",
    short: "Convert to offers",
    detail:
      "You apply with stronger proof, clearer positioning, and better interview performance to increase offer odds.",
    icon: Briefcase,
    color: "from-teal-500/10 to-teal-500/5",
    accent: "text-teal-600",
    ring: "ring-teal-500/30 shadow-teal-200/60",
    node: "bg-teal-500 border-teal-500",
  },
] as const;

const CYCLE_MS = 3000;

export function JourneySteps() {
  const [active, setActive] = useState<number>(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % steps.length);
    }, CYCLE_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused]);

  function select(i: number) {
    setActive(i);
    setPaused(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  function resume() {
    setPaused(false);
  }

  const current = steps[active]!;
  const Icon = current.icon;

  return (
    <div
      className="mt-12"
      onMouseLeave={resume}
    >
      {/* ── Pipeline track ── */}
      <div className="relative flex items-center overflow-x-auto pb-1">
        {steps.map((step, i) => {
          const StepIcon = step.icon;
          const isActive = i === active;
          const isPast = i < active;
          const isLast = i === steps.length - 1;

          return (
            <Fragment key={step.id}>
              <button
                onClick={() => select(i)}
                onMouseEnter={() => select(i)}
                aria-label={step.title}
                className="flex flex-col items-center gap-2 transition-transform duration-300 focus:outline-none"
                style={{ transform: isActive ? "scale(1.15)" : "scale(1)" }}
              >
                <div
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                    isActive &&
                      cn(
                        "text-white shadow-lg ring-4",
                        step.node,
                        step.ring,
                      ),
                    isPast && "border-border bg-muted text-muted-foreground",
                    !isActive && !isPast && "border-border bg-background text-muted-foreground hover:border-muted-foreground/50",
                  )}
                >
                  {isPast ? (
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground/60" strokeWidth={2} />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                  {isActive && (
                    <span
                      className={cn(
                        "absolute inset-0 animate-ping rounded-full opacity-30",
                        step.node,
                      )}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    "hidden text-[10px] font-semibold sm:block",
                    isActive ? step.accent : "text-muted-foreground/60",
                  )}
                >
                  {step.title}
                </span>
              </button>

              {!isLast && (
                <div
                  className={cn(
                    "h-[2px] flex-1 rounded-full transition-colors duration-500",
                    isPast ? "bg-border" : "bg-border/50",
                  )}
                />
              )}
            </Fragment>
          );
        })}
      </div>

      {/* ── Detail card ── */}
      <div
        key={active}
        className={cn(
          "animate-fade-up mt-8 rounded-2xl border bg-gradient-to-br p-8 shadow-sm",
          current.color,
        )}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Icon */}
          <div
            className={cn(
              "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white shadow-md",
              current.node,
            )}
          >
            <Icon className="h-8 w-8" />
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Step {active + 1} of {steps.length}
            </p>
            <h3 className={cn("mt-1 text-2xl font-bold tracking-tight", current.accent)}>
              {current.title}
            </h3>
            <p className="mt-0.5 text-sm font-medium text-muted-foreground">{current.short}</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/70">{current.detail}</p>
          </div>
        </div>

        {/* Progress dots + next */}
        <div className="mt-6 flex items-center gap-2">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => select(i)}
              aria-label={`Go to step ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === active
                  ? cn("w-6", current.node.split(" ")[0])
                  : "w-1.5 bg-muted-foreground/25 hover:bg-muted-foreground/50",
              )}
            />
          ))}

          <button
            onClick={() => select((active + 1) % steps.length)}
            className={cn(
              "ml-auto flex items-center gap-1 text-xs font-semibold transition-colors",
              current.accent,
            )}
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
