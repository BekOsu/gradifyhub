import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { eq, and, isNotNull } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { attempt, response, profile } from "@repo/db/schema";
import { getUserRoadmap } from "@repo/db/queries/roadmap";
import { requireAuth } from "~/lib/auth/session";
import { getUserPlan } from "~/lib/billing/hasFeature";
import { scoreResponses, DIMENSION_LABELS } from "~/lib/ai/assessment";
import { generateRoadmap } from "~/lib/ai/roadmap";
import { seedAiRoadmap } from "~/actions/roadmap";
import { needsRoadmapRefresh } from "~/lib/roadmap/staleness";
import { getFoundationData } from "~/lib/foundation/storage";
import { seedRoadmapAiCurriculum } from "~/lib/seed/roadmap-ai-curriculum";
import { getGoalLabel } from "~/lib/journey/goals";

export default async function RoadmapGeneratePage({
  searchParams,
}: {
  searchParams: Promise<{ refresh?: string }>;
}) {
  const user = await requireAuth();
  const { refresh } = await searchParams;

  // Free users get their first roadmap. Regeneration (roadmap already exists) requires Pro+.
  const [existingRoadmap, plan, userProfile, completedAttempt, foundationData] = await Promise.all([
    getUserRoadmap(user.id),
    getUserPlan(user.id),
    db.query.profile.findFirst({
      where: eq(profile.userId, user.id),
    }),
    db.query.attempt.findFirst({
      where: and(eq(attempt.userId, user.id), isNotNull(attempt.completedAt)),
      orderBy: (a, { desc }) => [desc(a.completedAt)],
    }),
    getFoundationData(user.id),
  ]);

  // Strict gate: roadmap generation is assessment-first.
  if (!completedAttempt) redirect("/assessment");

  // Strict gate: goal mismatch requires reassessment first.
  if (userProfile?.goal && completedAttempt.attemptGoal && completedAttempt.attemptGoal !== userProfile.goal) {
    redirect("/assessment?refresh=preferences");
  }

  const refreshRequired = needsRoadmapRefresh(
    userProfile?.updatedAt,
    existingRoadmap?.updatedAt,
    completedAttempt.completedAt,
  );

  if (existingRoadmap && plan === "free" && !refreshRequired) {
    redirect("/pricing");
  }

  // For AI engineer track, use the pre-built curriculum roadmap
  const isAiTrack =
    userProfile?.goal === "ai_ml_engineer" ||
    userProfile?.goal === "land_first_ai_role" ||
    userProfile?.goal === "ml_research_to_production" ||
    userProfile?.goal === "software_to_ai" ||
    userProfile?.goal === "freelance_ai_engineer";

  if (isAiTrack) {
    // Ensure curriculum roadmap is seeded
    await seedRoadmapAiCurriculum();
    redirect("/roadmap");
  }

  const storedScores = completedAttempt.knowledgeScores;
  const scores =
    storedScores && Object.keys(storedScores).length > 0
      ? Object.entries(storedScores).map(([dimension, score]) => ({
          dimension,
          label: DIMENSION_LABELS[dimension] ?? dimension,
          score,
        }))
      : scoreResponses(
          (
            await db.query.response.findMany({
              where: eq(response.attemptId, completedAttempt.id),
            })
          ).map((r) => ({ itemId: r.itemId, choiceId: r.choiceId })),
        );

  // Read HITL #1 confirmed signals and clear the cookie
  const cookieStore = await cookies();
  const rawSignals = cookieStore.get("profile_signals")?.value;
  let humanSignals: Parameters<typeof generateRoadmap>[0]["humanSignals"];
  if (rawSignals) {
    try {
      humanSignals = JSON.parse(rawSignals) as typeof humanSignals;
    } catch {
      // malformed cookie — ignore
    }
    cookieStore.delete("profile_signals");
  }

  let generated;
  try {
    generated = await generateRoadmap({
      scores,
      plan,
      goal: userProfile?.goal ?? "full_stack_engineer",
      targetTimeline: userProfile?.targetTimeline ?? "6 months",
      hoursPerDay: userProfile?.hoursPerDay ?? "2",
      daysPerWeek: userProfile?.daysPerWeek ?? "5",
      humanSignals,
      earnedLevels: userProfile?.earnedLevels as Record<string, number> | null,
      userContext: {
        currentRole: userProfile?.currentRole,
        yearsOfExperience: userProfile?.yearsOfExperience,
        knownStack: userProfile?.knownStack as {
          languages?: string[];
          frameworks?: string[];
          custom?: string;
        } | null,
      },
      foundationSignals: foundationData
        ? {
            foundationCheckScore: foundationData.checkScore,
            foundationPathCompleted: !!foundationData.pathCompletedAt,
          }
        : undefined,
    });
  } catch (err) {
    console.error("[roadmap/generate] LLM generation failed:", err);
    return (
      <div className="mx-auto max-w-md space-y-4 py-20 text-center">
        <p className="text-sm font-semibold">
          {userProfile?.goal
            ? `Building your ${getGoalLabel(userProfile.goal)} Roadmap failed`
            : "Building your Roadmap failed"}
        </p>
        <p className="text-xs text-muted-foreground">
          Your {userProfile?.goal ? `${getGoalLabel(userProfile.goal)} ` : ""}Roadmap could not be generated right now. Your Assessment results are saved — please try again.
        </p>
        <Link
          href="/roadmap/generate"
          className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </Link>
      </div>
    );
  }

  await seedAiRoadmap(user.id, generated);

  redirect(refresh === "preferences" ? "/roadmap?updated=preferences" : "/roadmap");
}
