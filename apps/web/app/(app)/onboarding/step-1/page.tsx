import { eq } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { profile } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { getTracks } from "@repo/db/queries/tracks";
import type { TrackMarketData } from "@repo/db/queries/tracks";
import { Step1Form } from "./form";

export default async function OnboardingStep1Page({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const user = await requireAuth();
  const { edit } = await searchParams;

  const [existing, skillGroups, tracks] = await Promise.all([
    db.query.profile.findFirst({ where: eq(profile.userId, user.id), columns: { goal: true } }),
    db.query.skillGroup.findMany(),
    getTracks(),
  ]);

  return (
    <Step1Form
      editMode={edit === "1"}
      defaultGoal={existing?.goal ?? null}
      skillGroups={skillGroups}
      tracks={tracks.map((t) => ({
        value: t.value,
        label: t.label,
        description: t.description,
        icon: t.icon,
        enabled: t.enabled,
        recommended: t.recommended ?? false,
        marketData: (t.marketData as TrackMarketData | null) ?? null,
      }))}
    />
  );
}
