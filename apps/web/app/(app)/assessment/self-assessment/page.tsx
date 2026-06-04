import { redirect } from "next/navigation";
import Link from "next/link";
import { eq, and, isNotNull } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { attempt, profile } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { getTrackKnowledge } from "~/lib/journey/engineering-knowledge";
import { SelfAssessmentForm } from "./_components/SelfAssessmentForm";

export default async function SelfAssessmentPage() {
  const user = await requireAuth();

  const [userProfile, completedAttempt] = await Promise.all([
    db.query.profile.findFirst({ where: eq(profile.userId, user.id) }),
    db.query.attempt.findFirst({
      where: and(eq(attempt.userId, user.id), isNotNull(attempt.completedAt)),
      orderBy: (a, { desc }) => [desc(a.completedAt)],
    }),
  ]);

  if (!completedAttempt) redirect("/assessment");

  const track = getTrackKnowledge(userProfile?.goal);
  const mcqScores = completedAttempt.knowledgeScores as Record<string, number> | null;
  const existingLevels = userProfile?.earnedLevels as Record<string, number> | null;

  const dimensions = track.dimensions.map((d) => ({
    key: d.key,
    label: d.label,
    isCritical: d.isCritical,
    levels: d.levels,
    mcqScore: mcqScores?.[d.key],
    existingLevel: existingLevels?.[d.key],
  }));

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-10">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/assessment/history" className="hover:text-foreground">
            Assessment
          </Link>
          <span>/</span>
          <span>Self-Assessment</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Self-Assessment</h1>
        <p className="text-sm text-muted-foreground">
          For each skill in the{" "}
          <span className="font-medium text-foreground">{track.trackLabel}</span> track, pick the
          highest level that honestly describes where you are. Your answers are combined with your
          MCQ score to calibrate your personalised roadmap.
        </p>
      </div>

      <SelfAssessmentForm dimensions={dimensions} />
    </div>
  );
}
