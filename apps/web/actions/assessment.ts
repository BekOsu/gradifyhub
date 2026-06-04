"use server";

import { eq, and, isNull, inArray } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { attempt, item, profile, response } from "@repo/db/schema";
import {
  SubmitResponseInput,
  SaveAnswerInput,
  SkipQuestionInput,
  AbandonAttemptInput,
} from "@repo/contracts/assessment";
import { requireAuth } from "~/lib/auth/session";
import { logAdminAction } from "~/lib/admin/audit";
import { MOCK_ITEMS, MOCK_TOTAL, MOCK_ITEM_IDS } from "~/lib/assessment/mock";
import { sidecarRespond } from "~/lib/assessment/sidecar";
import { funnel } from "~/lib/analytics";
import { ASSESSMENT_CONFIG } from "~/lib/assessment/time-config";
import { loadRealItemSequence } from "~/lib/assessment/load-items";

async function storeKnowledgeScores(
  attemptId: string,
  scores: Array<{ dimension: string; score: number }>,
): Promise<void> {
  const knowledgeScores = Object.fromEntries(scores.map((s) => [s.dimension, s.score]));
  await db.update(attempt).set({ knowledgeScores }).where(eq(attempt.id, attemptId));
}

const USE_MOCK = process.env.ASSESSMENT_MODE !== "real";
const REAL_TOTAL = Number(process.env.ASSESSMENT_QUESTION_LIMIT ?? 15);
const TOTAL_QUESTIONS = USE_MOCK ? MOCK_TOTAL : REAL_TOTAL;


// Scores attempt responses using mock items (AI track) or real DB items (all other tracks).
async function computeScoresForAttempt(
  userId: string,
  responses: Array<{ itemId: string; choiceId: string }>,
) {
  if (USE_MOCK) {
    const { scoreResponses } = await import("~/lib/ai/assessment");
    return scoreResponses(responses);
  }

  if (responses.length === 0) return [];

  const itemIds = responses.map((r) => r.itemId);
  const [dbItems, userProfile] = await Promise.all([
    db
      .select({ id: item.id, dimension: item.dimension, choices: item.choices })
      .from(item)
      .where(inArray(item.id, itemIds)),
    db.query.profile.findFirst({ where: eq(profile.userId, userId) }),
  ]);

  const { getTrackKnowledge } = await import("~/lib/journey/engineering-knowledge");
  const { scoreResponsesFromItems } = await import("~/lib/ai/assessment");
  const trackDimensions = getTrackKnowledge(userProfile?.goal).dimensions;

  return scoreResponsesFromItems(
    responses,
    dbItems.map((i) => ({ id: i.id, dimension: i.dimension, choices: i.choices })),
    trackDimensions.map((d) => ({ key: d.key, label: d.label })),
  );
}

function evaluateCorrectness(
  choices: unknown,
  choiceId: string
): boolean | null {
  if (!Array.isArray(choices)) return null;
  const selected = choices.find(
    (c): c is { id: string; correct?: boolean } =>
      typeof c === "object" && c !== null && "id" in c && (c as { id?: unknown }).id === choiceId
  );
  if (!selected || typeof selected.correct !== "boolean") return null;
  return selected.correct;
}

export async function startAttempt() {
  const user = await requireAuth();

  const existing = await db.query.attempt.findFirst({
    where: and(eq(attempt.userId, user.id), isNull(attempt.completedAt)),
  });

  if (existing) {
    const responses = await db.query.response.findMany({
      where: eq(response.attemptId, existing.id),
    });
    return { attemptId: existing.id, currentIndex: responses.length };
  }

  const userProfile = await db.query.profile.findFirst({ where: eq(profile.userId, user.id) });
  const id = crypto.randomUUID();
  let itemSequence: string[];
  if (USE_MOCK) {
    itemSequence = MOCK_ITEM_IDS;
  } else {
    itemSequence = await loadRealItemSequence(REAL_TOTAL, userProfile?.goal, userProfile?.aiCalibration);
  }

   await db.insert(attempt).values({
     id,
     userId: user.id,
     itemSequence,
     attemptGoal: userProfile?.goal ?? null,
   });

   // Track analytics
   funnel.assessmentStarted(user.id, id).catch((err) => console.error("[analytics] assessment_started failed:", err));

   return { attemptId: id, currentIndex: 0 };
}

export async function saveAnswer(input: unknown) {
  const user = await requireAuth();
  const parsed = SaveAnswerInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const { attemptId, itemId, choiceId, skipped, timeMs } = parsed.data;

  const existingAttempt = await db.query.attempt.findFirst({
    where: and(eq(attempt.id, attemptId), eq(attempt.userId, user.id)),
  });
  if (!existingAttempt) {
    return { success: false, error: "Attempt not found." };
  }

  try {
    const existingResponse = await db.query.response.findFirst({
      where: and(eq(response.attemptId, attemptId), eq(response.itemId, itemId)),
    });

    if (existingResponse) {
      await db
        .update(response)
        .set({
          choiceId,
          skipped: skipped ?? false,
          timeMs: timeMs ?? null,
          updatedAt: new Date(),
        })
        .where(eq(response.id, existingResponse.id));
    } else {
      await db.insert(response).values({
        id: crypto.randomUUID(),
        attemptId,
        itemId,
        choiceId,
        skipped: skipped ?? false,
        timeMs: timeMs ?? null,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("[assessment] save answer failed:", error);
    return { success: false, error: "We could not save this answer. Please try again." };
  }
}

export async function submitResponse(input: unknown) {
  const user = await requireAuth();
  const parsed = SubmitResponseInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const { attemptId, itemId, choiceId, timeMs } = parsed.data;
  let isCorrectForSidecar: boolean | null = null;

  const existingAttempt = await db.query.attempt.findFirst({
    where: and(eq(attempt.id, attemptId), eq(attempt.userId, user.id)),
  });
  if (!existingAttempt) return { success: false, error: "Attempt not found." };

  try {
    let isCorrect: boolean | null = null;

    if (USE_MOCK) {
      const mockItem = MOCK_ITEMS.find((candidate) => candidate.id === itemId);
      if (!mockItem) {
        return { success: false, error: "Question not found." };
      }

      const existingItem = await db.query.item.findFirst({
        where: eq(item.id, itemId),
      });

      if (!existingItem) {
        await db.insert(item).values({
          id: mockItem.id,
          stem: mockItem.stem,
          choices: mockItem.choices,
          dimension: mockItem.dimension,
        });
      }

      isCorrect = evaluateCorrectness(mockItem.choices, choiceId);
    } else {
      const dbItem = await db.query.item.findFirst({ where: eq(item.id, itemId) });
      if (!dbItem) {
        return { success: false, error: "Question not found in item bank." };
      }
      isCorrect = evaluateCorrectness(dbItem.choices, choiceId);
    }

    // Save the answer using internal saveAnswer logic
    const existingResponse = await db.query.response.findFirst({
      where: and(eq(response.attemptId, attemptId), eq(response.itemId, itemId)),
    });

    if (existingResponse) {
      await db
        .update(response)
        .set({
          choiceId,
          skipped: false,
          timeMs: timeMs ?? null,
          updatedAt: new Date(),
        })
        .where(eq(response.id, existingResponse.id));
    } else {
      await db.insert(response).values({
        id: crypto.randomUUID(),
        attemptId,
        itemId,
        choiceId,
        skipped: false,
        timeMs: timeMs ?? null,
      });
    }

    if (!USE_MOCK) {
      isCorrectForSidecar = isCorrect;
    }
  } catch (error) {
    console.error("[assessment] submit response failed:", error);
    return { success: false, error: "We could not save this answer. Please try again." };
  }

  const responses = await db.query.response.findMany({
    where: eq(response.attemptId, attemptId),
  });

  // Filter out skipped questions to check if all required (non-skipped) are answered
  const answeredResponses = responses.filter((r) => !r.skipped && r.choiceId);

  const itemSequence = Array.isArray(existingAttempt.itemSequence)
    ? (existingAttempt.itemSequence as string[])
    : [];

  // Use the actual sequence length — the DB may return fewer items than TOTAL_QUESTIONS
  // if the difficulty band has fewer questions available.
  const sequenceTotal = itemSequence.length > 0 ? itemSequence.length : TOTAL_QUESTIONS;
  let done = answeredResponses.length >= sequenceTotal;
  let nextIndex = responses.length;

  if (!USE_MOCK && process.env.ML_SIDECAR_URL) {
    try {
      const sidecar = await sidecarRespond({
        attemptId,
        answeredCount: answeredResponses.length,
        totalQuestions: TOTAL_QUESTIONS,
        itemId,
        itemSequence,
        isCorrect: isCorrectForSidecar,
      });
      done = sidecar.done;

      if (sidecar.next_item_id) {
        const idx = itemSequence.indexOf(sidecar.next_item_id);
        nextIndex = idx >= 0 ? idx : sidecar.next_index;
      } else {
        nextIndex = sidecar.next_index;
      }
    } catch (error) {
      console.error("[assessment] sidecar respond failed (non-fatal):", error);
      // Fall through to sequential delivery — done/nextIndex already set above
    }
  }

  if (done) {
    await db
      .update(attempt)
      .set({ completedAt: new Date(), status: "completed" })
      .where(eq(attempt.id, attemptId));

    const scores = await computeScoresForAttempt(
      user.id,
      responses.map((r) => ({ itemId: r.itemId, choiceId: r.choiceId })),
    );

    await storeKnowledgeScores(attemptId, scores);

    const top = scores.reduce((best, s) => (s.score > best.score ? s : best), scores[0]!);

    const { sendAssessmentCompleteEmail } = await import("~/lib/email/resend");

    sendAssessmentCompleteEmail({
      to: user.email,
      name: user.name,
      topSkill: top.label,
      nextStep: "Your personalised roadmap is ready",
    }).catch((err) => console.error("[email] assessment complete failed:", err));

    // Track analytics
    funnel.assessmentCompleted(user.id, attemptId, top.label).catch((err) =>
      console.error("[analytics] assessment_completed failed:", err)
    );

    return { success: true, done: true, attemptId };
  }

  return { success: true, done: false, nextIndex };
}

export async function skipQuestion(input: unknown) {
  const user = await requireAuth();
  const parsed = SkipQuestionInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const { attemptId, itemId } = parsed.data;

  const existingAttempt = await db.query.attempt.findFirst({
    where: and(eq(attempt.id, attemptId), eq(attempt.userId, user.id)),
  });
  if (!existingAttempt) {
    return { success: false, error: "Attempt not found." };
  }

  try {
    const existingResponse = await db.query.response.findFirst({
      where: and(eq(response.attemptId, attemptId), eq(response.itemId, itemId)),
    });

    if (existingResponse) {
      await db
        .update(response)
        .set({ skipped: true, updatedAt: new Date() })
        .where(eq(response.id, existingResponse.id));
    } else {
      await db.insert(response).values({
        id: crypto.randomUUID(),
        attemptId,
        itemId,
        choiceId: "",
        skipped: true,
      });
    }

    logAdminAction({
      adminId: user.id,
      adminEmail: user.email,
      action: "assessment_skip_question",
      targetUserId: user.id,
      targetUserEmail: user.email,
      details: { attemptId, itemId },
    });

    return { success: true };
  } catch (error) {
    console.error("[assessment] skip question failed:", error);
    return { success: false, error: "We could not skip this question. Please try again." };
  }
}

export async function getCompletedAttempt(userId: string) {
  return db.query.attempt.findFirst({
    where: and(eq(attempt.userId, userId)),
    orderBy: (a, { desc }) => [desc(a.completedAt)],
  });
}

export async function submitFinalResponse(attemptId: string) {
  const user = await requireAuth();

  const record = await db.query.attempt.findFirst({
    where: and(eq(attempt.id, attemptId), eq(attempt.userId, user.id)),
  });

  if (!record) {
    return { success: false, error: "Attempt not found." };
  }

  if (record.completedAt) {
    return { success: false, error: "Attempt already completed." };
  }

  await db
    .update(attempt)
    .set({ completedAt: new Date(), status: "completed" })
    .where(eq(attempt.id, attemptId));

  const responses = await db.query.response.findMany({
    where: eq(response.attemptId, attemptId),
  });

  const { sendAssessmentCompleteEmail } = await import("~/lib/email/resend");

  if (responses.length > 0) {
    const scores = await computeScoresForAttempt(
      user.id,
      responses.map((r) => ({ itemId: r.itemId, choiceId: r.choiceId })),
    );

    await storeKnowledgeScores(attemptId, scores);

    const topScore = scores.reduce((best, s) => (s.score > best.score ? s : best), scores[0]!);

    sendAssessmentCompleteEmail({
      to: user.email,
      name: user.name,
      topSkill: topScore.label,
      nextStep: "Your personalised roadmap is ready",
    }).catch((err) => console.error("[email] assessment complete failed:", err));

    funnel.assessmentCompleted(user.id, attemptId, topScore.label).catch((err) =>
      console.error("[analytics] assessment_completed failed:", err)
    );
  }

  return { success: true, attemptId };
}


export async function checkTimeExpired(attemptId: string): Promise<{
  expired: boolean;
  remainingMs: number;
  error?: string;
}> {
  const user = await requireAuth();

  const record = await db.query.attempt.findFirst({
    where: and(eq(attempt.id, attemptId), eq(attempt.userId, user.id)),
  });

  if (!record) {
    return { expired: false, remainingMs: 0, error: "Attempt not found." };
  }

  // Note: timeExpiredAt will be populated after schema migration
  // For now, calculate based on startedAt + ASSESSMENT_CONFIG.totalTimeMs
  const timeExpiredAt = record.startedAt.getTime() + ASSESSMENT_CONFIG.totalTimeMs;
  const now = Date.now();
  const totalPauseMs = record.totalPauseMs ?? 0;

  const remainingMs = Math.max(0, timeExpiredAt - now - totalPauseMs);
  const expired = remainingMs === 0;

  if (expired && !record.completedAt) {
    // Auto-submit on expiry
    try {
      await finishAttempt(attemptId);
    } catch (err) {
      console.error("[assessment] auto-submit on time expiry failed:", err);
    }
  }

  return { expired, remainingMs };
}

export async function calculateTimeRemaining(attemptId: string): Promise<{
  remainingMs: number;
  displayTime: string;
}> {
  const user = await requireAuth();

  const record = await db.query.attempt.findFirst({
    where: and(eq(attempt.id, attemptId), eq(attempt.userId, user.id)),
  });

  if (!record) {
    return { remainingMs: 0, displayTime: "00:00" };
  }

  const timeExpiredAt = record.startedAt.getTime() + ASSESSMENT_CONFIG.totalTimeMs;
  const now = Date.now();
  const totalPauseMs = record.totalPauseMs ?? 0;

  const remainingMs = Math.max(0, timeExpiredAt - now - totalPauseMs);
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const displayTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return { remainingMs, displayTime };
}

export async function finishAttempt(attemptId: string) {
  const user = await requireAuth();

  const record = await db.query.attempt.findFirst({
    where: and(eq(attempt.id, attemptId), eq(attempt.userId, user.id)),
  });

  if (!record) {
    return { success: false, error: "Attempt not found." };
  }

  if (record.completedAt) {
    return { success: false, error: "Attempt already completed." };
  }

  try {
    const now = new Date();
    const totalPauseMs = record.totalPauseMs ?? 0;
    const timeUsedMs = now.getTime() - record.startedAt.getTime() - totalPauseMs;

    await db
      .update(attempt)
      .set({ completedAt: now, status: "completed" })
      .where(eq(attempt.id, attemptId));

    const responses = await db.query.response.findMany({
      where: eq(response.attemptId, attemptId),
    });

    const { sendAssessmentCompleteEmail } = await import("~/lib/email/resend");

    if (responses.length > 0) {
      const scores = await computeScoresForAttempt(
        user.id,
        responses.map((r) => ({ itemId: r.itemId, choiceId: r.choiceId })),
      );

      await storeKnowledgeScores(attemptId, scores);

      const topScore = scores.reduce((best, s) => (s.score > best.score ? s : best), scores[0]!);

      sendAssessmentCompleteEmail({
        to: user.email,
        name: user.name,
        topSkill: topScore.label,
        nextStep: "Your personalised roadmap is ready",
      }).catch((err) => console.error("[email] assessment complete failed:", err));

      funnel.assessmentCompleted(user.id, attemptId, topScore.label).catch((err) =>
        console.error("[analytics] assessment_completed failed:", err)
      );
    }

    return { success: true, attemptId, timeUsedMs };
  } catch (error) {
    console.error("[assessment] finish attempt failed:", error);
    return { success: false, error: "We could not submit your assessment. Please try again." };
  }
}


export async function abandonAttempt(input: unknown) {
  const user = await requireAuth();
  const parsed = AbandonAttemptInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const { attemptId } = parsed.data;

  const record = await db.query.attempt.findFirst({
    where: and(eq(attempt.id, attemptId), eq(attempt.userId, user.id)),
  });

  if (!record) {
    return { success: false, error: "Attempt not found." };
  }

  if (record.completedAt) {
    return { success: false, error: "Attempt already completed." };
  }

  await db.update(attempt).set({ status: "abandoned", completedAt: new Date() }).where(eq(attempt.id, attemptId));

  return { success: true };
}
