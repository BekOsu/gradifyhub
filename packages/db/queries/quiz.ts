import { and, eq, sql } from "drizzle-orm";
import { db } from "../client";
import { quizUsage, quizSubmission } from "../schema";

export interface QuizSubmissionRecord {
  id: string;
  userId: string;
  lessonId: string;
  answers: Record<string, string>;
  score: number;
  maxScore: number;
  submittedAt: Date;
}

// Get quiz usage count for today (UTC)
export async function getQuizUsageToday(userId: string): Promise<number> {
  const today = new Date().toISOString().split("T")[0];

  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(quizUsage)
    .where(
      and(
        eq(quizUsage.userId, userId),
        sql`DATE(${quizUsage.createdAt}) = ${today}`,
      ),
    );

  return result[0]?.count ?? 0;
}

// Log quiz generation (fire-and-forget)
export async function logQuizGeneration(
  userId: string,
  topic: string,
): Promise<void> {
  db.insert(quizUsage)
    .values({
      id: crypto.randomUUID(),
      userId,
      topic,
      createdAt: new Date(),
    })
    .catch((err: unknown) =>
      console.error("[quiz] usage log failed:", err),
    );
}

// Submit quiz answers
export async function submitQuiz(
  userId: string,
  lessonId: string,
  answers: Record<string, string>,
  score: number,
): Promise<string> {
  const id = crypto.randomUUID();

  await db.insert(quizSubmission).values({
    id,
    userId,
    lessonId,
    answers,
    score,
    maxScore: 100,
    submittedAt: new Date(),
  });

  return id;
}

// Get all quiz submissions for a user + lesson
export async function getUserQuizAttempts(
  userId: string,
  lessonId: string,
): Promise<QuizSubmissionRecord[]> {
  const records = await db.query.quizSubmission.findMany({
    where: and(eq(quizSubmission.userId, userId), eq(quizSubmission.lessonId, lessonId)),
    orderBy: (qs, { desc }) => [desc(qs.submittedAt)],
  });

  return records as QuizSubmissionRecord[];
}
