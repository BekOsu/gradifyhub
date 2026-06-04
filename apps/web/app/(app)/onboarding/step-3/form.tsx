"use client";

import Link from "next/link";
import { signIn } from "~/lib/auth/client";
import type { ProfileGoal } from "@repo/contracts/profile";
import { getGoalLabel, getGoalDimensionTags } from "~/lib/journey/goals";

const BENEFITS = [
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    title: "Auto-detect your tech stack",
    desc: "We scan your public repos to find languages and frameworks you already use — so your roadmap skips what you know.",
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Verified work on your profile",
    desc: "Projects you've shipped show up as verified artifacts — visible to hiring managers browsing your profile.",
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    title: "Better assessment calibration",
    desc: "Real commit history gives the AI more signal — your gap analysis becomes sharper than a quiz alone can deliver.",
  },
];


const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

interface Props {
  editMode: boolean;
  goal: ProfileGoal | null;
}

export function OnboardingStep3Form({ editMode, goal }: Props) {
  const completionHref = editMode ? "/onboarding/complete?edit=1" : "/onboarding/complete";
  const goalLabel = getGoalLabel(goal);
  const dimensions = getGoalDimensionTags(goal);

  return (
    <div className="flex flex-col gap-8">

      {/* ── Progress header ── */}
      <div>
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">Step 3 of 3</span>
          <span className="font-semibold text-foreground">Connect GitHub</span>
        </div>
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-0.5 w-full rounded-full bg-brand-green transition-all duration-500" />
        </div>
        <h1 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
          {editMode ? "Reconnect GitHub" : `Make your ${goalLabel} assessment sharper`}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
          {editMode
            ? "Reconnect GitHub to refresh your project and stack data."
            : "Connect GitHub and your assessment becomes significantly more accurate — we use your real commit history, not just quiz answers."}
        </p>
      </div>

      {/* ── Benefits ── */}
      {!editMode && (
        <div className="flex flex-col divide-y divide-border/60 rounded-2xl border bg-card overflow-hidden shadow-sm">
          {BENEFITS.map((b) => (
            <div key={b.title} className="flex items-start gap-3.5 px-5 py-4">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
                {b.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground leading-tight">{b.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CTA buttons ── */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => signIn.social({ provider: "github", callbackURL: completionHref })}
          className="flex items-center justify-center gap-2.5 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-sm transition-all hover:bg-foreground/90 active:scale-[0.98]"
        >
          <GitHubIcon />
          Connect GitHub
        </button>
        <Link
          href={completionHref}
          className="rounded-xl border border-border/70 px-4 py-3 text-center text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {editMode ? "Save without reconnecting" : "Skip for now"}
        </Link>
        <p className="text-center text-[11px] text-muted-foreground/50">
          Read-only access to public repos only. We never write or store your code.
        </p>
      </div>

      {/* ── What's next preview ── */}
      <div className="rounded-2xl border border-brand-green/20 bg-brand-green/5 p-5">
        <div className="flex items-center gap-2 mb-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-green" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <p className="text-sm font-semibold text-foreground">Next: Your 15-minute assessment</p>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          15 adaptive questions across {dimensions.length} skill dimensions. Results generate your personalised {goalLabel} roadmap.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {dimensions.map((d) => (
            <span key={d} className="rounded-full bg-background/70 border border-border/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              {d}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center border-t border-border/60 pt-5">
        <Link
          href={editMode ? "/onboarding/step-2?edit=1" : "/onboarding/step-2"}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back
        </Link>
      </div>

    </div>
  );
}
