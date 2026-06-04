"use server";

import { cookies } from "next/headers";
import { and, eq, isNotNull, count } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { attempt, profile, roadmap, coupon, user } from "@repo/db/schema";
import { ProfileStep1Input, ProfileStep2Input } from "@repo/contracts/profile";
import { requireAuth } from "~/lib/auth/session";
import { sendWelcomeEmail, sendWelcomeDiscountEmail } from "~/lib/email/resend";
import { needsAssessmentRefresh } from "~/lib/assessment/staleness";
import { needsRoadmapRefresh } from "~/lib/roadmap/staleness";
import { funnel } from "~/lib/analytics";
import { redirect } from "next/navigation";

export async function saveOnboardingStep1(input: unknown) {
  const user = await requireAuth();
  const parsed = ProfileStep1Input.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const { currentRole, yearsOfExperience, targetTimeline, hoursPerDay, daysPerWeek } = parsed.data;
  const existing = await db.query.profile.findFirst({
    where: eq(profile.userId, user.id),
  });
  const roadmapInputsChanged =
    !existing ||
    existing.targetTimeline !== targetTimeline ||
    existing.hoursPerDay !== hoursPerDay ||
    existing.daysPerWeek !== daysPerWeek;
  const updatedAt = roadmapInputsChanged ? new Date() : (existing?.updatedAt ?? new Date());

  await db
    .insert(profile)
    .values({
      id: crypto.randomUUID(),
      userId: user.id,
      currentRole,
      yearsOfExperience,
      targetTimeline,
      hoursPerDay,
      daysPerWeek,
      updatedAt,
    })
    .onConflictDoUpdate({
      target: profile.userId,
      set: { currentRole, yearsOfExperience, targetTimeline, hoursPerDay, daysPerWeek, updatedAt },
    });

  return { success: true };
}

export async function saveOnboardingStep2(input: unknown) {
  const user = await requireAuth();
  const parsed = ProfileStep2Input.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const existing = await db.query.profile.findFirst({
    where: eq(profile.userId, user.id),
  });
  const goalChanged = !existing || existing.goal !== parsed.data.goal;
  const updatedAt = goalChanged ? new Date() : (existing?.updatedAt ?? new Date());

  // Merge new fields into existing calibration so extra fields (outcome, ssFoundationCheckScore, etc.) survive
  const existingCalib = (existing?.aiCalibration ?? {}) as Record<string, unknown>;
  const aiCalibrationToSet = parsed.data.aiCalibration
    ? { ...existingCalib, ...parsed.data.aiCalibration }
    : existing?.aiCalibration ?? null;

  await db
    .insert(profile)
    .values({
      id: crypto.randomUUID(),
      userId: user.id,
      goal: parsed.data.goal,
      knownStack: parsed.data.knownStack ?? null,
      aiCalibration: aiCalibrationToSet,
      updatedAt,
    })
    .onConflictDoUpdate({
      target: profile.userId,
      set: {
        goal: parsed.data.goal,
        knownStack: parsed.data.knownStack ?? null,
        aiCalibration: aiCalibrationToSet,
        updatedAt,
      },
    });

  return { success: true };
}

export async function completeOnboarding() {
  const user = await requireAuth();

  const [existing, existingRoadmap, latestCompletedAttempt] = await Promise.all([
    db.query.profile.findFirst({
      where: eq(profile.userId, user.id),
    }),
    db.query.roadmap.findFirst({
      where: eq(roadmap.userId, user.id),
    }),
    db.query.attempt.findFirst({
      where: and(eq(attempt.userId, user.id), isNotNull(attempt.completedAt)),
      orderBy: (a, { desc }) => [desc(a.completedAt)],
    }),
  ]);

  if (!existing?.currentRole || !existing?.goal) {
    // Interview-prep users set onboardedAt directly in startInterviewPrep without a goal.
    // Treat them as complete if onboardedAt is already set.
    if (existing?.onboardedAt) {
      const cookieStore = await cookies();
      cookieStore.set("onboarded", "1", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
      });
      return { success: true, assessmentNeedsRefresh: false, roadmapNeedsRefresh: false };
    }
    return { success: false, error: "Complete all onboarding steps first." };
  }

  if (!existing.onboardedAt) {
    await db
      .insert(profile)
      .values({ id: crypto.randomUUID(), userId: user.id, onboardedAt: new Date() })
      .onConflictDoUpdate({
        target: profile.userId,
        set: { onboardedAt: new Date() },
      });
  }

   const cookieStore = await cookies();
   cookieStore.set("onboarded", "1", {
     path: "/",
     httpOnly: true,
     sameSite: "lax",
     maxAge: 60 * 60 * 24 * 365,
   });

    if (!existing.onboardedAt) {
      // Check for early-access coupon campaign
      const EARLY_ACCESS_COUPON = process.env.EARLY_ACCESS_COUPON;
      const EARLY_ACCESS_CAP = Number(process.env.EARLY_ACCESS_CAP ?? "50");

      if (EARLY_ACCESS_COUPON) {
        // Count users who have completed onboarding
        const [countResult] = await db
          .select({ count: count() })
          .from(profile)
          .where(isNotNull(profile.onboardedAt));

        const onboardedCount = countResult?.count ?? 0;

        // If within cap, look up the coupon and send welcome discount email
        if (onboardedCount < EARLY_ACCESS_CAP) {
          const couponRow = await db.query.coupon.findFirst({
            where: eq(coupon.code, EARLY_ACCESS_COUPON),
          });

          if (couponRow) {
            sendWelcomeDiscountEmail({
              to: user.email,
              name: user.name,
              couponCode: EARLY_ACCESS_COUPON,
              discountPct: couponRow.discountPct,
            }).catch((err) => console.error("[email] welcome discount failed:", err));
          } else {
            // Coupon configured but not found — fall back to welcome email
            sendWelcomeEmail({ to: user.email, name: user.name }).catch((err) =>
              console.error("[email] welcome failed:", err)
            );
          }
        } else {
          // Cap reached — send standard welcome email
          sendWelcomeEmail({ to: user.email, name: user.name }).catch((err) =>
            console.error("[email] welcome failed:", err)
          );
        }
      } else {
        // No early-access campaign — send standard welcome email
        sendWelcomeEmail({ to: user.email, name: user.name }).catch((err) =>
          console.error("[email] welcome failed:", err)
        );
      }

      // Track analytics
      funnel.onboardingCompleted(user.id, existing.id).catch((err) =>
        console.error("[analytics] onboarding_completed failed:", err)
      );
    }

   const assessmentNeedsRefresh =
     !latestCompletedAttempt ||
     needsAssessmentRefresh(existing.updatedAt, latestCompletedAttempt.completedAt);

   return {
     success: true,
     assessmentNeedsRefresh,
     roadmapNeedsRefresh:
       !assessmentNeedsRefresh &&
       needsRoadmapRefresh(
         existing.updatedAt,
         existingRoadmap?.updatedAt,
         latestCompletedAttempt?.completedAt,
       ),
   };
 }

export async function deleteMyAccount(): Promise<{ error?: string }> {
  const currentUser = await requireAuth();

  await db.delete(user).where(eq(user.id, currentUser.id));

  redirect("/sign-in");
}
