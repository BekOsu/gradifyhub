import { db } from "@repo/db/client";
import { profile, type AiCalibration } from "@repo/db/schema";
import { eq } from "@repo/db/drizzle";

export type FoundationData = {
  checkScore?: number; // 0-5 points from foundation-check
  checkAnswers?: Record<string, string>; // Answers to 5 questions
  checkCompletedAt?: string; // ISO timestamp
  pathCompletedAt?: string; // ISO timestamp (when foundation-path completed)
};

/**
 * Save foundation-check results to profile.
 * Extends aiCalibration JSONB with foundation data (MVP workaround).
 */
export async function saveFoundationCheckResults(
  userId: string,
  answers: Record<string, string>,
  score: number
) {
  return db.transaction(async (tx) => {
    const userProfile = await tx.query.profile.findFirst({
      where: eq(profile.userId, userId),
    });

    if (!userProfile) {
      throw new Error("User profile not found");
    }

    // Get existing aiCalibration within transaction
    const aiCalib = (userProfile.aiCalibration as Record<string, unknown>) || {};

    // Extend with foundation data
    const updated = {
      ...aiCalib,
      foundationCheckScore: score,
      foundationCheckAnswers: answers,
      foundationCheckCompletedAt: new Date().toISOString(),
    };

    // Update profile
    await tx
      .update(profile)
      .set({ aiCalibration: updated as unknown as AiCalibration})
      .where(eq(profile.userId, userId));

    return { success: true, score };
  });
}

/**
 * Save foundation-path completion to profile.
 */
export async function saveFoundationPathCompletion(userId: string) {
  return db.transaction(async (tx) => {
    const userProfile = await tx.query.profile.findFirst({
      where: eq(profile.userId, userId),
    });

    if (!userProfile) {
      throw new Error("User profile not found");
    }

    const aiCalib = (userProfile.aiCalibration as Record<string, unknown>) || {};
    const updated = {
      ...aiCalib,
      foundationPathCompletedAt: new Date().toISOString(),
    };

    await tx
      .update(profile)
      .set({ aiCalibration: updated as unknown as AiCalibration})
      .where(eq(profile.userId, userId));

    return { success: true };
  });
}

/**
 * Get foundation data for a user.
 */
export async function getFoundationData(
  userId: string
): Promise<FoundationData | null> {
  const userProfile = await db.query.profile.findFirst({
    where: eq(profile.userId, userId),
  });

  if (!userProfile?.aiCalibration) return null;

  const aiCalib = userProfile.aiCalibration as Record<string, unknown>;

  return {
    checkScore: aiCalib.foundationCheckScore as number | undefined,
    checkAnswers: aiCalib.foundationCheckAnswers as Record<string, string> | undefined,
    checkCompletedAt: aiCalib.foundationCheckCompletedAt as string | undefined,
    pathCompletedAt: aiCalib.foundationPathCompletedAt as string | undefined,
  };
}

// ── Soft Skills foundation track ──────────────────────────────────────────

export async function saveFoundationCheckResultsSS(
  userId: string,
  answers: Record<string, string>,
  score: number,
) {
  return db.transaction(async (tx) => {
    const userProfile = await tx.query.profile.findFirst({
      where: eq(profile.userId, userId),
    });
    if (!userProfile) throw new Error("User profile not found");

    const aiCalib = (userProfile.aiCalibration as Record<string, unknown>) || {};
    const updated = {
      ...aiCalib,
      ssFoundationCheckScore: score,
      ssFoundationCheckAnswers: answers,
      ssFoundationCheckCompletedAt: new Date().toISOString(),
    };

    await tx.update(profile).set({ aiCalibration: updated as unknown as AiCalibration}).where(eq(profile.userId, userId));
    return { success: true, score };
  });
}

export async function saveFoundationPathCompletionSS(userId: string) {
  return db.transaction(async (tx) => {
    const userProfile = await tx.query.profile.findFirst({
      where: eq(profile.userId, userId),
    });
    if (!userProfile) throw new Error("User profile not found");

    const aiCalib = (userProfile.aiCalibration as Record<string, unknown>) || {};
    const updated = { ...aiCalib, ssFoundationPathCompletedAt: new Date().toISOString() };

    await tx.update(profile).set({ aiCalibration: updated as unknown as AiCalibration}).where(eq(profile.userId, userId));
    return { success: true };
  });
}

// ── English Proficiency foundation track ──────────────────────────────────

export async function saveFoundationCheckResultsEng(
  userId: string,
  answers: Record<string, string>,
  score: number,
) {
  return db.transaction(async (tx) => {
    const userProfile = await tx.query.profile.findFirst({
      where: eq(profile.userId, userId),
    });
    if (!userProfile) throw new Error("User profile not found");

    const aiCalib = (userProfile.aiCalibration as Record<string, unknown>) || {};
    const updated = {
      ...aiCalib,
      engFoundationCheckScore: score,
      engFoundationCheckAnswers: answers,
      engFoundationCheckCompletedAt: new Date().toISOString(),
    };

    await tx.update(profile).set({ aiCalibration: updated as unknown as AiCalibration}).where(eq(profile.userId, userId));
    return { success: true, score };
  });
}

export async function saveFoundationPathCompletionEng(userId: string) {
  return db.transaction(async (tx) => {
    const userProfile = await tx.query.profile.findFirst({
      where: eq(profile.userId, userId),
    });
    if (!userProfile) throw new Error("User profile not found");

    const aiCalib = (userProfile.aiCalibration as Record<string, unknown>) || {};
    const updated = { ...aiCalib, engFoundationPathCompletedAt: new Date().toISOString() };

    await tx.update(profile).set({ aiCalibration: updated as unknown as AiCalibration}).where(eq(profile.userId, userId));
    return { success: true };
  });
}
