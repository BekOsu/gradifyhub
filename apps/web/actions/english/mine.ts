"use server";

import { requireAuth } from "~/lib/auth/session";
import { getUserPlan, hasFeature } from "~/lib/billing/hasFeature";
import {
  extractYouTubeTranscript,
  extractArticleText,
  chunkTranscript,
} from "~/lib/english/transcript";
import { extractVocabulary } from "~/lib/english/vocab-extractor";
import {
  createVocabularySource,
  updateVocabularySourceStatus,
  getPendingSourceItems,
  getUserVocabularySources,
} from "@repo/db/queries/vocabulary-source";
import { db } from "@repo/db/client";
import { vocabularyItem, userVocabulary, vocabularySource } from "@repo/db/schema";
import { and, eq, ilike } from "@repo/db/drizzle";
import { revalidatePath } from "next/cache";

export async function submitSourceAction(
  url: string,
  kind: "youtube" | "article"
): Promise<{
  success: boolean;
  sourceId?: string;
  itemCount?: number;
  error?: string;
}> {
  try {
    const user = await requireAuth();
    const canMine = await hasFeature(user.id, "english_mining");
    if (!canMine) {
      return { success: false, error: "Vocabulary mining requires a Pro plan." };
    }
    const plan = await getUserPlan(user.id);

    const sourceId = await createVocabularySource(user.id, {
      kind,
      url,
    });

    try {
      let text: string;
      if (kind === "youtube") {
        text = await extractYouTubeTranscript(url);
      } else {
        text = await extractArticleText(url);
      }

      const chunks = chunkTranscript(text, 800).slice(0, 10);

      let insertedCount = 0;

      for (const chunk of chunks) {
        const vocabItems = await extractVocabulary(chunk, {
          plan,
          userId: user.id,
        });

        for (const item of vocabItems) {
          const existing = await db
            .select({ id: vocabularyItem.id })
            .from(vocabularyItem)
            .where(
              and(
                ilike(vocabularyItem.phrase, item.phrase),
                eq(vocabularyItem.createdByUserId, user.id)
              )
            )
            .limit(1);

          if (existing.length === 0) {
            const vocabId = crypto.randomUUID();
            await db.insert(vocabularyItem).values({
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              id: vocabId as any,
              phrase: item.phrase,
              meaning: item.meaning,
              difficulty: item.difficulty,
              category: item.category,
              example: item.example,
              frequencyScore: item.frequencyScore,
              technicalRelevance: item.technicalRelevance,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              sourceId: sourceId as any,
              createdByUserId: user.id,
            });

            insertedCount++;
          }
        }
      }

      await updateVocabularySourceStatus(sourceId, "done", insertedCount);
      revalidatePath("/english/vocab/mine");

      return {
        success: true,
        sourceId,
        itemCount: insertedCount,
      };
    } catch (error) {
      await updateVocabularySourceStatus(sourceId, "failed");
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: message,
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: message,
    };
  }
}

export async function acceptVocabItemAction(
  vocabId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();

    const existing = await db
      .select({ id: userVocabulary.id })
      .from(userVocabulary)
      .where(
        and(
          eq(userVocabulary.userId, user.id),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          eq(userVocabulary.vocabularyId, vocabId as any)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      const userVocabId = crypto.randomUUID();
      await db.insert(userVocabulary).values({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: userVocabId as any,
        userId: user.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vocabularyId: vocabId as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        stability: "0" as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        difficulty: "5.0" as any,
        state: "new",
        reps: 0,
        lapses: 0,
        nextReviewAt: new Date(),
      });
    }

    revalidatePath("/english/vocab/mine");

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: message,
    };
  }
}

export async function getSourceItemsAction(
  sourceId: string
): Promise<{
  success: boolean;
  items?: Array<{
    vocabId: string;
    phrase: string;
    meaning: string;
    category: string;
    difficulty: string;
    example: string | null;
    frequencyScore: number;
    technicalRelevance: number;
  }>;
  error?: string;
}> {
  try {
    const user = await requireAuth();

    const items = await getPendingSourceItems(user.id, sourceId);

    return {
      success: true,
      items,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: message,
    };
  }
}

export async function getSourceHistoryAction(): Promise<{
  success: boolean;
  sources?: Array<{
    id: string;
    kind: string;
    url: string | null;
    title: string | null;
    status: string;
    itemCount: number;
    createdAt: Date;
  }>;
  error?: string;
}> {
  try {
    const user = await requireAuth();

    const sources = await getUserVocabularySources(user.id);

    return {
      success: true,
      sources,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: message,
    };
  }
}

export async function analyzeTextAction(
  text: string,
): Promise<{ success: true; sourceId: string; itemCount: number } | { success: false; error: string }> {
  try {
    const user = await requireAuth();
    const canMine = await hasFeature(user.id, "english_mining");
    if (!canMine) {
      return { success: false, error: "Vocabulary mining requires a Pro plan." };
    }
    const plan = await getUserPlan(user.id);

    const sourceId = crypto.randomUUID();
    await db.insert(vocabularySource).values({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      id: sourceId as any,
      userId: user.id,
      kind: "text",
      url: null,
      title: "Direct text analysis",
      language: "en",
      status: "pending",
      itemCount: 0,
    });

    try {
      const chunks = chunkTranscript(text, 800).slice(0, 10);
      let insertedCount = 0;

      for (const chunk of chunks) {
        const vocabItems = await extractVocabulary(chunk, { plan, userId: user.id });

        for (const item of vocabItems) {
          const existing = await db
            .select({ id: vocabularyItem.id })
            .from(vocabularyItem)
            .where(
              and(
                ilike(vocabularyItem.phrase, item.phrase),
                eq(vocabularyItem.createdByUserId, user.id)
              )
            )
            .limit(1);

          if (existing.length === 0) {
            const vocabId = crypto.randomUUID();
            await db.insert(vocabularyItem).values({
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              id: vocabId as any,
              phrase: item.phrase,
              meaning: item.meaning,
              difficulty: item.difficulty,
              category: item.category,
              example: item.example,
              frequencyScore: item.frequencyScore,
              technicalRelevance: item.technicalRelevance,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              sourceId: sourceId as any,
              createdByUserId: user.id,
            });
            insertedCount++;
          }
        }
      }

      await updateVocabularySourceStatus(sourceId, "done", insertedCount);
      revalidatePath("/english/vocab/mine");

      return { success: true, sourceId, itemCount: insertedCount };
    } catch (error) {
      await updateVocabularySourceStatus(sourceId, "failed");
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}
