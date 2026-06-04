'use server';

import { requireAuth } from '~/lib/auth/session';
import { getDueVocabulary, getUserVocabulary } from '@repo/db/queries/vocabulary';
import { aiTranscribe } from '~/lib/ai/transcribe';
import { evaluateShadowing, type ShadowingEvaluation } from '~/lib/english/shadowing';
import { analyzeShadowingAccent, type AccentAnalysis } from '~/lib/english/fluency-analyzer';
import { getUserPlan } from '~/lib/billing/hasFeature';
import { refreshStats } from '~/lib/english/stats-updater';
import { db } from '@repo/db/client';
import * as schema from '@repo/db/schema';
import { eq, sql } from '@repo/db/drizzle';

export type ShadowingPhrase = {
  userVocabId: string;
  phrase: string;
  meaning: string;
  example: string | null;
  category: string;
};

export async function getShadowingPhrasesAction(limit?: number): Promise<{ phrases: ShadowingPhrase[] }> {
  try {
    const user = await requireAuth();
    const fetchLimit = limit ?? 10;

    // Fetch due vocabulary items first
    const dueItems = await getDueVocabulary(user.id, fetchLimit);

    // If we need more items, fetch additional ones
    let allItems = dueItems;
    if (dueItems.length < fetchLimit) {
      const remainingNeeded = fetchLimit - dueItems.length;
      const additionalItems = await getUserVocabulary(user.id, {});
      const dueIds = new Set(dueItems.map(item => item.userVocabId));
      const filteredAdditional = additionalItems.filter(item => !dueIds.has(item.userVocabId)).slice(0, remainingNeeded);
      allItems = [...dueItems, ...filteredAdditional];
    }

    // Deduplicate by userVocabId
    const seen = new Set<string>();
    const phrases: ShadowingPhrase[] = [];

    for (const item of allItems) {
      if (!seen.has(item.userVocabId)) {
        seen.add(item.userVocabId);
        phrases.push({
          userVocabId: item.userVocabId,
          phrase: item.phrase,
          meaning: item.meaning,
          example: item.example,
          category: item.category,
        });
      }
    }

    return { phrases };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get shadowing phrases';
    throw new Error(message);
  }
}

export async function startShadowingSessionAction(
  phrase: string,
  referenceAudioUrl?: string,
): Promise<{ success: true; sessionId: string } | { success: false; error: string }> {
  try {
    const user = await requireAuth();

    const result = await db
      .insert(schema.shadowingSession)
      .values({
        userId: user.id,
        sourcePhrase: phrase,
        referenceAudioUrl: referenceAudioUrl ?? null,
        status: 'pending',
      })
      .returning({ id: schema.shadowingSession.id });

    const sessionId = result[0]?.id;
    if (!sessionId) {
      return { success: false, error: 'Failed to create session' };
    }

    return { success: true, sessionId };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start shadowing session';
    return { success: false, error: message };
  }
}

export async function submitShadowingAction(
  sessionId: string,
  audioBuffer: string,
  mimeType: string,
): Promise<{ success: true; transcript: string; evaluation: ShadowingEvaluation; accentAnalysis: AccentAnalysis | null } | { success: false; error: string }> {
  try {
    const user = await requireAuth();

    // Query session and verify ownership
    const sessionRows = await db
      .select()
      .from(schema.shadowingSession)
      .where(eq(schema.shadowingSession.id, sessionId as any));

    const session = sessionRows[0];
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    if (session.userId !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Convert base64 to Buffer
    const buffer = Buffer.from(audioBuffer, 'base64');

    // Transcribe audio
    const transcript = await aiTranscribe(buffer, mimeType);

    const plan = await getUserPlan(user.id);

    // Evaluate shadowing and accent analysis in parallel
    const [evaluation, accentAnalysis] = await Promise.all([
      evaluateShadowing(session.sourcePhrase, transcript, plan),
      analyzeShadowingAccent(sessionId, plan).catch(() => null),
    ]);

    // Update session with results
    await db
      .update(schema.shadowingSession)
      .set({
        userTranscript: transcript,
        accuracyScore: evaluation.accuracy_score,
        pacingScore: evaluation.pacing_score,
        clarityScore: evaluation.clarity_score,
        naturalnessScore: evaluation.naturalness_score,
        aiFeedbackJson: { ...(evaluation as object), accent: accentAnalysis } as any,
        status: 'done',
      })
      .where(eq(schema.shadowingSession.id, sessionId as any));

    // Upsert english_learning_stats
    await db
      .insert(schema.englishLearningStats)
      .values({
        userId: user.id,
        shadowingSessionsDone: 1,
        lastActivityAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.englishLearningStats.userId,
        set: {
          shadowingSessionsDone: sql`${schema.englishLearningStats.shadowingSessionsDone} + 1`,
          lastActivityAt: new Date(),
          updatedAt: new Date(),
        },
      });

    await refreshStats(user.id).catch(() => null);

    return { success: true, transcript, evaluation, accentAnalysis };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit shadowing';
    return { success: false, error: message };
  }
}

export async function getSessionStatusAction(
  sessionId: string,
): Promise<{ session: (typeof schema.shadowingSession.$inferSelect) | null }> {
  try {
    const user = await requireAuth();

    const sessions = await db
      .select()
      .from(schema.shadowingSession)
      .where(eq(schema.shadowingSession.id, sessionId as any));

    const session = sessions[0];

    // Return null if not found or wrong user
    if (!session || session.userId !== user.id) {
      return { session: null };
    }

    return { session };
  } catch (error) {
    return { session: null };
  }
}
