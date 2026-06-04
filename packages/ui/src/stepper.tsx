import * as React from "react";

type StepState = "done" | "current" | "upcoming" | "locked";

interface StepperStep {
  label: string;
  state: StepState;
  href?: string;
  lockedHint?: string;
}

interface StepperProps {
  steps: StepperStep[];
  className?: string;
}

export function Stepper({ steps, className = "" }: StepperProps) {
  return (
    <nav aria-label="Progress" className={`flex items-center gap-0 overflow-x-auto ${className}`}>
      {steps.map((step, i) => {
        const isLocked = step.state === "locked";

        const circle = (
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
              step.state === "done"
                ? "bg-brand-green text-white"
                : step.state === "current"
                ? "border-2 border-brand-green bg-white text-brand-green"
                : isLocked
                ? "border-2 border-muted/50 bg-muted/20 text-muted-foreground/40"
                : "border-2 border-muted bg-background text-muted-foreground"
            }`}
          >
            {step.state === "done" ? (
              <svg viewBox="0 0 12 12" fill="none" className="h-3.5 w-3.5">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : isLocked ? (
              <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
                <rect x="2" y="5.5" width="8" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <path d="M4 5.5V4a2 2 0 1 1 4 0v1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            ) : (
              i + 1
            )}
          </div>
        );

        const labelEl = (
          <span
            className={`max-w-[5rem] text-center text-[10px] font-medium leading-tight ${
              step.state === "current"
                ? "text-foreground"
                : isLocked
                ? "text-muted-foreground/40"
                : "text-muted-foreground"
            }`}
          >
            {step.label}
          </span>
        );

        const title = isLocked && step.lockedHint ? step.lockedHint : undefined;

        const stepEl = step.href ? (
          <a
            key={step.label}
            href={step.href}
            title={title}
            aria-label={title ?? step.label}
            className={`flex flex-shrink-0 flex-col items-center gap-1.5 rounded-md p-1 transition-opacity ${
              isLocked ? "opacity-50 hover:opacity-75 cursor-pointer" : "hover:opacity-70"
            }`}
          >
            {circle}
            {labelEl}
          </a>
        ) : (
          <div
            key={step.label}
            title={title}
            aria-label={title ?? step.label}
            className="flex flex-shrink-0 flex-col items-center gap-1.5 p-1"
          >
            {circle}
            {labelEl}
          </div>
        );

        return (
          <React.Fragment key={step.label}>
            {stepEl}
            {i < steps.length - 1 && (
              <div
                className={`mx-1 h-px w-8 shrink-0 transition-colors ${
                  step.state === "done" ? "bg-brand-green" : "bg-muted"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
