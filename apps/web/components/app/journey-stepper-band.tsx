"use client";

import { Stepper } from "@repo/ui/stepper";
import { usePathname } from "next/navigation";
import type { JourneyUnlocks } from "~/lib/journey/unlocks";

interface StepDef {
  label: string;
  href: string;
  prerequisiteHref: string;
  lockedHint: string;
  match: (p: string) => boolean;
}

const JOURNEY_STEPS: StepDef[] = [
  {
    label: "Profile",
    href: "/onboarding/step-1",
    prerequisiteHref: "/onboarding/step-1",
    lockedHint: "",
    match: (p) => p.startsWith("/onboarding"),
  },
  {
    label: "Assessment",
    href: "/assessment",
    prerequisiteHref: "/onboarding/step-1",
    lockedHint: "Set up your profile first",
    match: (p) => p.startsWith("/assessment"),
  },
  {
    label: "Roadmap",
    href: "/roadmap",
    prerequisiteHref: "/assessment",
    lockedHint: "Complete your Assessment first",
    match: (p) => p.startsWith("/roadmap"),
  },
  {
    label: "Learn",
    href: "/roadmap",
    prerequisiteHref: "/roadmap",
    lockedHint: "Generate your Roadmap first",
    match: (p) => p.startsWith("/learn"),
  },
  {
    label: "Build",
    href: "/catalog",
    prerequisiteHref: "/roadmap",
    lockedHint: "Complete a lesson first",
    match: (p) => p.startsWith("/projects") || p.startsWith("/catalog"),
  },
  {
    label: "Interview",
    href: "/interview-prep",
    prerequisiteHref: "/roadmap",
    lockedHint: "Complete a lesson first",
    match: (p) => p.startsWith("/interview-prep"),
  },
  {
    label: "Resume",
    href: "/resume",
    prerequisiteHref: "/interview-prep",
    lockedHint: "Complete an Interview Prep session first",
    match: (p) => p.startsWith("/resume"),
  },
  {
    label: "Hired",
    href: "/dashboard",
    prerequisiteHref: "/dashboard",
    lockedHint: "",
    match: () => false,
  },
];

const JOURNEY_ROOTS = [
  "/dashboard",
  "/onboarding",
  "/assessment",
  "/roadmap",
  "/learn",
  "/catalog",
  "/projects",
  "/interview-prep",
  "/resume",
];

function isJourneyPath(pathname: string) {
  return JOURNEY_ROOTS.some((base) => pathname === base || pathname.startsWith(`${base}/`));
}

function getCurrentIndex(pathname: string, unlocks: JourneyUnlocks): number {
  const pathIdx = JOURNEY_STEPS.findIndex((s) => s.match(pathname));
  if (pathIdx !== -1) return pathIdx;
  // On /dashboard: first step whose completion hasn't yet unlocked the next one
  for (let i = 0; i < JOURNEY_STEPS.length - 1; i++) {
    if (!(unlocks[i + 1] ?? false)) return i;
  }
  return JOURNEY_STEPS.length - 1; // all done → Hired
}

interface JourneyStepperBandProps {
  unlocks: JourneyUnlocks;
}

export function JourneyStepperBand({ unlocks }: JourneyStepperBandProps) {
  const pathname = usePathname();
  if (!isJourneyPath(pathname)) return null;

  const current = getCurrentIndex(pathname, unlocks);

  const steps = JOURNEY_STEPS.map((s, i) => {
    const isUnlocked = unlocks[i] ?? false;
    const isCurrent = i === current;

    if (isCurrent) {
      // Always render the current step as "current" even if locked, so the user
      // knows what to do next; href points to prerequisite if locked.
      return {
        label: s.label,
        href: isUnlocked ? undefined : s.prerequisiteHref,
        state: "current" as const,
        lockedHint: isUnlocked ? undefined : s.lockedHint,
      };
    }

    if (i < current) {
      return { label: s.label, href: s.href, state: "done" as const };
    }

    if (!isUnlocked) {
      return {
        label: s.label,
        href: s.prerequisiteHref,
        state: "locked" as const,
        lockedHint: s.lockedHint,
      };
    }

    return { label: s.label, href: s.href, state: "upcoming" as const };
  });

  return (
    <section className="mb-6 rounded-xl border bg-muted/20 p-3 md:p-4">
      <Stepper steps={steps} />
    </section>
  );
}
