import { and, asc, eq, gte, inArray, isNotNull } from "drizzle-orm";
import { db } from "../client";
import { lesson, lessonProgress, quiz } from "../schema";

export async function getLessons() {
  return db.query.lesson.findMany({
    orderBy: (l, { asc }) => [asc(l.order)],
  });
}

export async function getLessonsByDimensions(dimKeys: string[]) {
  if (dimKeys.length === 0) return getLessons();
  return db.query.lesson.findMany({
    where: inArray(lesson.dimension, dimKeys),
    orderBy: (l, { asc }) => [asc(l.order)],
  });
}

export async function getLesson(slug: string) {
  const row = await db.query.lesson.findFirst({
    where: eq(lesson.slug, slug),
  });
  if (!row) return undefined;
  const quizzes = await db.query.quiz.findMany({
    where: eq(quiz.lessonId, row.id),
    orderBy: [asc(quiz.order)],
  });
  return { ...row, quizzes };
}

export async function getLessonsBySkill(skillId: string) {
  return db.query.lesson.findMany({
    where: eq(lesson.skillId, skillId),
    orderBy: (l, { asc }) => [asc(l.order)],
  });
}

export async function getLessonsForSkills(skillIds: string[]) {
  if (skillIds.length === 0) return [];
  return db.query.lesson.findMany({
    where: inArray(lesson.skillId, skillIds),
    orderBy: (l, { asc }) => [asc(l.order)],
  });
}

export async function getUserLessonProgress(userId: string) {
  return db.query.lessonProgress.findMany({
    where: eq(lessonProgress.userId, userId),
  });
}

export async function getDailyLessonsCompleted(userId: string): Promise<number> {
  const todayUtc = new Date();
  todayUtc.setUTCHours(0, 0, 0, 0);

  const rows = await db.query.lessonProgress.findMany({
    where: and(
      eq(lessonProgress.userId, userId),
      isNotNull(lessonProgress.completedAt),
      gte(lessonProgress.completedAt, todayUtc),
    ),
    columns: { id: true },
  });
  return rows.length;
}
