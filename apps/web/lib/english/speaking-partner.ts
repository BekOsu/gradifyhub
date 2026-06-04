import { z } from 'zod';
import { aiGenerateText, aiGenerateObject } from '~/lib/ai/client';
import type { Scenario } from './scenarios';

export type TranscriptTurn = {
  role: 'ai' | 'user';
  content: string;
  timestamp: string;
  feedback?: PerTurnFeedback;
};

export const PerTurnFeedbackSchema = z.object({
  grammar_issues: z.array(
    z.object({
      original: z.string(),
      corrected: z.string(),
      explanation: z.string().max(100),
    })
  ),
  vocab_suggestions: z.array(
    z.object({
      instead_of: z.string(),
      use: z.string(),
      reason: z.string().max(80),
    })
  ),
  fluency_notes: z.string().max(150),
  better_phrasing: z.string().max(200),
});

export type PerTurnFeedback = z.infer<typeof PerTurnFeedbackSchema>;

export const SessionSummarySchema = z.object({
  fluency_score: z.number().int().min(0).max(100),
  grammar_score: z.number().int().min(0).max(100),
  vocab_score: z.number().int().min(0).max(100),
  top_issues: z
    .array(
      z.object({
        title: z.string(),
        instruction: z.string().max(120),
      })
    )
    .length(3),
  vocab_suggestions: z
    .array(
      z.object({
        phrase: z.string(),
        meaning: z.string().max(100),
        example: z.string().max(150),
        category: z.enum(['Daily Life', 'Work', 'Technical', 'Opinion', 'Social']),
      })
    )
    .min(2)
    .max(5),
  overall_feedback: z.string().max(250),
});

export type SessionSummary = z.infer<typeof SessionSummarySchema>;

type ModeSystemPrompt = {
  [K in 'interview' | 'standup' | 'meeting' | 'casual']: string;
};

const modeSystemPrompts: ModeSystemPrompt = {
  interview:
    'You are a senior technical interviewer. Ask focused follow-up questions. Keep responses under 3 sentences. Be professional but approachable.',
  standup:
    'You are a team lead running a daily standup. Keep it brief and focused. Ask clarifying questions if something is unclear. Under 2 sentences.',
  meeting:
    'You are a colleague in a work meeting. Engage naturally, ask for opinions, probe gently. Under 3 sentences.',
  casual:
    'You are a friendly work colleague in a casual conversation. Be natural, warm, and use informal language. Under 2 sentences.',
};

export async function generateAiTurn(
  mode: string,
  scenario: Scenario,
  history: TranscriptTurn[],
  plan?: string
): Promise<string> {
  const systemPrompt = modeSystemPrompts[mode as keyof ModeSystemPrompt] || modeSystemPrompts.casual;

  const historyText = history
    .slice(-8)
    .map(turn => `${turn.role === 'ai' ? 'AI' : 'User'}: ${turn.content}`)
    .join('\n');

  const prompt = `Scenario: ${scenario.title}
Context: ${scenario.context}

Vocabulary hints (weave in naturally): ${scenario.vocabulary_hints.join(', ')}

Conversation history:
${historyText}

Continue the conversation naturally. Your response should feel like a natural continuation of this dialogue, staying true to your role as ${scenario.mode === 'interview' ? 'interviewer' : scenario.mode === 'standup' ? 'team lead' : scenario.mode === 'meeting' ? 'colleague' : 'friendly colleague'}.`;

  const response = await aiGenerateText({
    plan,
    speed: 'fast',
    system: systemPrompt,
    prompt,
    feature: 'english_speak',
  });

  return response;
}

export async function generatePerTurnFeedback(
  userMessage: string,
  mode: string,
  plan?: string
): Promise<PerTurnFeedback> {
  const system =
    'You are an English language coach for non-native speakers in tech. Be constructive and specific.';

  const prompt = `Evaluate this message from a non-native English speaker in a ${mode} context:

"${userMessage}"

Provide:
1. Grammar issues (0-2): Only real mistakes, not style preferences. For each, include the original phrase, corrected version, and a brief explanation (max 100 chars each).
2. Vocabulary suggestions (0-2): More natural or professional alternatives to what they said. For each, what they said, what would be better, and why (max 80 chars).
3. Fluency notes (1 sentence, max 150 chars): Comment on overall naturalness and flow.
4. Better phrasing (max 200 chars): Rewrite their message in more natural English.`;

  const feedback = await aiGenerateObject({
    plan,
    speed: 'fast',
    system,
    prompt,
    schema: PerTurnFeedbackSchema,
    feature: 'english_speak',
  });

  return feedback;
}

export async function generateSessionSummary(
  transcript: TranscriptTurn[],
  mode: string,
  plan?: string
): Promise<SessionSummary> {
  const system =
    'You are an English fluency coach. Analyze the full conversation and give structured, actionable feedback.';

  const userTurnsText = transcript
    .filter(t => t.role === 'user')
    .map(t => t.content)
    .join('\n\n');

  const prompt = `Analyze this conversation from a non-native English speaker in a ${mode} context.

User's messages (full transcript):
${userTurnsText}

Score the user on:
1. Fluency (0-100): Overall naturalness, flow, and comfort with language
2. Grammar (0-100): Correctness of sentence structure and tense
3. Vocabulary (0-100): Use of varied, natural, context-appropriate words

Identify exactly 3 specific issues the user should work on. For each, provide a clear, actionable instruction (max 120 chars).

Suggest 2-5 vocabulary phrases the user should learn (words, expressions, or idioms). For each, provide:
- phrase: the word/phrase in English
- meaning: what it means (max 100 chars)
- example: how to use it in a sentence (max 150 chars)
- category: one of [Daily Life, Work, Technical, Opinion, Social]

Provide encouraging overall feedback (max 250 chars).`;

  const summary = await aiGenerateObject({
    plan,
    speed: 'primary',
    system,
    prompt,
    schema: SessionSummarySchema,
    feature: 'english_speak',
  });

  return summary;
}
