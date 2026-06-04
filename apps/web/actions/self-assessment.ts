"use server";

import { eq } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { profile } from "@repo/db/schema";
import { SubmitSelfAssessmentInput } from "@repo/contracts/self-assessment";
import { requireAuth } from "~/lib/auth/session";
import { scoreLevelAnswers, computeEarnedLevel } from "~/lib/journey/self-assessment-questions";

export async function submitSelfAssessment(input: unknown): Promise<{
  success: boolean;
  earnedLevels?: Record<string, number>;
  error?: string;
}> {
  const user = await requireAuth();
  const parsed = SubmitSelfAssessmentInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const userProfile = await db.query.profile.findFirst({
    where: eq(profile.userId, user.id),
  });
  if (!userProfile) {
    return { success: false, error: "Profile not found. Complete onboarding first." };
  }

  const existingLevels: Record<string, number> = (userProfile.earnedLevels as Record<string, number> | null) ?? {};

  const updates: Record<string, number> = {};
  for (const dim of parsed.data.dimensions) {
    const scores: [number, number, number, number] = [
      scoreLevelAnswers(dim.l1),
      scoreLevelAnswers(dim.l2),
      scoreLevelAnswers(dim.l3),
      scoreLevelAnswers(dim.l4),
    ];
    updates[dim.dimension] = computeEarnedLevel(scores);
  }

  const earnedLevels = { ...existingLevels, ...updates };

  await db
    .update(profile)
    .set({ earnedLevels, updatedAt: new Date() })
    .where(eq(profile.userId, user.id));

  return { success: true, earnedLevels };
}
