"use server";
import { requireAuth } from "~/lib/auth/session";
import { db } from "@repo/db/client";
import { profile } from "@repo/db/schema";
import type { AiCalibration } from "@repo/db/schema";
import { eq } from "@repo/db/drizzle";
import { revalidatePath } from "next/cache";

const ALLOWED_OUTCOMES = ["hired", "promoted", "freelance", "salary"] as const;
type Outcome = (typeof ALLOWED_OUTCOMES)[number];

export async function recordOutcomeAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const user = await requireAuth();
  const outcome = formData.get("outcome") as string;

  if (!(ALLOWED_OUTCOMES as readonly string[]).includes(outcome)) {
    return { error: "Invalid outcome value." };
  }

  try {
    const existing = await db.query.profile.findFirst({
      where: eq(profile.userId, user.id),
      columns: { aiCalibration: true },
    });

    if (!existing) {
      return { error: "Profile not found. Complete onboarding first." };
    }

    const current = (existing.aiCalibration ?? {}) as Partial<AiCalibration>;
    await db
      .update(profile)
      .set({
        aiCalibration: {
          ...current,
          outcome: outcome as Outcome,
          outcomeRecordedAt: new Date().toISOString(),
        } as AiCalibration,
      })
      .where(eq(profile.userId, user.id));

    revalidatePath("/account");
    return {};
  } catch (err) {
    console.error("[recordOutcomeAction]", err);
    return { error: "Something went wrong. Please try again." };
  }
}
