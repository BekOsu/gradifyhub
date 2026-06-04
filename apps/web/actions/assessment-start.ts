"use server";

import { and, eq, isNotNull, isNull, gte } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { attempt, profile, response } from "@repo/db/schema";
import { redirect } from "next/navigation";
import { requireAuth } from "~/lib/auth/session";
import { MOCK_ITEM_IDS } from "~/lib/assessment/mock";
import { isAttemptStale } from "~/lib/assessment/staleness";
import { sidecarStartAttempt } from "~/lib/assessment/sidecar";
import { getUserPlan, getMonthlyAssessmentLimit, getWeeklyRetakeLimit } from "~/lib/billing/hasFeature";
import {
  SOFT_SKILLS_TRACK_GOAL,
  ENGLISH_PROFICIENCY_TRACK_GOAL,
} from "~/lib/journey/engineering-knowledge";
import { loadRealItemSequence } from "~/lib/assessment/load-items";

const USE_MOCK = process.env.ASSESSMENT_MODE !== "real";
const REAL_TOTAL = Number(process.env.ASSESSMENT_QUESTION_LIMIT ?? 15);

export async function startAttempt() {
  const user = await requireAuth();

  const [userProfile, existing, plan] = await Promise.all([
    db.query.profile.findFirst({ where: eq(profile.userId, user.id) }),
    db.query.attempt.findFirst({
      where: and(eq(attempt.userId, user.id), isNull(attempt.completedAt)),
      orderBy: (a, { desc }) => [desc(a.startedAt)],
    }),
    getUserPlan(user.id),
  ]);

  // Enforce monthly assessment limit for free-tier users
  const monthlyLimit = getMonthlyAssessmentLimit(plan);
  if (monthlyLimit !== null) {
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    const completedThisMonth = await db.query.attempt.findMany({
      where: and(
        eq(attempt.userId, user.id),
        isNotNull(attempt.completedAt),
        gte(attempt.completedAt, startOfMonth),
      ),
      columns: { id: true },
    });

    if (completedThisMonth.length >= monthlyLimit) {
      throw new Error("monthly_assessment_limit_reached");
    }
  }

  if (existing && !isAttemptStale(userProfile?.updatedAt, existing.startedAt)) {
    const responses = await db.query.response.findMany({
      where: eq(response.attemptId, existing.id),
    });
    const itemSeq = Array.isArray(existing.itemSequence) ? (existing.itemSequence as string[]) : [];

    if (itemSeq.length > 0 && responses.length >= itemSeq.length) {
      // All questions have responses but completedAt was never written (e.g. tab closed on final submit).
      // Silently complete the old attempt so results are preserved in history, then fall through
      // to create a fresh attempt — user clicked Start so they should land on question 1.
      await db
        .update(attempt)
        .set({ completedAt: new Date(), status: "completed" })
        .where(eq(attempt.id, existing.id));
      // Don't return here — fall through to create a new attempt
    } else {
      // Partial attempt — resume it
      return { attemptId: existing.id, currentIndex: responses.length };
    }
  } else if (existing) {
    // Stale existing attempt — delete it before creating fresh
    await db.delete(attempt).where(eq(attempt.id, existing.id));
  }

  const id = crypto.randomUUID();
  const itemSequence = USE_MOCK
    ? MOCK_ITEM_IDS
    : await loadRealItemSequence(REAL_TOTAL, userProfile?.goal, userProfile?.aiCalibration);

  await db.insert(attempt).values({
    id,
    userId: user.id,
    itemSequence,
  });

  if (!USE_MOCK && process.env.ML_SIDECAR_URL) {
    try {
      await sidecarStartAttempt({
        attemptId: id,
        userId: user.id,
        totalQuestions: REAL_TOTAL,
        itemSequence,
      });
    } catch (error) {
      console.error("[assessment] sidecar start failed (non-fatal):", error);
    }
  }

  return { attemptId: id, currentIndex: 0 };
}

export async function startAttemptAndRedirect() {
  const { attemptId, currentIndex } = await startAttempt();
  redirect(`/assessment/q/${currentIndex + 1}?attempt=${attemptId}`);
}

// Abandon any in-progress attempt and start completely fresh from question 1.
export async function startFreshAttempt(): Promise<{ attemptId: string; currentIndex: number }> {
  const user = await requireAuth();

  const [userProfile, existing] = await Promise.all([
    db.query.profile.findFirst({ where: eq(profile.userId, user.id) }),
    db.query.attempt.findFirst({
      where: and(eq(attempt.userId, user.id), isNull(attempt.completedAt)),
      orderBy: (a, { desc }) => [desc(a.startedAt)],
    }),
  ]);

  if (existing) {
    await db
      .update(attempt)
      .set({ status: "abandoned", completedAt: new Date() })
      .where(eq(attempt.id, existing.id));
  }

  const id = crypto.randomUUID();
  const itemSequence = USE_MOCK
    ? MOCK_ITEM_IDS
    : await loadRealItemSequence(REAL_TOTAL, userProfile?.goal, userProfile?.aiCalibration);

  await db.insert(attempt).values({ id, userId: user.id, itemSequence });

  if (!USE_MOCK && process.env.ML_SIDECAR_URL) {
    try {
      await sidecarStartAttempt({
        attemptId: id,
        userId: user.id,
        totalQuestions: REAL_TOTAL,
        itemSequence,
      });
    } catch (error) {
      console.error("[assessment] sidecar start failed (non-fatal):", error);
    }
  }

  return { attemptId: id, currentIndex: 0 };
}

// Start a fresh Assessment attempt using an explicit goal override rather than userProfile.goal.
// Used by the SS and English foundation-path-complete routes so the correct item bank is loaded
// regardless of the user's primary technical goal.
export async function startFreshAttemptForTrack(
  goalOverride: typeof SOFT_SKILLS_TRACK_GOAL | typeof ENGLISH_PROFICIENCY_TRACK_GOAL,
): Promise<{ attemptId: string; currentIndex: number }> {
  const user = await requireAuth();

  const [userProfile, existing, plan] = await Promise.all([
    db.query.profile.findFirst({ where: eq(profile.userId, user.id) }),
    db.query.attempt.findFirst({
      where: and(eq(attempt.userId, user.id), isNull(attempt.completedAt)),
      orderBy: (a, { desc }) => [desc(a.startedAt)],
    }),
    getUserPlan(user.id),
  ]);

  // Enforce monthly assessment limit (same as startAttempt)
  const monthlyLimit = getMonthlyAssessmentLimit(plan);
  if (monthlyLimit !== null) {
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);
    const completedThisMonth = await db.query.attempt.findMany({
      where: and(
        eq(attempt.userId, user.id),
        isNotNull(attempt.completedAt),
        gte(attempt.completedAt, startOfMonth),
      ),
      columns: { id: true },
    });
    if (completedThisMonth.length >= monthlyLimit) {
      throw new Error("monthly_assessment_limit_reached");
    }
  }

  if (existing) {
    await db
      .update(attempt)
      .set({ status: "abandoned", completedAt: new Date() })
      .where(eq(attempt.id, existing.id));
  }

  const id = crypto.randomUUID();
  const itemSequence = USE_MOCK
    ? MOCK_ITEM_IDS
    : await loadRealItemSequence(REAL_TOTAL, goalOverride, userProfile?.aiCalibration);

  await db.insert(attempt).values({ id, userId: user.id, itemSequence });

  if (!USE_MOCK && process.env.ML_SIDECAR_URL) {
    try {
      await sidecarStartAttempt({
        attemptId: id,
        userId: user.id,
        totalQuestions: REAL_TOTAL,
        itemSequence,
      });
    } catch (error) {
      console.error("[assessment] sidecar start failed (non-fatal):", error);
    }
  }

  return { attemptId: id, currentIndex: 0 };
}

export async function startRetakeAttempt() {
  const user = await requireAuth();
  const plan = await getUserPlan(user.id);

  // Check weekly retake limit for free-tier users
  const weeklyLimit = getWeeklyRetakeLimit(plan);
  if (weeklyLimit !== null) {
    // Calculate start of current week (Monday 00:00 UTC)
    const startOfWeek = new Date();
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - startOfWeek.getUTCDay());
    startOfWeek.setUTCHours(0, 0, 0, 0);

    const completedThisWeek = await db.query.attempt.findMany({
      where: and(
        eq(attempt.userId, user.id),
        isNotNull(attempt.completedAt),
        gte(attempt.completedAt, startOfWeek),
      ),
      columns: { id: true },
    });

    if (completedThisWeek.length >= weeklyLimit) {
      throw new Error("weekly_retake_limit_reached");
    }
  }

  const userProfile = await db.query.profile.findFirst({ where: eq(profile.userId, user.id) });

  const id = crypto.randomUUID();
  const itemSequence = USE_MOCK
    ? MOCK_ITEM_IDS
    : await loadRealItemSequence(REAL_TOTAL, userProfile?.goal, userProfile?.aiCalibration);

  await db.insert(attempt).values({
    id,
    userId: user.id,
    itemSequence,
  });

  if (!USE_MOCK && process.env.ML_SIDECAR_URL) {
    try {
      await sidecarStartAttempt({
        attemptId: id,
        userId: user.id,
        totalQuestions: REAL_TOTAL,
        itemSequence,
      });
    } catch (error) {
      console.error("[assessment] sidecar start failed (non-fatal):", error);
    }
  }

  return { attemptId: id, currentIndex: 0 };
}
