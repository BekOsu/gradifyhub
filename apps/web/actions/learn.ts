"use server";

import { and, eq, gt, inArray, isNotNull } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { lesson, lessonProgress, skill, streak } from "@repo/db/schema";
import { getDailyLessonsCompleted } from "@repo/db/queries/lessons";
import { requireAuth } from "~/lib/auth/session";
import { getUserPlan, getDailyLessonLimit } from "~/lib/billing/hasFeature";
import { funnel } from "~/lib/analytics";
import { markRoadmapNodeDoneByLesson } from "~/lib/roadmap/updateNodeProgress";

export async function completeLesson(lessonId: string, quizScore: number) {
  const user = await requireAuth();

  const plan = await getUserPlan(user.id);
  const limit = getDailyLessonLimit(plan);

  if (isFinite(limit)) {
    const completedToday = await getDailyLessonsCompleted(user.id);
    if (completedToday >= limit) {
      throw new Error("daily_limit_reached");
    }
  }

  const safeScore = Math.min(100, Math.max(0, Math.round(quizScore)));

  const completedLesson = await db.query.lesson.findFirst({
    where: eq(lesson.id, lessonId),
    columns: { id: true, skillId: true },
  });
  if (!completedLesson) throw new Error("Lesson not found");

  const existing = await db.query.lessonProgress.findFirst({
    where: and(eq(lessonProgress.userId, user.id), eq(lessonProgress.lessonId, lessonId)),
  });

  if (existing) {
    await db
      .update(lessonProgress)
      .set({ completedAt: new Date(), quizScore: safeScore })
      .where(eq(lessonProgress.id, existing.id));
  } else {
    const newId = crypto.randomUUID();
    await db.insert(lessonProgress).values({
      id: newId,
      userId: user.id,
      lessonId,
      completedAt: new Date(),
      quizScore: safeScore,
    });
    // Double-check limit after insert to close the TOCTOU window
    if (isFinite(limit)) {
      const countAfter = await getDailyLessonsCompleted(user.id);
      if (countAfter > limit) {
        await db.delete(lessonProgress).where(eq(lessonProgress.id, newId));
        throw new Error("daily_limit_reached");
      }
    }
  }

  // Streak update
  const existingStreak = await db.query.streak.findFirst({
    where: eq(streak.userId, user.id),
  });

  if (!existingStreak) {
    await db.insert(streak).values({
      id: crypto.randomUUID(),
      userId: user.id,
      currentStreak: 1,
      longestStreak: 1,
      lastActivityAt: new Date(),
    });
  } else {
    const today = new Date();
    const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    const last = existingStreak.lastActivityAt;

    if (!last) {
      await db
        .update(streak)
        .set({ currentStreak: 1, longestStreak: Math.max(1, existingStreak.longestStreak), lastActivityAt: new Date(), updatedAt: new Date() })
        .where(eq(streak.userId, user.id));
    } else {
      const lastUtc = Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate());
      const diffDays = Math.round((todayUtc - lastUtc) / 86_400_000);

      if (diffDays === 1) {
        const newStreak = existingStreak.currentStreak + 1;
        await db
          .update(streak)
          .set({ currentStreak: newStreak, longestStreak: Math.max(newStreak, existingStreak.longestStreak), lastActivityAt: new Date(), updatedAt: new Date() })
          .where(eq(streak.userId, user.id));
      } else if (diffDays > 1) {
        await db
          .update(streak)
          .set({ currentStreak: 1, lastActivityAt: new Date(), updatedAt: new Date() })
          .where(eq(streak.userId, user.id));
      }
    }
  }

   // Advance skill progress if lesson belongs to a skill
   if (completedLesson.skillId) {
     await advanceSkillProgress(user.id, completedLesson.skillId);
   }

   // Mark roadmap node as done if this lesson maps to one
   await markRoadmapNodeDoneByLesson(user.id, lessonId).catch((err) =>
     console.error("[roadmap] mark node done failed:", err)
   );

   // Track analytics
   funnel.lessonCompleted(user.id, lessonId, safeScore).catch((err) =>
     console.error("[analytics] lesson_completed failed:", err)
   );

   return { success: true };
 }

async function advanceSkillProgress(userId: string, skillId: string) {
  const currentSkill = await db.query.skill.findFirst({
    where: eq(skill.id, skillId),
    columns: { id: true, status: true, order: true, phaseId: true },
  });
  if (!currentSkill) return;

  const skillLessons = await db.query.lesson.findMany({
    where: eq(lesson.skillId, skillId),
    columns: { id: true },
  });
  if (skillLessons.length === 0) return;

  const completed = await db.query.lessonProgress.findMany({
    where: and(
      eq(lessonProgress.userId, userId),
      isNotNull(lessonProgress.completedAt),
      inArray(lessonProgress.lessonId, skillLessons.map((l) => l.id)),
    ),
    columns: { lessonId: true },
  });
  const completedIds = new Set(completed.map((lp) => lp.lessonId));
  const allDone = skillLessons.every((l) => completedIds.has(l.id));

  if (!allDone) {
    if (currentSkill.status === "locked") {
      await db.update(skill).set({ status: "in-progress" }).where(eq(skill.id, skillId));
    }
    return;
  }

  // Mark skill completed
  if (currentSkill.status !== "completed") {
    await db.update(skill).set({ status: "completed" }).where(eq(skill.id, skillId));
  }

  // Unlock the next skill in the same phase
  const nextSkill = await db.query.skill.findFirst({
    where: and(eq(skill.phaseId, currentSkill.phaseId), gt(skill.order, currentSkill.order)),
    orderBy: (s, { asc }) => [asc(s.order)],
    columns: { id: true, status: true },
  });
  if (nextSkill && nextSkill.status === "locked") {
    await db.update(skill).set({ status: "in-progress" }).where(eq(skill.id, nextSkill.id));
  }
}
