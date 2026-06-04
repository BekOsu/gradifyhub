import { z } from "zod";
import { aiGenerateObject } from "~/lib/ai/client";

export type ExtractedVocabItem = {
  phrase: string;
  meaning: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  example: string;
  frequencyScore: number;
  technicalRelevance: number;
};

export async function extractVocabulary(
  chunk: string,
  userContext: { plan: string; userId: string; category?: string }
): Promise<ExtractedVocabItem[]> {
  const schema = z.object({
    items: z.array(
      z.object({
        phrase: z.string(),
        meaning: z.string(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]),
        category: z.enum(["Daily Life", "Work", "Technical", "Opinion", "Social"]),
        example: z.string(),
        frequencyScore: z.number().int().min(1).max(10),
        technicalRelevance: z.number().int().min(1).max(10),
      })
    ),
  });

  const result = await aiGenerateObject({
    plan: userContext.plan,
    speed: "fast",
    userId: userContext.userId,
    feature: "english_mining",
    system: `You are an English vocabulary coach for tech professionals.
Extract useful English phrases and expressions from the provided text.
Focus on: idioms, collocations, professional phrases, transitional language, and useful expressions.
Do NOT extract basic words a learner already knows (the, a, is, etc).
Extract 5-15 items per chunk. Each item must have a clear, concise meaning explanation.`,
    prompt: `Extract useful English vocabulary from this text:\n\n${chunk}`,
    schema,
  });

  return result.items;
}
