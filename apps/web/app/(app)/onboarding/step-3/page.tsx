import { eq } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { profile } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { OnboardingStep3Form } from "./form";
import type { ProfileGoal } from "@repo/contracts/profile";

export default async function OnboardingStep3Page({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const user = await requireAuth();

  const userProfile = await db.query.profile.findFirst({
    where: eq(profile.userId, user.id),
    columns: { goal: true },
  });

  return (
    <OnboardingStep3Form
      editMode={edit === "1"}
      goal={(userProfile?.goal as ProfileGoal) ?? null}
    />
  );
}
