'use server';

import { requireAuth } from '~/lib/auth/session';
import { getUserPlan, hasFeature } from '~/lib/billing/hasFeature';
import { refreshStats } from '~/lib/english/stats-updater';
import { db } from '@repo/db/client';
import * as schema from '@repo/db/schema';
import { eq, sql } from '@repo/db/drizzle';
import { revalidatePath } from 'next/cache';
import { scenarios } from '~/lib/english/scenarios';
import {
  generateAiTurn,
  generatePerTurnFeedback,
  generateSessionSummary,
  type TranscriptTurn,
  type PerTurnFeedback,
  type SessionSummary,
} from '~/lib/english/speaking-partner';
import { analyzeSpeakingAccent, getAccentTrend, type AccentAnalysis, type AccentTrend } from '~/lib/english/fluency-analyzer';
import { addVocabularyItem } from '@repo/db/queries/vocabulary';

export type SpeakingSessionRow = typeof schema.speakingSession.$inferSelect;

export async function startSessionAction(
  mode: string,
  scenarioId: string
): Promise<
  { success: true; sessionId: string; firstMessage: string; scenario: any } | { success: false; error: string }
> {
  try {
    const user = await requireAuth();

    const canSpeak = await hasFeature(user.id, "english_speak");
    if (!canSpeak) {
      return { success: false, error: "Speaking partner requires a Pro plan." };
    }

    const validModes = ['interview', 'standup', 'meeting', 'casual'];
    if (!validModes.includes(mode)) {
      return { success: false, error: `Invalid mode: ${mode}` };
    }

    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) {
      return { success: false, error: `Scenario not found: ${scenarioId}` };
    }

    const initialTranscript: TranscriptTurn[] = [
      {
        role: 'ai',
        content: scenario.opening,
        timestamp: new Date().toISOString(),
      },
    ];

    const result = await db
      .insert(schema.speakingSession)
      .values({
        userId: user.id,
        mode,
        scenarioId,
        modality: 'text',
        transcriptJson: initialTranscript as any,
        status: 'active',
      })
      .returning({ id: schema.speakingSession.id });

    const sessionId = result[0]?.id;
    if (!sessionId) {
      return { success: false, error: 'Failed to create session' };
    }

    return {
      success: true,
      sessionId,
      firstMessage: scenario.opening,
      scenario,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start session';
    return { success: false, error: message };
  }
}

export async function sendMessageAction(
  sessionId: string,
  userMessage: string
): Promise<{ success: true; aiResponse: string; feedback: PerTurnFeedback } | { success: false; error: string }> {
  try {
    const user = await requireAuth();

    const canSpeak = await hasFeature(user.id, "english_speak");
    if (!canSpeak) {
      return { success: false, error: "Speaking partner requires a Pro plan." };
    }

    const sessionRows = await db
      .select()
      .from(schema.speakingSession)
      .where(eq(schema.speakingSession.id, sessionId as any));

    const session = sessionRows[0];
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    if (session.userId !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    if (session.status !== 'active') {
      return { success: false, error: 'Session already ended' };
    }

    const transcript = ((session.transcriptJson as any) ?? []) as TranscriptTurn[];

    const scenario = scenarios.find(s => s.id === session.scenarioId);
    if (!scenario) {
      return { success: false, error: 'Scenario not found' };
    }

    const plan = await getUserPlan(user.id);

    const now = new Date().toISOString();

    const [aiResponse, feedback] = await Promise.all([
      generateAiTurn(session.mode, scenario, transcript, plan),
      generatePerTurnFeedback(userMessage, session.mode, plan),
    ]);

    const userTurn: TranscriptTurn = {
      role: 'user',
      content: userMessage,
      timestamp: now,
      feedback,
    };

    const aiTurn: TranscriptTurn = {
      role: 'ai',
      content: aiResponse,
      timestamp: new Date(Date.now() + 1000).toISOString(),
    };

    const updatedTranscript = [...transcript, userTurn, aiTurn];

    await db
      .update(schema.speakingSession)
      .set({
        transcriptJson: updatedTranscript as any,
      })
      .where(eq(schema.speakingSession.id, sessionId as any));

    return { success: true, aiResponse, feedback };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send message';
    return { success: false, error: message };
  }
}

export async function endSessionAction(
  sessionId: string
): Promise<{ success: true; summary: SessionSummary; accentAnalysis: AccentAnalysis | null; accentTrend: AccentTrend | null } | { success: false; error: string }> {
  try {
    const user = await requireAuth();

    const sessionRows = await db
      .select()
      .from(schema.speakingSession)
      .where(eq(schema.speakingSession.id, sessionId as any));

    const session = sessionRows[0];
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    if (session.userId !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const transcript = ((session.transcriptJson as any) ?? []) as TranscriptTurn[];
    const userTurns = transcript.filter(t => t.role === 'user');

    const plan = await getUserPlan(user.id);

    const [summary, accentAnalysis, accentTrend] = await Promise.all([
      generateSessionSummary(transcript, session.mode, plan),
      analyzeSpeakingAccent(sessionId, plan).catch(() => null),
      getAccentTrend(user.id, plan).catch(() => null),
    ]);

    const durationSeconds = Math.round((Date.now() - session.createdAt.getTime()) / 1000);

    await db
      .update(schema.speakingSession)
      .set({
        fluencyScore: summary.fluency_score,
        grammarScore: summary.grammar_score,
        vocabScore: summary.vocab_score,
        aiFeedbackJson: { ...summary, accent: accentAnalysis, trend: accentTrend } as any,
        status: 'done',
        completedAt: new Date(),
        durationSeconds,
      })
      .where(eq(schema.speakingSession.id, sessionId as any));

    await db
      .insert(schema.englishLearningStats)
      .values({
        userId: user.id,
        speakingSessionsDone: 1,
        lastActivityAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.englishLearningStats.userId,
        set: {
          speakingSessionsDone: sql`${schema.englishLearningStats.speakingSessionsDone} + 1`,
          lastActivityAt: new Date(),
          updatedAt: new Date(),
        },
      });

    await refreshStats(user.id).catch(() => null);

    revalidatePath('/english/speak');

    return { success: true, summary, accentAnalysis, accentTrend };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to end session';
    return { success: false, error: message };
  }
}

export async function addSuggestedVocabAction(
  phrase: string,
  meaning: string,
  example: string,
  category: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();

    await addVocabularyItem(user.id, {
      phrase,
      meaning,
      example,
      category,
      difficulty: 'intermediate',
    });

    revalidatePath('/english/vocab');

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add vocabulary';
    return { success: false, error: message };
  }
}

export async function getSessionHistoryAction(): Promise<{ sessions: SpeakingSessionRow[] }> {
  try {
    const user = await requireAuth();

    const sessions = await db
      .select()
      .from(schema.speakingSession)
      .where(eq(schema.speakingSession.userId, user.id))
      .orderBy(sql`${schema.speakingSession.createdAt} DESC`)
      .limit(10);

    const completedSessions = sessions.filter(s => s.status === 'done');

    return { sessions: completedSessions };
  } catch (error) {
    return { sessions: [] };
  }
}
