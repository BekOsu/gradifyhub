import { db } from "@repo/db/client";
import * as schema from "@repo/db/schema";
import { eq, and, lte, gt, sql } from "@repo/db/drizzle";

/**
 * Refresh English learning stats for a user.
 * Computes:
 * - wordsLearned: vocabulary items in 'review' state with reps >= 3 and nextReviewAt > now
 * - wordsDue: vocabulary items with nextReviewAt <= now
 * - currentStreak: consecutive days of activity (resets if more than 1 day gap)
 * - longestStreak: historical longest streak
 * - Updates lastActivityAt to now
 *
 * Upserts the englishLearningStats row for the user.
 */
export async function refreshStats(userId: string): Promise<void> {
  // Count words learned: state='review' AND reps>=3 AND nextReviewAt > now
  const learnedResult = await db
    .select({
      learnedCount: sql<number>`COUNT(*)::int`,
    })
    .from(schema.userVocabulary)
    .where(
      and(
        eq(schema.userVocabulary.userId, userId),
        eq(schema.userVocabulary.state, "review"),
        gt(schema.userVocabulary.reps, 2),
        gt(schema.userVocabulary.nextReviewAt, new Date())
      )
    );

  const learnedCount = learnedResult[0]?.learnedCount ?? 0;

  // Count words due: nextReviewAt <= now
  const dueResult = await db
    .select({
      dueCount: sql<number>`COUNT(*)::int`,
    })
    .from(schema.userVocabulary)
    .where(
      and(
        eq(schema.userVocabulary.userId, userId),
        lte(schema.userVocabulary.nextReviewAt, new Date())
      )
    );

  const dueCount = dueResult[0]?.dueCount ?? 0;

  // Fetch existing stats row
  const existingRows = await db
    .select()
    .from(schema.englishLearningStats)
    .where(eq(schema.englishLearningStats.userId, userId));

  const existing = existingRows[0] ?? null;

  // Streak logic: compare today and yesterday in UTC
  const todayUtc = new Date();
  todayUtc.setUTCHours(0, 0, 0, 0);

  const yesterdayUtc = new Date(todayUtc.getTime() - 86_400_000);

  let newStreak: number;
  if (!existing || !existing.lastActivityAt) {
    // First activity or no prior stats
    newStreak = 1;
  } else {
    const lastDate = new Date(existing.lastActivityAt);
    lastDate.setUTCHours(0, 0, 0, 0);

    if (lastDate.getTime() === todayUtc.getTime()) {
      // Activity already happened today, streak unchanged
      newStreak = existing.currentStreak;
    } else if (lastDate.getTime() === yesterdayUtc.getTime()) {
      // Activity yesterday, extend streak by 1
      newStreak = existing.currentStreak + 1;
    } else {
      // Gap of 2+ days, reset to 1
      newStreak = 1;
    }
  }

  const newLongest = Math.max(newStreak, existing?.longestStreak ?? 0);

  // Upsert stats row
  await db
    .insert(schema.englishLearningStats)
    .values({
      userId,
      wordsLearned: learnedCount,
      wordsDue: dueCount,
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActivityAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.englishLearningStats.userId,
      set: {
        wordsLearned: learnedCount,
        wordsDue: dueCount,
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActivityAt: new Date(),
        updatedAt: new Date(),
      },
    });
}
