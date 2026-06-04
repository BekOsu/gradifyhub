import { eq } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { profile } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { KnownStackSchema } from "@repo/contracts/profile";
import type { AiCalibration } from "@repo/contracts/profile";
import { Step2Form } from "./form";

export default async function OnboardingStep2Page({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const user = await requireAuth();
  const { edit } = await searchParams;

  const existing = await db.query.profile.findFirst({
    where: eq(profile.userId, user.id),
  });

  const knownStack = existing?.knownStack
    ? KnownStackSchema.parse(existing.knownStack)
    : null;

  const defaultAiCalibration = existing?.aiCalibration
    ? (existing.aiCalibration as AiCalibration)
    : null;

  return (
    <Step2Form
      editMode={edit === "1"}
      defaultGoal={existing?.goal ?? null}
      defaultValues={
        existing
          ? {
              currentRole: existing.currentRole ?? "",
              yearsOfExperience: existing.yearsOfExperience ?? "",
              targetTimeline: existing.targetTimeline ?? "",
              hoursPerDay: existing.hoursPerDay ?? "",
              daysPerWeek: existing.daysPerWeek ?? "",
            }
          : null
      }
      defaultKnownStack={knownStack}
      defaultAiCalibration={defaultAiCalibration}
    />
  );
}
