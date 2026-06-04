import { db } from "../client";
import {
  and,
  eq,
  ilike,
  desc,
  asc,
  sql,
} from "drizzle-orm";
import { vocabularyItem, userVocabulary, vocabularySource } from "../schema";

export async function addVocabularyItem(
  userId: string,
  item: {
    phrase: string;
    meaning: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    category: string;
    example?: string;
  }
): Promise<{ userVocabId: string; vocabId: string }> {
  return await db.transaction(async (tx) => {
    const existing = await tx
      .select({ id: vocabularyItem.id })
      .from(vocabularyItem)
      .where(ilike(vocabularyItem.phrase, item.phrase))
      .limit(1);

    let vocabId: string;
    if (existing.length > 0) {
      vocabId = existing[0]!.id;
    } else {
      const vocabUUID = crypto.randomUUID();
      vocabId = vocabUUID;
      await tx.insert(vocabularyItem).values({
        id: vocabUUID as any, // randomUUID() → PgUUID
        phrase: item.phrase,
        meaning: item.meaning,
        difficulty: item.difficulty,
        category: item.category,
        example: item.example ?? null,
      });
    }

    const userVocabUUID = crypto.randomUUID();
    await tx.insert(userVocabulary).values({
      id: userVocabUUID as any, // randomUUID() → PgUUID
      userId,
      vocabularyId: vocabId as any, // string → PgUUID
      stability: "0" as any, // string decimal → numeric
      difficulty: "5.0" as any, // string decimal → numeric
      state: "new",
      reps: 0,
      lapses: 0,
      nextReviewAt: new Date(),
    });

    return {
      userVocabId: userVocabUUID,
      vocabId,
    };
  });
}

export async function getUserVocabulary(
  userId: string,
  filters?: {
    category?: string;
    state?: string;
  }
): Promise<
  Array<{
    userVocabId: string;
    vocabId: string;
    phrase: string;
    meaning: string;
    category: string;
    difficulty: string;
    example: string | null;
    stability: string;
    state: string;
    reps: number;
    lapses: number;
    masteryScore: number;
    nextReviewAt: Date;
    lastReviewedAt: Date | null;
  }>
> {
  const conditions = [eq(userVocabulary.userId, userId)];

  if (filters?.category) {
    conditions.push(eq(vocabularyItem.category, filters.category));
  }

  if (filters?.state) {
    conditions.push(eq(userVocabulary.state, filters.state));
  }

  const rows = await db
    .select({
      userVocabId: userVocabulary.id,
      vocabId: vocabularyItem.id,
      phrase: vocabularyItem.phrase,
      meaning: vocabularyItem.meaning,
      category: vocabularyItem.category,
      difficulty: vocabularyItem.difficulty,
      example: vocabularyItem.example,
      stability: userVocabulary.stability,
      state: userVocabulary.state,
      reps: userVocabulary.reps,
      lapses: userVocabulary.lapses,
      nextReviewAt: userVocabulary.nextReviewAt,
      lastReviewedAt: userVocabulary.lastReviewedAt,
    })
    .from(userVocabulary)
    .innerJoin(
      vocabularyItem,
      eq(userVocabulary.vocabularyId, vocabularyItem.id)
    )
    .where(and(...conditions));

  const now = new Date();
  return rows.map((row) => {
    const stabilityStr = row.stability.toString();
    const S = parseFloat(stabilityStr);
    const elapsed = row.lastReviewedAt
      ? (now.getTime() - row.lastReviewedAt.getTime()) / 86400000
      : 0;
    const masteryScore =
      S === 0 ? 0 : Math.round(Math.exp(-elapsed / (9 * S)) * 100);

    return {
      ...row,
      stability: stabilityStr,
      masteryScore,
    };
  });
}

export async function getDueVocabulary(
  userId: string,
  limit?: number
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
  }>
> {
  const query = db
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
        sql`${userVocabulary.nextReviewAt} <= NOW()`
      )
    )
    .orderBy(desc(userVocabulary.nextReviewAt));

  const rows = limit ? await query.limit(limit) : await query;

  return rows.map((row) => ({
    ...row,
    stability: row.stability.toString(),
    difficulty: row.difficulty.toString(),
  }));
}

export async function getUserVocabularyStats(
  userId: string
): Promise<{
  total: number;
  dueNow: number;
  learned: number;
  byCategory: Record<string, number>;
}> {
  const allVocab = await db
    .select({
      id: userVocabulary.id,
      state: userVocabulary.state,
      reps: userVocabulary.reps,
      category: vocabularyItem.category,
    })
    .from(userVocabulary)
    .innerJoin(
      vocabularyItem,
      eq(userVocabulary.vocabularyId, vocabularyItem.id)
    )
    .where(eq(userVocabulary.userId, userId));

  const total = allVocab.length;
  const learned = allVocab.filter(
    (v) => v.reps >= 3 && v.state === "review"
  ).length;

  const dueNow = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(userVocabulary)
    .where(
      and(
        eq(userVocabulary.userId, userId),
        sql`${userVocabulary.nextReviewAt} <= NOW()`
      )
    );

  const byCategory: Record<string, number> = {};
  allVocab.forEach((v) => {
    byCategory[v.category] = (byCategory[v.category] ?? 0) + 1;
  });

  return {
    total,
    dueNow: dueNow[0]?.count ?? 0,
    learned,
    byCategory,
  };
}

export async function searchVocabulary(
  userId: string,
  query: string
): Promise<
  Array<{
    userVocabId: string;
    phrase: string;
    meaning: string;
    category: string;
  }>
> {
  const rows = await db
    .select({
      userVocabId: userVocabulary.id,
      phrase: vocabularyItem.phrase,
      meaning: vocabularyItem.meaning,
      category: vocabularyItem.category,
    })
    .from(userVocabulary)
    .innerJoin(
      vocabularyItem,
      eq(userVocabulary.vocabularyId, vocabularyItem.id)
    )
    .where(
      and(
        eq(userVocabulary.userId, userId),
        sql`(${vocabularyItem.phrase} ILIKE ${"%" + query + "%"} OR ${vocabularyItem.meaning} ILIKE ${"%" + query + "%"})`
      )
    )
    .limit(20);

  return rows;
}

export async function deleteUserVocabulary(
  userId: string,
  userVocabId: string
): Promise<void> {
  await db
    .delete(userVocabulary)
    .where(
      and(
        eq(userVocabulary.userId, userId),
        eq(userVocabulary.id, userVocabId as any)
      )
    );
}
