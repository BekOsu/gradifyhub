import { z } from "zod";
import { aiGenerateObject } from "~/lib/ai/client";

export const QuizSchema = z.object({
  topic: z.string(),
  description: z.string(),
  questions: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      options: z.array(z.string()).length(4),
      correctAnswer: z.number().min(0).max(3),
      explanation: z.string(),
    }),
  ).length(5),
});

export type Quiz = z.infer<typeof QuizSchema>;

export async function generateQuiz(topic: string): Promise<Quiz> {
  const prompt = `
Generate a 5-question quiz about "${topic}".

Requirements:
- Each question has exactly 4 options (A, B, C, D)
- Include correct answer index (0-3 for A-D)
- Include a clear explanation for the correct answer
- Make questions progressively harder (Q1 easy, Q5 hard)
- Quiz difficulty level: intermediate (not trivial, not overly complex)
- Use a variety of question types (definition, application, analysis)

Return valid JSON matching the schema exactly.
`;

  const quiz = await aiGenerateObject({
    model: undefined,
    schema: QuizSchema,
    prompt,
    system:
      "You are an expert quiz generator. Create clear, educational, and engaging questions that help users test their knowledge.",
    userId: undefined,
    feature: "ai_quiz",
  });

  return quiz;
}
