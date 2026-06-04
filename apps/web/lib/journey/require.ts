import { redirect } from "next/navigation";
import { and, eq, isNotNull } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { attempt, profile, type AiCalibration } from "@repo/db/schema";

export async function requireAssessment(userId: string, from?: "learn" | "roadmap"): Promise<void> {
  // Check if user has completed a main assessment
  const completedAttempt = await db.query.attempt.findFirst({
    where: and(eq(attempt.userId, userId), isNotNull(attempt.completedAt)),
    columns: { id: true },
  });
  
  if (completedAttempt) {
    return; // User has completed assessment, allow access
  }

  // Check if user is in foundation-path flow (has foundation-check score)
  const userProfile = await db.query.profile.findFirst({
    where: eq(profile.userId, userId),
    columns: { aiCalibration: true },
  });

  const aiCalib = (userProfile?.aiCalibration as AiCalibration & Record<string, unknown>) || {};
  const foundationCheckScore = aiCalib?.foundationCheckScore as number | undefined;

  if (foundationCheckScore !== undefined) {
    return; // User is in foundation flow, allow access to /learn for foundation-path lessons
  }

  // User hasn't completed assessment and isn't in foundation flow → require assessment
  redirect(from ? `/assessment?gate=${from}` : "/assessment");
}
