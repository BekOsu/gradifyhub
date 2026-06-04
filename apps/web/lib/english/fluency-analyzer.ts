import { z } from 'zod';
import { aiGenerateObject } from '~/lib/ai/client';
import { db } from '@repo/db/client';
import * as schema from '@repo/db/schema';
import { eq, desc } from '@repo/db/drizzle';

export const AccentAnalysisSchema = z.object({
  connected_speech_score: z.number().int().min(0).max(100),
  rhythm_score: z.number().int().min(0).max(100),
  filler_word_count: z.number().int().min(0),
  filler_words_found: z.array(z.string()),
  weak_patterns: z.array(z.object({
    pattern: z.string(),
    frequency: z.string(),
    drill_phrase: z.string().max(120),
  })).length(3),
  improvement_tip: z.string().max(200),
});

export type AccentAnalysis = z.infer<typeof AccentAnalysisSchema>;

export const AccentTrendSchema = z.object({
  connected_speech_trend: z.enum(['improving', 'stable', 'declining']),
  rhythm_trend: z.enum(['improving', 'stable', 'declining']),
  recurring_fillers: z.array(z.string()),
  summary: z.string().max(200),
});

export type AccentTrend = z.infer<typeof AccentTrendSchema>;

export async function analyzeAccentFromTranscript(
  transcript: string,
  plan?: string,
): Promise<AccentAnalysis> {
  const system = 'You are an accent and fluency coach specializing in American English for non-native tech professionals. Be specific and encouraging.';

  const prompt = `Analyze this spoken transcript for fluency and accent patterns.

Transcript:
"${transcript}"

Count filler words (um, uh, like, you know, basically, literally, kind of, sort of, right?, I mean).
Score connected speech (0-100): how naturally words flow together (contractions, linking, reductions like "gonna", "wanna", "kinda").
Score rhythm (0-100): natural stress patterns, not word-by-word reading.
Identify exactly 3 weak patterns with a drill phrase each (under 120 chars).
Give one improvement tip (under 200 chars).`;

  return aiGenerateObject({
    plan,
    speed: 'fast',
    system,
    prompt,
    schema: AccentAnalysisSchema,
    feature: 'english_shadow',
  });
}

export async function analyzeShadowingAccent(
  sessionId: string,
  plan?: string,
): Promise<AccentAnalysis | null> {
  try {
    const rows = await db
      .select({ userTranscript: schema.shadowingSession.userTranscript })
      .from(schema.shadowingSession)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .where(eq(schema.shadowingSession.id, sessionId as any));

    const session = rows[0];
    if (!session?.userTranscript?.trim()) return null;

    return analyzeAccentFromTranscript(session.userTranscript, plan);
  } catch {
    return null;
  }
}

export async function analyzeSpeakingAccent(
  sessionId: string,
  plan?: string,
): Promise<AccentAnalysis | null> {
  try {
    const rows = await db
      .select({ transcriptJson: schema.speakingSession.transcriptJson })
      .from(schema.speakingSession)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .where(eq(schema.speakingSession.id, sessionId as any));

    const session = rows[0];
    if (!session?.transcriptJson) return null;

    const turns = (session.transcriptJson as Array<{ role: string; content: string }> | null) ?? [];
    const userText = turns
      .filter(t => t.role === 'user')
      .map(t => t.content)
      .join(' ');

    if (!userText.trim()) return null;

    return analyzeAccentFromTranscript(userText, plan);
  } catch {
    return null;
  }
}

export async function getAccentTrend(
  userId: string,
  plan?: string,
): Promise<AccentTrend | null> {
  try {
    const sessions = await db
      .select({
        aiFeedbackJson: schema.speakingSession.aiFeedbackJson,
        transcriptJson: schema.speakingSession.transcriptJson,
      })
      .from(schema.speakingSession)
      .where(eq(schema.speakingSession.userId, userId))
      .orderBy(desc(schema.speakingSession.createdAt))
      .limit(10);

    if (sessions.length < 3) return null;

    const sessionSummaries = sessions
      .map((s, i) => {
        const turns = (s.transcriptJson as Array<{ role: string; content: string }> | null) ?? [];
        const userText = turns
          .filter(t => t.role === 'user')
          .map(t => t.content)
          .join(' ')
          .slice(0, 200);
        return `Session ${i + 1}: "${userText}"`;
      })
      .join('\n\n');

    const system = 'You are a fluency trend analyst for English language learners.';

    const prompt = `Analyze these ${sessions.length} speaking session transcripts (most recent first) for trends.

${sessionSummaries}

Identify:
- connected_speech_trend: is connected speech improving, stable, or declining across sessions?
- rhythm_trend: is rhythm/pacing improving, stable, or declining?
- recurring_fillers: filler words appearing in 3 or more sessions (return empty array if none)
- summary: one encouraging sentence about overall progress (max 200 chars)`;

    return aiGenerateObject({
      plan,
      speed: 'fast',
      system,
      prompt,
      schema: AccentTrendSchema,
      feature: 'english_speak',
    });
  } catch {
    return null;
  }
}
