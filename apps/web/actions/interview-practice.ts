"use server";

import { z } from "zod";
import { eq, and } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { interviewPrepSession } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { aiGenerateObject } from "~/lib/ai/client";
import { MockQuestionsSchema } from "@repo/contracts/interview-prep";
import { getUserPlan } from "~/lib/billing/hasFeature";

const EvaluationSchema = z.object({
  score: z.number().int().min(0).max(100),
  feedback: z.string(),
  exampleAnswer: z.string(),
});

export type EvaluationResult =
  | { success: true; score: number; feedback: string; exampleAnswer: string }
  | { success: false; error: string };

export async function evaluateAnswerAction(
  sessionId: string,
  questionIndex: number,
  userAnswer: string,
): Promise<EvaluationResult> {
  const user = await requireAuth();
  const plan = await getUserPlan(user.id);

  if (!userAnswer.trim() || userAnswer.trim().length < 10) {
    return { success: false, error: "Answer is too short to evaluate." };
  }

  const session = await db.query.interviewPrepSession.findFirst({
    where: and(
      eq(interviewPrepSession.id, sessionId),
      eq(interviewPrepSession.userId, user.id),
    ),
  });

  if (!session || session.status !== "ready") {
    return { success: false, error: "Session not found." };
  }

  const questionsResult = MockQuestionsSchema.safeParse(session.mockQuestions);
  if (!questionsResult.success) {
    return { success: false, error: "Could not load questions." };
  }

  const question = questionsResult.data[questionIndex];
  if (!question) {
    return { success: false, error: "Question not found." };
  }

  const result = await aiGenerateObject({
    plan,
    speed: "fast",
    schema: EvaluationSchema,
    system:
      "You are a senior technical interviewer. Evaluate the candidate's answer honestly and constructively. Score 0-100 where 70+ is a good answer, 50-69 is partial, below 50 needs significant improvement.",
    prompt: `Interview question (${question.type}, ${question.difficulty}):
${question.question}

Hint the candidate had: ${question.hint}

Candidate's answer:
${userAnswer.trim()}

Evaluate this answer. Return:
- score: 0-100 integer
- feedback: 2-3 sentences explaining what was good and what was missing
- exampleAnswer: a concise model answer (3-6 sentences) that would score 90+`,
  });

  return {
    success: true,
    score: result.score,
    feedback: result.feedback,
    exampleAnswer: result.exampleAnswer,
  };
}
