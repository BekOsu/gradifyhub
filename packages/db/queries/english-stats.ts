import { db } from "../client";
import {
  englishLearningStats,
  userVocabulary,
  vocabularyItem,
  vocabularyReview,
  shadowingSession,
  speakingSession,
} from "../schema";
import {
  eq,
  and,
  sql,
  desc,
  gte,
  lte,
  count,
  avg,
  gt,
  asc,
} from "drizzle-orm";

export type EnglishStats = {
  wordsLearned: number;
  wordsDue: number;
  currentStreak: number;
  longestStreak: number;
  totalSpeakingSeconds: number;
  shadowingSessionsDone: number;
  speakingSessionsDone: number;
  lastActivityAt: Date | null;
};

export type VocabProgress = {
  total: number;
  solidlyLearned: number;
  due: number;
  byCategory: Record<string, { total: number; learned: number }>;
};

export type WeakVocabItem = {
  userVocabId: string;
  phrase: string;
  meaning: string;
  category: string;
  reps: number;
  state: string;
  stability: number;
  nextReviewAt: Date;
};

/**
 * Fetch English learning stats for a user.
 * Returns all-zero defaults with lastActivityAt: null if no row exists.
 */
export async function getEnglishStats(userId: string): Promise<EnglishStats> {
  const rows = await db
    .select()
    .from(englishLearningStats)
    .where(eq(englishLearningStats.userId, userId));

  const row = rows[0];

  if (!row) {
    return {
      wordsLearned: 0,
      wordsDue: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalSpeakingSeconds: 0,
      shadowingSessionsDone: 0,
      speakingSessionsDone: 0,
      lastActivityAt: null,
    };
  }

  return {
    wordsLearned: row.wordsLearned,
    wordsDue: row.wordsDue,
    currentStreak: row.currentStreak,
    longestStreak: row.longestStreak,
    totalSpeakingSeconds: row.totalSpeakingSeconds,
    shadowingSessionsDone: row.shadowingSessionsDone,
    speakingSessionsDone: row.speakingSessionsDone,
    lastActivityAt: row.lastActivityAt,
  };
}

/**
 * Compute vocabulary progress: total count, solidly learned, due, grouped by category.
 * Solid = state='review' AND reps>=3 AND nextReviewAt > now
 * Due = nextReviewAt <= now
 */
export async function getVocabProgress(
  userId: string
): Promise<VocabProgress> {
  const rows = await db
    .select({
      state: userVocabulary.state,
      reps: userVocabulary.reps,
      nextReviewAt: userVocabulary.nextReviewAt,
      category: vocabularyItem.category,
    })
    .from(userVocabulary)
    .innerJoin(
      vocabularyItem,
      eq(userVocabulary.vocabularyId, vocabularyItem.id)
    )
    .where(eq(userVocabulary.userId, userId));

  const now = new Date();
  let total = 0;
  let solidlyLearned = 0;
  let due = 0;
  const byCategory: Record<string, { total: number; learned: number }> = {};

  for (const r of rows) {
    total += 1;
    const isSolid = r.state === "review" && r.reps >= 3 && r.nextReviewAt > now;
    if (isSolid) solidlyLearned += 1;
    if (r.nextReviewAt <= now) due += 1;
    if (!byCategory[r.category]) {
      byCategory[r.category] = { total: 0, learned: 0 };
    }
    byCategory[r.category]!.total += 1;
    if (isSolid) byCategory[r.category]!.learned += 1;
  }

  return {
    total,
    solidlyLearned,
    due,
    byCategory,
  };
}

/**
 * Fetch vocabulary growth trend over N days.
 * Returns exactly `days` entries with date (YYYY-MM-DD) and count of new items added that day.
 * Missing dates are filled with 0.
 */
export async function getVocabGrowthTrend(
  userId: string,
  days: number
): Promise<Array<{ date: string; newCount: number }>> {
  const cutoff = new Date(Date.now() - days * 86_400_000);

  const rows = await db
    .select({
      date: sql<string>`DATE(${userVocabulary.createdAt} AT TIME ZONE 'UTC')`,
      newCount: sql<number>`COUNT(*)::int`,
    })
    .from(userVocabulary)
    .where(
      and(
        eq(userVocabulary.userId, userId),
        gte(userVocabulary.createdAt, cutoff)
      )
    )
    .groupBy(sql`DATE(${userVocabulary.createdAt} AT TIME ZONE 'UTC')`)
    .orderBy(sql`DATE(${userVocabulary.createdAt} AT TIME ZONE 'UTC')`);

  const countMap = new Map<string, number>();
  for (const r of rows) countMap.set(r.date as string, Number(r.newCount));
  const result: Array<{ date: string; newCount: number }> = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, newCount: countMap.get(key) ?? 0 });
  }

  return result;
}

/**
 * Fetch speaking fluency trend over N days.
 * Returns exactly `days` entries with date (YYYY-MM-DD) and average fluency score (rounded to int).
 * Missing dates are filled with 0.
 */
export async function getSpeakingTrend(
  userId: string,
  days: number
): Promise<Array<{ date: string; avgScore: number }>> {
  const cutoff = new Date(Date.now() - days * 86_400_000);

  const rows = await db
    .select({
      date: sql<string>`DATE(${speakingSession.completedAt} AT TIME ZONE 'UTC')`,
      avgScore: sql<number>`ROUND(AVG(${speakingSession.fluencyScore}))::int`,
    })
    .from(speakingSession)
    .where(
      and(
        eq(speakingSession.userId, userId),
        eq(speakingSession.status, "done"),
        gte(speakingSession.completedAt, cutoff)
      )
    )
    .groupBy(sql`DATE(${speakingSession.completedAt} AT TIME ZONE 'UTC')`)
    .orderBy(sql`DATE(${speakingSession.completedAt} AT TIME ZONE 'UTC')`);

  const scoreMap = new Map<string, number>();
  for (const r of rows) scoreMap.set(r.date as string, Number(r.avgScore));
  const result: Array<{ date: string; avgScore: number }> = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, avgScore: scoreMap.get(key) ?? 0 });
  }

  return result;
}

/**
 * Fetch weekly activity (last 7 days).
 * Returns exactly 7 entries with date (YYYY-MM-DD) and total activity count per day.
 * Activity = vocab reviews + shadowing sessions + speaking sessions.
 */
export async function getWeeklyActivity(
  userId: string
): Promise<Array<{ date: string; count: number }>> {
  const cutoff7 = new Date(Date.now() - 7 * 86_400_000);

  // Query 1: vocabulary reviews
  const vocabReviews = await db
    .select({
      date: sql<string>`DATE(${vocabularyReview.createdAt} AT TIME ZONE 'UTC')`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(vocabularyReview)
    .where(
      and(
        eq(vocabularyReview.userId, userId),
        gte(vocabularyReview.createdAt, cutoff7)
      )
    )
    .groupBy(sql`DATE(${vocabularyReview.createdAt} AT TIME ZONE 'UTC')`);

  // Query 2: shadowing sessions
  const shadowing = await db
    .select({
      date: sql<string>`DATE(${shadowingSession.createdAt} AT TIME ZONE 'UTC')`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(shadowingSession)
    .where(
      and(
        eq(shadowingSession.userId, userId),
        eq(shadowingSession.status, "done"),
        gte(shadowingSession.createdAt, cutoff7)
      )
    )
    .groupBy(sql`DATE(${shadowingSession.createdAt} AT TIME ZONE 'UTC')`);

  // Query 3: speaking sessions
  const speaking = await db
    .select({
      date: sql<string>`DATE(${speakingSession.completedAt} AT TIME ZONE 'UTC')`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(speakingSession)
    .where(
      and(
        eq(speakingSession.userId, userId),
        eq(speakingSession.status, "done"),
        gte(speakingSession.completedAt, cutoff7)
      )
    )
    .groupBy(sql`DATE(${speakingSession.completedAt} AT TIME ZONE 'UTC')`);

  // Merge all counts by date
  const countByDate = new Map<string, number>();

  for (const r of vocabReviews) {
    const d = r.date as string;
    countByDate.set(d, (countByDate.get(d) ?? 0) + Number(r.count));
  }
  for (const r of shadowing) {
    const d = r.date as string;
    countByDate.set(d, (countByDate.get(d) ?? 0) + Number(r.count));
  }
  for (const r of speaking) {
    const d = r.date as string;
    countByDate.set(d, (countByDate.get(d) ?? 0) + Number(r.count));
  }

  // Build 7-day result array
  const result: Array<{ date: string; count: number }> = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, count: countByDate.get(key) ?? 0 });
  }

  return result;
}

/**
 * Fetch vocabulary items with lowest stability (most forgettable).
 * Only returns items with reps > 0.
 * Ordered by stability ASC (lowest first).
 */
export async function getWeakVocab(
  userId: string,
  limit: number
): Promise<WeakVocabItem[]> {
  const rows = await db
    .select({
      userVocabId: userVocabulary.id,
      phrase: vocabularyItem.phrase,
      meaning: vocabularyItem.meaning,
      category: vocabularyItem.category,
      reps: userVocabulary.reps,
      state: userVocabulary.state,
      stability: userVocabulary.stability,
      nextReviewAt: userVocabulary.nextReviewAt,
    })
    .from(userVocabulary)
    .innerJoin(
      vocabularyItem,
      eq(userVocabulary.vocabularyId, vocabularyItem.id)
    )
    .where(
      and(eq(userVocabulary.userId, userId), gt(userVocabulary.reps, 0))
    )
    .orderBy(asc(userVocabulary.stability))
    .limit(limit);

  const out: WeakVocabItem[] = [];
  for (const r of rows) {
    out.push({
      userVocabId: r.userVocabId as string,
      phrase: r.phrase as string,
      meaning: r.meaning as string,
      category: r.category as string,
      reps: r.reps as number,
      state: r.state as string,
      stability: parseFloat(r.stability as unknown as string),
      nextReviewAt: r.nextReviewAt as Date,
    });
  }
  return out;
}

/**
 * Fetch total speaking minutes (sum of all completed speaking sessions in the last 7 days).
 * Returns rounded minutes.
 */
export async function getWeeklySpeakingMinutes(userId: string): Promise<number> {
  const cutoff7 = new Date(Date.now() - 7 * 86_400_000);

  const result = await db
    .select({
      totalSeconds: sql<number>`COALESCE(SUM(${speakingSession.durationSeconds}), 0)::int`,
    })
    .from(speakingSession)
    .where(
      and(
        eq(speakingSession.userId, userId),
        eq(speakingSession.status, "done"),
        gte(speakingSession.completedAt, cutoff7)
      )
    );

  const totalSeconds = result[0]?.totalSeconds ?? 0;
  return Math.round(totalSeconds / 60);
}
