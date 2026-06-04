"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LessonMarkdown } from "./markdown-render";

type Section = { title: string; source: string };

function scrollMainToTop() {
  const mainEl = document.querySelector("main");
  if (mainEl) mainEl.scrollTo({ top: 0, behavior: "smooth" });
}

export function SectionedLesson({
  sections,
  quizSlot,
}: {
  sections: Section[];
  quizSlot?: React.ReactNode;
}) {
  const [step, setStep] = useState(0);
  const hasQuiz = !!quizSlot;
  const totalSteps = sections.length + (hasQuiz ? 1 : 0);
  const isQuizStep = hasQuiz && step === sections.length;
  const section = sections[step];
  const activeItemRef = useRef<HTMLButtonElement>(null);

  function goto(n: number) {
    setStep(Math.max(0, Math.min(totalSteps - 1, n)));
    scrollMainToTop();
  }

  // Keep active section visible in sidebar
  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [step]);

  const prevLabel =
    step > 0
      ? step - 1 === sections.length
        ? "Quiz"
        : (sections[step - 1]?.title ?? "Previous")
      : null;

  const nextLabel =
    step < totalSteps - 1
      ? step + 1 === sections.length
        ? "Quiz"
        : (sections[step + 1]?.title ?? "Next")
      : null;

  return (
    <div className="flex gap-6 items-start">
      {/* Left sidebar — vertical section list (desktop only) */}
      <nav className="hidden md:flex flex-col w-44 shrink-0 sticky top-8 max-h-[calc(100vh-5rem)]">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 shrink-0">
          Sections
        </p>
        <div className="overflow-y-auto space-y-0.5 flex-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          {sections.map((s, i) => (
            <button
              key={i}
              ref={step === i ? activeItemRef : undefined}
              type="button"
              onClick={() => goto(i)}
              className={`w-full text-left rounded-md px-2.5 py-1.5 text-xs leading-snug transition-colors ${
                step === i
                  ? "bg-foreground/10 text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <span className="flex items-start gap-1.5">
                <span className="mt-0.5 shrink-0 text-[10px] tabular-nums opacity-40 w-3">
                  {i + 1}
                </span>
                <span className="leading-tight">{s.title}</span>
              </span>
            </button>
          ))}
          {hasQuiz && (
            <button
              ref={isQuizStep ? activeItemRef : undefined}
              type="button"
              onClick={() => goto(sections.length)}
              className={`w-full text-left rounded-md px-2.5 py-1.5 text-xs leading-snug transition-colors ${
                isQuizStep
                  ? "bg-foreground/10 text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <span className="flex items-start gap-1.5">
                <span className="mt-0.5 shrink-0 text-[10px] tabular-nums opacity-40 w-3">
                  {sections.length + 1}
                </span>
                <span className="leading-tight">Quiz</span>
              </span>
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="mt-5 px-2.5">
          <div className="h-0.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{
                width: totalSteps > 1 ? `${(step / (totalSteps - 1)) * 100}%` : "0%",
              }}
            />
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground tabular-nums">
            {step + 1} / {totalSteps}
          </p>
        </div>
      </nav>

      {/* Right: content + navigation */}
      <div className="flex-1 min-w-0">
        {/* Mobile: horizontal pill strip */}
        <div className="md:hidden mb-5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]">
          <div className="flex gap-1.5 min-w-max">
            {sections.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goto(i)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium leading-none transition-colors whitespace-nowrap ${
                  step === i
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.title}
              </button>
            ))}
            {hasQuiz && (
              <button
                type="button"
                onClick={() => goto(sections.length)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium leading-none transition-colors whitespace-nowrap ${
                  isQuizStep
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Quiz
              </button>
            )}
          </div>
        </div>

        {/* Mobile: progress bar */}
        <div className="md:hidden mb-8 h-0.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{
              width: totalSteps > 1 ? `${(step / (totalSteps - 1)) * 100}%` : "0%",
            }}
          />
        </div>

        {/* Section content */}
        <div className="min-h-[200px]">
          {isQuizStep ? quizSlot : <LessonMarkdown source={section?.source ?? ""} />}
        </div>

        {/* Prev / Next */}
        <div className="mt-10 flex items-center justify-between border-t pt-6">
          <button
            type="button"
            onClick={() => goto(step - 1)}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline max-w-[160px] truncate">{prevLabel}</span>
            <span className="sm:hidden">Previous</span>
          </button>

          <span className="text-xs text-muted-foreground tabular-nums">
            {step + 1} / {totalSteps}
          </span>

          <button
            type="button"
            onClick={() => goto(step + 1)}
            disabled={step === totalSteps - 1}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30 transition-colors"
          >
            <span className="hidden sm:inline max-w-[160px] truncate">{nextLabel}</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
