import { db } from "@repo/db/client";
import { subscription } from "@repo/db/schema";
import { eq } from "@repo/db/drizzle";

type Feature =
  | "ai_roadmap"
  | "lesson_catalog"
  | "resume_builder"
  | "streak_freeze"
  | "gig_match"
  | "company_intel"
  | "voice_interview"
  | "roadmap_regeneration"
  | "mock_interview"
  | "openrouter_managed" // platform manages OpenRouter key (pro/career only)
  | "english_vocab"    // vocab vault (free: 50 items, pro: unlimited)
  | "english_shadow"   // shadowing sessions (free: 10/month, pro: unlimited)
  | "english_mining"   // vocab mining from YouTube (pro only)
  | "english_speak"    // speaking partner text mode (pro only)
  | "english_voice";   // speaking partner voice mode (pro only)

// Features fully locked by plan
const PLAN_FEATURES: Record<string, Feature[]> = {
  free: [
    "lesson_catalog",
    "resume_builder",
    "english_vocab",
    "english_shadow",
  ],
  pro: [
    "lesson_catalog",
    "ai_roadmap",
    "resume_builder",
    "gig_match",
    "streak_freeze",
    "roadmap_regeneration",
    "mock_interview",
    "openrouter_managed",
    "english_vocab",
    "english_shadow",
    "english_mining",
    "english_speak",
    "english_voice",
  ],
  career: [
    "lesson_catalog",
    "ai_roadmap",
    "resume_builder",
    "gig_match",
    "streak_freeze",
    "roadmap_regeneration",
    "mock_interview",
    "company_intel",
    "voice_interview",
    "openrouter_managed",
    "english_vocab",
    "english_shadow",
    "english_mining",
    "english_speak",
    "english_voice",
  ],
};

// Usage limits per period (null = unlimited)
export const USAGE_LIMITS = {
  dailyLessons: { free: 5, pro: null, career: null },
  monthlyAssessments: { free: 15, pro: null, career: null },
  monthlyMockInterviews: { free: 1, pro: 8, career: null },
  weeklyRetakes: { free: 1, pro: null, career: null },
  vocabItemsMax: { free: 50, pro: null, career: null },
  monthlyShadowingSessions: { free: 10, pro: null, career: null },
} as const;

export async function getUserPlan(userId: string): Promise<"free" | "pro"> {
  const row = await db.query.subscription.findFirst({
    where: eq(subscription.userId, userId),
    columns: { plan: true },
  });
  const plan = row?.plan;
  return plan === "pro" ? "pro" : "free";
}

export async function hasFeature(userId: string, feature: Feature): Promise<boolean> {
  const plan = await getUserPlan(userId);
  const features = PLAN_FEATURES[plan] ?? PLAN_FEATURES.free ?? [];
  return features.includes(feature);
}

export function getDailyLessonLimit(plan: string): number {
  return USAGE_LIMITS.dailyLessons[plan as keyof typeof USAGE_LIMITS.dailyLessons] ?? 5;
}

export function getMonthlyAssessmentLimit(plan: string): number | null {
  return USAGE_LIMITS.monthlyAssessments[plan as keyof typeof USAGE_LIMITS.monthlyAssessments] ?? 1;
}

export function getMonthlyMockInterviewLimit(plan: string): number | null {
  return USAGE_LIMITS.monthlyMockInterviews[plan as keyof typeof USAGE_LIMITS.monthlyMockInterviews] ?? 1;
}

export function getWeeklyRetakeLimit(plan: string): number | null {
  return USAGE_LIMITS.weeklyRetakes[plan as keyof typeof USAGE_LIMITS.weeklyRetakes] ?? 1;
}

export function getVocabItemsLimit(plan: string): number | null {
  return USAGE_LIMITS.vocabItemsMax[plan as keyof typeof USAGE_LIMITS.vocabItemsMax] ?? 50;
}

export function getMonthlyShadowingLimit(plan: string): number | null {
  return USAGE_LIMITS.monthlyShadowingSessions[plan as keyof typeof USAGE_LIMITS.monthlyShadowingSessions] ?? 10;
}
