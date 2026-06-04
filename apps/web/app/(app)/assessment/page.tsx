import { redirect } from "next/navigation";
import Link from "next/link";
import { eq, and, isNotNull, isNull } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { attempt, profile, type AiCalibration } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { isAttemptStale, needsAssessmentRefresh } from "~/lib/assessment/staleness";
import { StartAssessmentButton } from "./start-button";
import { ResetAssessmentButton } from "./reset-button";
import { getDimensionDetails } from "~/lib/journey/assessment-dimensions";
import { getGoalLabel } from "~/lib/journey/goals";
import { scoreToIdentityLevel } from "~/lib/journey/identity-level";
import {
  Target, Map, ArrowRight, CheckCircle2,
  Clock,
} from "lucide-react";

type ProfileLike = { currentRole?: string | null; goal?: string | null };

function getRelevantDimensions(
  userProfile: ProfileLike | null | undefined,
  allDimLabels: string[],
): Set<string> {
  if (!userProfile) return new Set();

  const goal = userProfile.goal ?? "";
  const role = (userProfile.currentRole ?? "").toLowerCase();

  const isAiGoal = [
    "ai_ml_engineer", "land_first_ai_role", "ml_research_to_production",
    "software_to_ai", "freelance_ai_engineer",
  ].includes(goal);

  if (!isAiGoal) {
    return new Set(allDimLabels.slice(0, 3));
  }

  const relevant = new Set<string>();

  if (/^student/.test(role)) {
    relevant.add("Python for AI");
    relevant.add("AI/ML Concepts");
    if (/computer science|engineering/.test(role)) relevant.add("LLM API & Prompting");
    if (/math|physics|data/.test(role)) relevant.add("RAG & Retrieval");
  }
  if (/^software developer/.test(role)) {
    relevant.add("Python for AI");
    relevant.add("LLM API & Prompting");
    relevant.add("Agentic Patterns");
  }
  if (/^it administrator/.test(role)) {
    relevant.add("System Design");
    relevant.add("Tooling & Dev Workflow");
    relevant.add("Python for AI");
  }
  if (/^data analyst/.test(role)) {
    relevant.add("AI/ML Concepts");
    relevant.add("Python for AI");
    relevant.add("RAG & Retrieval");
  }
  if (/^researcher/.test(role)) {
    relevant.add("AI/ML Concepts");
    relevant.add("Python for AI");
    relevant.add("System Design");
  }
  if (/^business professional/.test(role)) {
    relevant.add("Python for AI");
    relevant.add("LLM API & Prompting");
    relevant.add("Soft Skills");
  }
  if (/^career changer|^product designer|^other background/.test(role)) {
    relevant.add("Python for AI");
    relevant.add("LLM API & Prompting");
    relevant.add("Soft Skills");
  }
  relevant.add("LLM API & Prompting");
  relevant.add("RAG & Retrieval");
  relevant.add("Agentic Patterns");

  return relevant;
}

export default async function AssessmentPage({
  searchParams,
}: {
  searchParams: Promise<{ refresh?: string; gate?: string; track?: string }>;
}) {
  const user = await requireAuth();
  const { refresh, gate, track } = await searchParams;

  // ── Track-specific entry points ──────────────────────────────────────────
  // SS and English tracks have their own foundation-check / roadmap flows.
  // Redirect users who arrive at /assessment?track=soft-skills|english-proficiency.
  if (track === "soft-skills" || track === "english-proficiency") {
    const userProfile = await db.query.profile.findFirst({
      where: eq(profile.userId, user.id),
      columns: { aiCalibration: true },
    });

    const aiCalib = (userProfile?.aiCalibration as Record<string, unknown>) || {};

    if (track === "soft-skills") {
      const hasCompletedPath = aiCalib?.ssFoundationPathCompletedAt !== undefined;
      const checkScore = aiCalib?.ssFoundationCheckScore as number | undefined;
      const mustDoPath = checkScore !== undefined && checkScore < 3 && !hasCompletedPath;

      if (checkScore === undefined) redirect("/assessment/foundation-check-ss");
      if (mustDoPath) redirect("/assessment/foundation-path-ss");
      redirect("/roadmap?track=soft-skills");
    }

    if (track === "english-proficiency") {
      const hasCompletedPath = aiCalib?.engFoundationPathCompletedAt !== undefined;
      const checkScore = aiCalib?.engFoundationCheckScore as number | undefined;
      const mustDoPath = checkScore !== undefined && checkScore < 3 && !hasCompletedPath;

      if (checkScore === undefined) redirect("/assessment/foundation-check-eng");
      if (mustDoPath) redirect("/assessment/foundation-path-eng");
      redirect("/roadmap?track=english-proficiency");
    }
  }

  const [userProfile, completed, inProgress, allAttempts] = await Promise.all([
    db.query.profile.findFirst({ where: eq(profile.userId, user.id) }),
    db.query.attempt.findFirst({
      where: and(eq(attempt.userId, user.id), isNotNull(attempt.completedAt)),
      orderBy: (a, { desc }) => [desc(a.completedAt)],
    }),
    db.query.attempt.findFirst({
      where: and(eq(attempt.userId, user.id), isNull(attempt.completedAt)),
      orderBy: (a, { desc }) => [desc(a.startedAt)],
    }),
    db.query.attempt.findMany({
      where: eq(attempt.userId, user.id),
      columns: { id: true },
    }),
  ]);

  const hasNoAttempts = allAttempts.length === 0;

  const hasCompletedFoundationCheck = userProfile?.aiCalibration &&
    (userProfile.aiCalibration as AiCalibration & Record<string, unknown>)?.foundationCheckScore !== undefined;

  const aiCalib = userProfile?.aiCalibration as AiCalibration & Record<string, unknown>;
  const foundationCheckScore = aiCalib?.foundationCheckScore as number | undefined;
  const hasCompletedFoundationPath = aiCalib?.foundationPathCompletedAt !== undefined;
  const needsFoundationPath = foundationCheckScore !== undefined && foundationCheckScore < 3;
  const mustCompletePath = needsFoundationPath && !hasCompletedFoundationPath;

  console.log("[assessment/page] Foundation check logic:", {
    hasNoAttempts,
    hasCompletedFoundationCheck,
    foundationCheckScore,
    hasCompletedFoundationPath,
    needsFoundationPath,
    mustCompletePath,
    aiCalibration: userProfile?.aiCalibration,
    allAttemptsCount: allAttempts.length,
    shouldRedirectToCheck: hasNoAttempts && !hasCompletedFoundationCheck,
    shouldRedirectToPath: mustCompletePath,
  });

  // NEW USERS: All new users must complete foundation-check first
  if (hasNoAttempts && !hasCompletedFoundationCheck) {
    console.log("[assessment/page] Redirecting to foundation-check");
    redirect("/assessment/foundation-check");
  }

  // RETURNING USERS WITH LOW SCORE: Must complete foundation-path first
  if (mustCompletePath) {
    console.log("[assessment/page] User must complete foundation-path before main assessment");
    redirect("/assessment/foundation-path");
  }

  const completedIsStale = completed
    ? needsAssessmentRefresh(userProfile?.updatedAt, completed.completedAt)
    : false;
  const inProgressIsStale = isAttemptStale(userProfile?.updatedAt, inProgress?.startedAt);
  const refreshRequired = refresh === "preferences" || completedIsStale || inProgressIsStale;

  const dimensionDetails = getDimensionDetails(userProfile?.goal);
  const allDimLabels = dimensionDetails.map((d) => d.label);
  const relevantDims = getRelevantDimensions(userProfile, allDimLabels);
  const sortedDimensions = relevantDims.size > 0
    ? [
        ...dimensionDetails.filter((d) => relevantDims.has(d.label)),
        ...dimensionDetails.filter((d) => !relevantDims.has(d.label)),
      ]
    : dimensionDetails;

  const lastResultDate = completed?.completedAt
    ? completed.completedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  const goalLabel = getGoalLabel(userProfile?.goal);
  const isTrackedGoal = !!userProfile?.goal;

  const knowledgeScores = completed?.knowledgeScores;
  const avgScore =
    knowledgeScores && Object.keys(knowledgeScores).length > 0
      ? Math.round(
          Object.values(knowledgeScores).reduce((a, b) => a + b, 0) /
            Object.values(knowledgeScores).length,
        )
      : null;
  const identityLevel = isTrackedGoal && avgScore !== null ? scoreToIdentityLevel(avgScore) : null;

  const gateMessage =
    gate === "learn"
      ? "Complete your Assessment to unlock your Roadmap."
      : gate === "interview"
        ? "Complete your Assessment to unlock Interview Prep."
        : null;

  return (
    <div className="mx-auto max-w-4xl space-y-12 py-12 px-4 sm:px-6 lg:px-8">
      {/* ── Top CTA ── */}
      {!inProgress && !refreshRequired && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-brand-green" />
                <h1 className="text-3xl font-bold tracking-tight">
                  {completed && !completedIsStale
                    ? isTrackedGoal
                      ? `Run your ${goalLabel} Assessment again`
                      : "Run your Assessment again"
                    : isTrackedGoal
                      ? `Your ${goalLabel} Assessment`
                      : "Your Assessment"}
                </h1>
              </div>
              <p className="text-base text-muted-foreground max-w-2xl">
                {completed && !completedIsStale
                  ? "See how much you've grown. Recalibrate your Assessment to track your progress."
                  : "15 questions, ~20 minutes. Your Assessment places you precisely on the skill curve and maps your Roadmap."}
              </p>
            </div>
          </div>

          {gateMessage && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
              <p className="text-sm text-blue-700 dark:text-blue-300">{gateMessage}</p>
            </div>
          )}

          <StartAssessmentButton label={completed && !completedIsStale ? "Run new Assessment" : "Start Assessment"} />
        </div>
      )}

      {/* ── In Progress ── */}
      {inProgress && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            <h1 className="text-3xl font-bold tracking-tight">Assessment in progress</h1>
          </div>
          <p className="text-base text-muted-foreground max-w-2xl">
            You have an incomplete Assessment. Continue where you left off.
          </p>

          <div className="flex gap-3">
            <Link
              href={`/assessment/q/1?attempt=${inProgress.id}`}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-green px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-green/90 active:scale-[0.98]"
            >
              Continue Assessment
              <ArrowRight className="h-4 w-4" />
            </Link>
            <ResetAssessmentButton />
          </div>
        </div>
      )}

      {/* ── Results Summary ── */}
      {completed && !completedIsStale && !inProgress && (
        <div className="rounded-lg border border-brand-green/30 bg-brand-green/5 p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-brand-green shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold">Latest Assessment</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Completed {lastResultDate}
                </p>
              </div>
            </div>
            <Link
              href={`/assessment/results/${completed.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-green/40 bg-brand-green/10 px-4 py-2 text-sm font-medium text-brand-green transition-all hover:bg-brand-green/20"
            >
              <Map className="h-4 w-4" />
              View results
            </Link>
          </div>
          {identityLevel && (
            <div className="mt-1 flex items-center gap-2.5 pt-3 border-t border-brand-green/20">
              <span className="inline-flex items-center rounded-full bg-brand-green/20 px-3 py-1 text-xs font-semibold text-brand-green">
                {identityLevel}
              </span>
              <p className="text-sm font-medium text-foreground">
                You are {identityLevel === "Beginner" ? "a" : "an"} {identityLevel.toLowerCase()} {goalLabel}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Dimensions Preview ── */}
      {!refreshRequired && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">What we&apos;ll assess</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sortedDimensions.slice(0, 6).map((dim) => (
              <div
                key={dim.label}
                className={`rounded-lg border p-4 space-y-2 ${
                  relevantDims.has(dim.label)
                    ? "border-brand-green/40 bg-brand-green/5"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{dim.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{dim.description}</p>
                  </div>
                  {relevantDims.has(dim.label) && (
                    <span className="inline-flex items-center rounded-full bg-brand-green/20 px-2 py-1 text-xs font-medium text-brand-green shrink-0">
                      Key for you
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
