"use server";

import { requireAuth } from "~/lib/auth/session";
import { getUserPlan } from "~/lib/billing/hasFeature";
import { getQuizUsageToday, logQuizGeneration, submitQuiz } from "@repo/db/queries/quiz";
import { generateQuiz as generateQuizContent } from "~/lib/quiz/generate";
import { completeLesson } from "~/actions/learn";
import type { Quiz } from "~/lib/quiz/generate";

export async function generateQuiz(topic: string): Promise<
  | {
      success: true;
      quiz: Quiz;
      remaining: number | null;
    }
  | {
      error: string;
      code: "QUIZ_LIMIT_EXCEEDED" | "GENERATION_FAILED";
      used?: number;
      limit?: number;
    }
> {
  const user = await requireAuth();

  // Check daily limit for free users
  const plan = await getUserPlan(user.id);
  if (plan === "free") {
    const usedToday = await getQuizUsageToday(user.id);
    if (usedToday >= 2) {
      return {
        error:
          "Daily limit reached (2/2). Upgrade to Pro for unlimited quizzes.",
        code: "QUIZ_LIMIT_EXCEEDED",
        used: 2,
        limit: 2,
      };
    }
  }

  // Generate quiz
  try {
    const quiz = await generateQuizContent(topic);

    // Log usage
    await logQuizGeneration(user.id, topic);

    // Calculate remaining for free users (add 1 because we just logged this quiz)
    const remaining =
      plan === "free" ? Math.max(0, 2 - (await getQuizUsageToday(user.id)) - 1) : null;

    return {
      success: true,
      quiz,
      remaining,
    };
  } catch (error) {
    console.error("[quiz] generation failed:", error);
    return {
      error: "Failed to generate quiz. Try again.",
      code: "GENERATION_FAILED",
    };
  }
}

export async function submitQuizAnswers(
  lessonId: string,
  answers: Record<string, string>,
  quizzes: Array<{ id: string; choices: Array<{ id: string; correct: boolean }> }>,
): Promise<
  | { success: true; score: number; maxScore: number; passed: boolean }
  | { success: false; error: string }
> {
  const user = await requireAuth();

  try {
    // Validate that all quizzes have answers
    if (quizzes.some((q) => !answers[q.id])) {
      return { success: false, error: "All questions must be answered" };
    }

    // Calculate score by counting correct answers
    let correctCount = 0;
    for (const q of quizzes) {
      const selectedChoiceId = answers[q.id];
      const choice = q.choices.find((c) => c.id === selectedChoiceId);
      if (choice?.correct) {
        correctCount++;
      }
    }

    const score = Math.round((correctCount / quizzes.length) * 100);
    const maxScore = 100;

    // Submit to database
    await submitQuiz(user.id, lessonId, answers, score);

    // Update lesson progress if score >= 70%
    const passed = score >= 70;
    if (passed) {
      await completeLesson(lessonId, score);
    }

    return {
      success: true,
      score,
      maxScore,
      passed,
    };
  } catch (error) {
    console.error("[quiz] submission failed:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMsg };
  }
}
