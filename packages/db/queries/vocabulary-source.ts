import { db } from "../client";
import { eq, and, desc, isNull } from "drizzle-orm";
import { vocabularySource, vocabularyItem, userVocabulary } from "../schema";
import { randomUUID } from "crypto";

export async function createVocabularySource(
  userId: string,
  input: {
    kind: "youtube" | "article";
    url: string;
    title?: string;
  }
): Promise<string> {
  const sourceId = randomUUID();

  await db.insert(vocabularySource).values({
    id: sourceId as any,
    userId,
    kind: input.kind,
    url: input.url,
    title: input.title || null,
    language: "en",
    status: "pending",
    itemCount: 0,
  });

  return sourceId;
}

export async function updateVocabularySourceStatus(
  sourceId: string,
  status: "done" | "failed",
  itemCount?: number
): Promise<void> {
  const now = new Date();

  await db
    .update(vocabularySource)
    .set({
      status,
      itemCount: itemCount ?? 0,
      processedAt: now,
    })
    .where(eq(vocabularySource.id, sourceId as any));
}

export async function getVocabularySource(
  userId: string,
  sourceId: string
): Promise<{
  id: string;
  kind: string;
  url: string | null;
  title: string | null;
  status: string;
  itemCount: number;
  createdAt: Date;
  processedAt: Date | null;
} | null> {
  const row = await db.query.vocabularySource.findFirst({
    where: and(
      eq(vocabularySource.id, sourceId as any),
      eq(vocabularySource.userId, userId)
    ),
  });

  if (!row) return null;

  return {
    id: row.id,
    kind: row.kind,
    url: row.url,
    title: row.title,
    status: row.status,
    itemCount: row.itemCount,
    createdAt: row.createdAt,
    processedAt: row.processedAt,
  };
}

export async function getPendingSourceItems(
  userId: string,
  sourceId: string
): Promise<
  Array<{
    vocabId: string;
    phrase: string;
    meaning: string;
    category: string;
    difficulty: string;
    example: string | null;
    frequencyScore: number;
    technicalRelevance: number;
  }>
> {
  const items = await db
    .select({
      vocabId: vocabularyItem.id,
      phrase: vocabularyItem.phrase,
      meaning: vocabularyItem.meaning,
      category: vocabularyItem.category,
      difficulty: vocabularyItem.difficulty,
      example: vocabularyItem.example,
      frequencyScore: vocabularyItem.frequencyScore,
      technicalRelevance: vocabularyItem.technicalRelevance,
    })
    .from(vocabularyItem)
    .leftJoin(
      userVocabulary,
      and(
        eq(userVocabulary.vocabularyId, vocabularyItem.id),
        eq(userVocabulary.userId, userId)
      )
    )
    .where(
      and(
        eq(vocabularyItem.sourceId, sourceId as any),
        isNull(userVocabulary.id)
      )
    );

  return items;
}

export async function getUserVocabularySources(
  userId: string
): Promise<
  Array<{
    id: string;
    kind: string;
    url: string | null;
    title: string | null;
    status: string;
    itemCount: number;
    createdAt: Date;
  }>
> {
  const sources = await db.query.vocabularySource.findMany({
    where: eq(vocabularySource.userId, userId),
    orderBy: [desc(vocabularySource.createdAt)],
  });

  return sources.map((s) => ({
    id: s.id,
    kind: s.kind,
    url: s.url,
    title: s.title,
    status: s.status,
    itemCount: s.itemCount,
    createdAt: s.createdAt,
  }));
}
