import { eq } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { profile } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { getResume } from "~/actions/resume";
import { ResumeEditor } from "./editor";
import type { ResumeContent } from "~/lib/resume/types";
import { ResumeIntakeForm } from "./intake-form";
import { getGoalLabel } from "~/lib/journey/goals";

export default async function ResumePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const user = await requireAuth();
  const { mode } = await searchParams;

  const userProfile = await db.query.profile.findFirst({
    where: eq(profile.userId, user.id),
    columns: { goal: true },
  });

  const resumeRow = await getResume();
  const showIntake = mode === "intake";

  const goalLabel = userProfile?.goal ? getGoalLabel(userProfile.goal) : null;
  const heading = goalLabel ? `${goalLabel} Resume` : "Resume";

  if (!resumeRow || showIntake) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
        <ResumeIntakeForm hasExistingResume={Boolean(resumeRow)} />
      </div>
    );
  }

  return (
    <ResumeEditor
      resume={{
        id: resumeRow.id,
        title: resumeRow.title,
        content: resumeRow.content as ResumeContent,
        isPublic: resumeRow.isPublic,
        publicSlug: resumeRow.publicSlug ?? null,
      }}
    />
  );
}
