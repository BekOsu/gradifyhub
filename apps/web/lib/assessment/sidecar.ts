import { createHmac } from "node:crypto";

const SIDECAR_URL = process.env.ML_SIDECAR_URL;
const SIDECAR_SECRET = process.env.ML_SHARED_SECRET;

function assertSidecarConfig() {
  if (!SIDECAR_URL) throw new Error("ML_SIDECAR_URL is not configured");
  if (!SIDECAR_SECRET) throw new Error("ML_SHARED_SECRET is not configured");
}

function signBody(body: string): string {
  return createHmac("sha256", SIDECAR_SECRET!).update(body).digest("hex");
}

async function postSidecar<T>(path: string, payload: unknown): Promise<T> {
  assertSidecarConfig();
  const body = JSON.stringify(payload);

  const response = await fetch(`${SIDECAR_URL}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-gradify-signature": signBody(body),
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Sidecar request failed (${response.status}): ${text}`);
  }

  return (await response.json()) as T;
}

export type SidecarProgress = {
  attempt_id: string;
  next_index: number;
  next_item_id?: string | null;
  done: boolean;
};

export async function sidecarStartAttempt(input: {
  attemptId: string;
  userId: string;
  totalQuestions: number;
  itemSequence: string[];
}) {
  return postSidecar<SidecarProgress>("/attempts/start", {
    attempt_id: input.attemptId,
    user_id: input.userId,
    total_questions: input.totalQuestions,
    item_sequence: input.itemSequence,
  });
}

export async function sidecarRespond(input: {
  attemptId: string;
  answeredCount: number;
  totalQuestions: number;
  itemId: string;
  itemSequence: string[];
  isCorrect: boolean | null;
}) {
  return postSidecar<SidecarProgress>(`/attempts/${input.attemptId}/respond`, {
    answered_count: input.answeredCount,
    total_questions: input.totalQuestions,
    item_id: input.itemId,
    item_sequence: input.itemSequence,
    is_correct: input.isCorrect,
  });
}
