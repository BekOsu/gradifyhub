"use server";

import { requireAuth } from "~/lib/auth/session";
import { getDueItems, recordReview } from "~/lib/srs/schedule";
import { refreshStats } from "~/lib/english/stats-updater";

export async function startReviewAction(
  limit = 20
): Promise<{
  success: boolean;
  items?: Array<{
    userVocabId: string;
    phrase: string;
    meaning: string;
    category: string;
    example: string | null;
    retrievability: number;
    stability: string;
    lastReviewedAt: Date | null;
  }>;
  error?: string;
}> {
  try {
    const user = await requireAuth();

    const dueItems = await getDueItems(user.id, limit);

    const items = dueItems.map((item) => ({
      userVocabId: item.userVocabId,
      phrase: item.phrase,
      meaning: item.meaning,
      category: item.category,
      example: item.example,
      retrievability: item.retrievability,
      stability: item.stability,
      lastReviewedAt: item.lastReviewedAt,
    }));

    return { success: true, items };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to start review";
    return { success: false, error: message };
  }
}

export async function submitGradeAction(
  userVocabId: string,
  grade: 1 | 2 | 3 | 4
): Promise<{
  success: boolean;
  nextReviewAt?: Date;
  retrievability?: number;
  error?: string;
}> {
  try {
    const user = await requireAuth();

    const result = await recordReview(user.id, userVocabId, grade);

    return {
      success: true,
      nextReviewAt: result.nextReviewAt,
      retrievability: result.retrievability,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit grade";
    return { success: false, error: message };
  }
}

export async function getSessionSummaryAction(
  reviewed: Array<{ userVocabId: string; grade: number }>
): Promise<{
  totalReviewed: number;
  avgGrade: number;
  nextDueCount: number;
}> {
  try {
    const user = await requireAuth();

    const totalReviewed = reviewed.length;
    const avgGrade =
      reviewed.length > 0
        ? Math.round(
            (reviewed.reduce((sum, r) => sum + r.grade, 0) / reviewed.length) *
              100
          ) / 100
        : 0;

    const dueItems = await getDueItems(user.id, 1);
    const nextDueCount = dueItems.length;

    await refreshStats(user.id).catch(() => null);

    return {
      totalReviewed,
      avgGrade,
      nextDueCount,
    };
  } catch (error) {
    return {
      totalReviewed: reviewed.length,
      avgGrade: 0,
      nextDueCount: 0,
    };
  }
}
