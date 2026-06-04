import { db } from "@repo/db/client";
import {
  userVocabulary,
  vocabularyItem,
  vocabularyReview,
  englishLearningStats,
} from "@repo/db/schema";
import {
  and,
  eq,
  lte,
  sql,
  desc,
} from "@repo/db/drizzle";
import { dbRowToCard, applyGrade, calcRetrievability } from "./fsrs";

export async function getDueItems(
  userId: string,
  limit = 20
): Promise<
  Array<{
    userVocabId: string;
    phrase: string;
    meaning: string;
    category: string;
    example: string | null;
    stability: string;
    difficulty: string;
    state: string;
    reps: number;
    lapses: number;
    lastReviewedAt: Date | null;
    nextReviewAt: Date;
    retrievability: number;
  }>
> {
  const rows = await db
    .select({
      userVocabId: userVocabulary.id,
      phrase: vocabularyItem.phrase,
      meaning: vocabularyItem.meaning,
      category: vocabularyItem.category,
      example: vocabularyItem.example,
      stability: userVocabulary.stability,
      difficulty: userVocabulary.difficulty,
      state: userVocabulary.state,
      reps: userVocabulary.reps,
      lapses: userVocabulary.lapses,
      lastReviewedAt: userVocabulary.lastReviewedAt,
      nextReviewAt: userVocabulary.nextReviewAt,
    })
    .from(userVocabulary)
    .innerJoin(
      vocabularyItem,
      eq(userVocabulary.vocabularyId, vocabularyItem.id)
    )
    .where(
      and(
        eq(userVocabulary.userId, userId),
        lte(userVocabulary.nextReviewAt, new Date())
      )
    )
    .orderBy(desc(userVocabulary.nextReviewAt))
    .limit(limit);

  return rows.map((row) => ({
    ...row,
    stability: row.stability.toString(),
    difficulty: row.difficulty.toString(),
    retrievability: calcRetrievability({
      stability: row.stability.toString(),
      lastReviewedAt: row.lastReviewedAt,
    }),
  }));
}

export async function recordReview(
  userId: string,
  userVocabId: string,
  grade: 1 | 2 | 3 | 4,
  reviewType: string = "flashcard"
): Promise<{ nextReviewAt: Date; retrievability: number }> {
  // userVocabId is a UUID string from the client; DB schema expects UUID type
  return await db.transaction(async (tx) => {
    const vocabRows = await tx
      .select()
      .from(userVocabulary)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .where(eq(userVocabulary.id, userVocabId as any)) // uuid string → PgUUID
      .limit(1);

    if (vocabRows.length === 0) {
      throw new Error("Vocabulary item not found");
    }

    const row = vocabRows[0]!;
    const wasNew = row.state === "new";

    const card = dbRowToCard({
      stability: row.stability.toString(),
      difficulty: row.difficulty.toString(),
      state: row.state,
      reps: row.reps,
      lapses: row.lapses,
      lastReviewedAt: row.lastReviewedAt,
      nextReviewAt: row.nextReviewAt,
    });

    const updated = applyGrade(card, grade);

    await tx
      .update(userVocabulary)
      .set({
        stability: sql`${updated.stability}::numeric`,
        difficulty: sql`${updated.difficulty}::numeric`,
        state: updated.state,
        reps: updated.reps,
        lapses: updated.lapses,
        lastReviewedAt: updated.lastReviewedAt,
        nextReviewAt: updated.nextReviewAt,
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .where(eq(userVocabulary.id, userVocabId as any)); // uuid string → PgUUID

    await tx.insert(vocabularyReview).values({
      userId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userVocabularyId: userVocabId as any, // uuid string → PgUUID
      reviewType,
      response: null,
      grade,
    });

    const now = new Date();
    await tx
      .insert(englishLearningStats)
      .values({
        userId,
        lastActivityAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: englishLearningStats.userId,
        set: {
          wordsDue: wasNew
            ? sql`${englishLearningStats.wordsDue} + 1`
            : englishLearningStats.wordsDue,
          lastActivityAt: now,
          updatedAt: now,
        },
      });

    const retrievability = calcRetrievability({
      stability: updated.stability,
      lastReviewedAt: updated.lastReviewedAt,
    });

    return {
      nextReviewAt: updated.nextReviewAt,
      retrievability,
    };
  });
}
