export type JourneyStepId = "onboarding" | "assessment" | "roadmap" | "learning";

export type JourneyStepStatus = "complete" | "current" | "upcoming";

export interface JourneyStep {
  id: JourneyStepId;
  title: string;
  description: string;
  status: JourneyStepStatus;
}

export interface JourneyStatus {
  headline: string;
  message: string;
  cta: { href: string; label: string };
  steps: JourneyStep[];
}

interface JourneyStatusInput {
  isOnboarded: boolean;
  hasCompletedAssessment: boolean;
  hasRoadmap: boolean;
  completedLessonsCount: number;
}

const STEP_META: Omit<JourneyStep, "status">[] = [
  {
    id: "onboarding",
    title: "Profile",
    description: "Role, goal, and study pace saved.",
  },
  {
    id: "assessment",
    title: "Assessment",
    description: "Diagnostic score is ready.",
  },
  {
    id: "roadmap",
    title: "Roadmap",
    description: "Personal plan is generated.",
  },
  {
    id: "learning",
    title: "Learning",
    description: "Lessons and streak are in progress.",
  },
];

function getCurrentStep(input: JourneyStatusInput): JourneyStepId {
  if (!input.isOnboarded) return "onboarding";
  if (!input.hasCompletedAssessment) return "assessment";
  if (!input.hasRoadmap) return "roadmap";
  return "learning";
}

export function buildJourneyStatus(input: JourneyStatusInput): JourneyStatus {
  const current = getCurrentStep(input);
  const order: JourneyStepId[] = ["onboarding", "assessment", "roadmap", "learning"];

  const steps = STEP_META.map((step) => {
    const stepIndex = order.indexOf(step.id);
    const currentIndex = order.indexOf(current);
    const status: JourneyStepStatus =
      stepIndex < currentIndex ? "complete" : step.id === current ? "current" : "upcoming";

    return { ...step, status };
  });

  if (!input.isOnboarded) {
    return {
      headline: "Set up your learning profile",
      message: "Tell us your role, goal, and study pace so we can build your personalised roadmap.",
      cta: { href: "/onboarding/step-1?edit=1", label: "Set up profile →" },
      steps,
    };
  }

  if (!input.hasCompletedAssessment) {
    return {
      headline: "Take your diagnostic",
      message: "Your next unlock is the assessment. It powers roadmap quality and pacing.",
      cta: { href: "/assessment", label: "Start assessment" },
      steps,
    };
  }

  if (!input.hasRoadmap) {
    return {
      headline: "Generate your roadmap",
      message: "You are one step away from a full plan tied to your score and goal.",
      cta: { href: "/roadmap/generate", label: "Generate roadmap" },
      steps,
    };
  }

  if (input.completedLessonsCount === 0) {
    return {
      headline: "Start lesson 1",
      message: "Your roadmap is ready. Complete your first lesson to begin streak progress.",
      cta: { href: "/learn", label: "Open lessons" },
      steps,
    };
  }

  return {
    headline: "Keep your momentum",
    message: `You completed ${input.completedLessonsCount} lesson${input.completedLessonsCount === 1 ? "" : "s"}. Continue the plan to level up faster.`,
    cta: { href: "/learn", label: "Continue learning" },
    steps,
  };
}

