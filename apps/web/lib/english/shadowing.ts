import { z } from 'zod';
import { aiGenerateObject } from '~/lib/ai/client';

export const ShadowingEvaluationSchema = z.object({
  accuracy_score: z.number().int().min(0).max(100),
  pacing_score: z.number().int().min(0).max(100),
  clarity_score: z.number().int().min(0).max(100),
  naturalness_score: z.number().int().min(0).max(100),
  word_scores: z.array(z.object({
    word: z.string(),
    matched: z.boolean(),
  })),
  issues: z.array(z.object({
    title: z.string(),
    instruction: z.string().max(120),
  })).length(3),
  overall_feedback: z.string().max(200),
});

export type ShadowingEvaluation = z.infer<typeof ShadowingEvaluationSchema>;

export async function evaluateShadowing(
  referenceText: string,
  userTranscript: string,
  plan?: string,
): Promise<ShadowingEvaluation> {
  // Handle empty transcript case
  if (!userTranscript.trim()) {
    return {
      accuracy_score: 0,
      pacing_score: 0,
      clarity_score: 0,
      naturalness_score: 0,
      word_scores: referenceText.split(/\s+/).map(word => ({
        word,
        matched: false,
      })),
      issues: [
        {
          title: 'No audio detected',
          instruction: 'Make sure your microphone is enabled and you speak clearly.',
        },
        {
          title: 'Try again',
          instruction: 'Click record, wait for the indicator, then speak the phrase.',
        },
        {
          title: 'Check browser permissions',
          instruction: 'Allow microphone access in your browser settings.',
        },
      ],
      overall_feedback: 'No audio was recorded. Please enable your microphone and try again.',
    };
  }

  // Compare reference words against transcript (case-insensitive)
  const referenceWords = referenceText.split(/\s+/);
  const transcriptLower = userTranscript.toLowerCase();
  const wordScores = referenceWords.map(word => ({
    word,
    matched: transcriptLower.includes(word.toLowerCase()),
  }));

  const system = 'You are a pronunciation and fluency coach for non-native English speakers working in tech. Be encouraging but specific.';

  const prompt = `Evaluate this shadowing attempt:

Reference text: "${referenceText}"

User's transcript: "${userTranscript}"

Word comparison (for your reference):
${wordScores.map(ws => `- "${ws.word}": ${ws.matched ? 'matched' : 'not found'}`).join('\n')}

Score the user on:
1. Accuracy (0-100): How many words from the reference text did they reproduce correctly?
2. Pacing (0-100): Was the speech speed natural and appropriate?
3. Clarity (0-100): How clear and understandable was the pronunciation?
4. Naturalness (0-100): Did the speech sound natural for a non-native speaker at this level?

Identify exactly 3 specific issues the user should work on. For each issue, provide a clear, actionable instruction (max 120 chars).

Provide encouraging overall feedback (max 200 chars).`;

  const result = await aiGenerateObject({
    plan,
    speed: 'fast',
    system,
    prompt,
    schema: ShadowingEvaluationSchema,
    feature: 'english_shadow',
  });

  // Include the computed word_scores in the response
  return {
    ...result,
    word_scores: wordScores,
  };
}
