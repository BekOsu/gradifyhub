import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq, and, isNotNull, gte } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { attempt, profile, response, type AiCalibration } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import {
  scoreResponses,
  generateAssessmentSummary,
  buildGroupedReadiness,
} from "~/lib/ai/assessment";
import { confirmAssessmentProfile } from "~/actions/assessment-hitl";
import RadarChart from "~/components/assessment/radar-chart";
import { getUserRoadmap } from "@repo/db/queries/roadmap";
import { getUserPlan, getWeeklyRetakeLimit } from "~/lib/billing/hasFeature";
import { RetakeButton } from "~/components/assessment/retake-button";
import { RetryButton } from "~/components/assessment/retry-button";
import { getGoalLabel } from "~/lib/journey/goals";

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const TECHNICAL_LEVELS = ["beginner", "intermediate", "advanced", "expert"] as const;

const CEFR_COLOR: Record<string, string> = {
  A1: "bg-red-500/10 text-red-600",
  A2: "bg-orange-500/10 text-orange-600",
  B1: "bg-amber-500/10 text-amber-600",
  B2: "bg-yellow-500/10 text-yellow-700",
  C1: "bg-emerald-500/10 text-emerald-600",
  C2: "bg-green-500/10 text-green-600",
};

const READINESS_COLOR = (score: number) =>
  score >= 70 ? "bg-green-500" : score >= 45 ? "bg-amber-400" : "bg-destructive";

const GROUP_METHOD_DIMENSION_KEYS = {
  technical: [
    "python",
    "llm_fundamentals_evals",
    "context_engineering",
    "rag_retrieval",
    "agentic_systems",
    "voice_multimodal",
    "system_design",
    "tooling_observability",
  ],
  professional: ["soft_skills"],
} as const;

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ attemptId: string }>;
  searchParams: Promise<{ reason?: string }>;
}) {
  const user = await requireAuth();
  const { attemptId } = await params;
  const { reason } = await searchParams;
  const timeExpired = reason === "time-expired";

  const record = await db.query.attempt.findFirst({
    where: and(eq(attempt.id, attemptId), isNotNull(attempt.completedAt)),
  });

  if (!record || record.userId !== user.id) notFound();

  const [responses, userProfile, existingRoadmap, plan] = await Promise.all([
    db.query.response.findMany({ where: eq(response.attemptId, attemptId) }),
    db.query.profile.findFirst({ where: eq(profile.userId, user.id) }),
    getUserRoadmap(user.id),
    getUserPlan(user.id),
  ]);

  // Foundation-path enforcement
  const aiCalib = userProfile?.aiCalibration as AiCalibration & Record<string, unknown>;
  const foundationCheckScore = aiCalib?.foundationCheckScore as number | undefined;
  const hasCompletedFoundationPath = aiCalib?.foundationPathCompletedAt !== undefined;
  const needsFoundationPath = foundationCheckScore !== undefined && foundationCheckScore < 3;

  if (needsFoundationPath && !hasCompletedFoundationPath) {
    redirect("/assessment/foundation-path");
  }

  // Calculate weekly retake limit
  const weeklyLimit = getWeeklyRetakeLimit(plan);
  let completedThisWeek = 0;
  if (weeklyLimit !== null) {
    const startOfWeek = new Date();
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - startOfWeek.getUTCDay());
    startOfWeek.setUTCHours(0, 0, 0, 0);

    const rows = await db.query.attempt.findMany({
      where: and(
        eq(attempt.userId, user.id),
        isNotNull(attempt.completedAt),
        gte(attempt.completedAt, startOfWeek),
      ),
      columns: { id: true },
    });
    completedThisWeek = rows.length;
  }

  const roadmapIsStale =
    existingRoadmap &&
    record.completedAt &&
    existingRoadmap.updatedAt &&
    record.completedAt.getTime() > existingRoadmap.updatedAt.getTime();

  const scores = scoreResponses(
    responses.map((r) => ({ itemId: r.itemId, choiceId: r.choiceId }))
  );
  const groupedReadiness = buildGroupedReadiness(scores);

  let summary;
  try {
    summary = await generateAssessmentSummary(
      scores,
      responses.map((r) => ({ itemId: r.itemId, choiceId: r.choiceId })),
      userProfile
    );
  } catch (err) {
    console.error("[results] assessment pipeline failed:", err);
    return (
      <div className="mx-auto max-w-2xl space-y-8 pb-16">

        {timeExpired && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 dark:border-amber-700 dark:bg-amber-950">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              Time ran out — your Assessment was auto-submitted
            </p>
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
              Your answers up to that point are shown below. Results are based on the questions you completed.
            </p>
          </div>
        )}

        {/* Banner */}
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 dark:border-amber-700 dark:bg-amber-950">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            AI analysis couldn&apos;t load right now
          </p>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
            Your responses are saved and your diagnostic scores are shown below. Hit &quot;Try again&quot; to
            re-run the full analysis — this usually resolves in one retry.
          </p>
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            Note: roadmap generation requires the full analysis. Try again to unlock it.
          </p>
        </div>

        {/* Radar */}
        <div className="flex justify-center">
          <RadarChart scores={scores} />
        </div>

        {/* Grouped readiness */}
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { key: "technical",    label: "Technical",    score: groupedReadiness.technical },
            { key: "professional", label: "Professional", score: groupedReadiness.professional },
          ].map((group) => {
            const levelLabel =
              group.score >= 70 ? "Advanced" :
              group.score >= 45 ? "Intermediate" : "Beginner";
            const levelColor =
              group.score >= 70
                ? "bg-green-500/10 text-green-700"
                : group.score >= 45
                ? "bg-amber-500/10 text-amber-700"
                : "bg-destructive/10 text-destructive";
            return (
            <div key={group.key} className="rounded-xl border p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</p>
              <div className="mt-2 flex items-center gap-3">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${levelColor}`}>
                  {levelLabel}
                </span>
                <span className="text-xs text-muted-foreground">{group.score}% signal</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-1.5 rounded-full ${READINESS_COLOR(group.score)}`}
                  style={{ width: `${group.score}%` }}
                />
              </div>
            </div>
            );
          })}
        </div>

        {/* Dimension bars */}
        <div className="flex flex-col gap-3">
          {scores.map(({ dimension, label, score }) => (
            <div key={dimension}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium">{label}</span>
                <span className={`text-xs font-medium ${
                  score >= 70 ? "text-green-600" : score >= 40 ? "text-amber-500" : "text-destructive"
                }`}>
                  {score}% signal
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-2 rounded-full transition-all ${
                    score >= 70 ? "bg-green-500" : score >= 40 ? "bg-amber-400" : "bg-destructive"
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <RetryButton />
          <Link
            href="/dashboard"
            className="inline-flex rounded-full border px-5 py-2 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Go to dashboard
          </Link>
        </div>

      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10 pb-16">

      {timeExpired && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 dark:border-amber-700 dark:bg-amber-950">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            Time ran out — your Assessment was auto-submitted
          </p>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
            Your answers up to that point are shown below. Results are based on the questions you completed.
          </p>
        </div>
      )}

      {/* Header — identity label */}
      <div>
        <span className="inline-block rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600">
          Assessment complete
        </span>
        {summary.overallLevel && (() => {
          const level = summary.overallLevel;
          const capitalLevel = level.charAt(0).toUpperCase() + level.slice(1);
          const article = ["a", "e", "i", "o", "u"].includes(level[0]!.toLowerCase()) ? "an" : "a";
          const goalLabel = getGoalLabel(userProfile?.goal);
          return (
            <h1 className="mt-3 text-2xl font-bold tracking-tight">
              You are {article}{" "}
              <span className="text-brand-green">{capitalLevel}</span>{" "}
              <span className="text-brand-green">{goalLabel}</span>
            </h1>
          );
        })()}
        <p className="mt-1 text-sm text-muted-foreground">{summary.headline}</p>
      </div>

      {/* Radar */}
      <div className="flex justify-center">
        <RadarChart scores={scores} />
      </div>

      {/* Retake Assessment */}
      <div className="rounded-xl border p-4">
        <p className="text-sm font-semibold mb-3">Want to try again?</p>
        <RetakeButton
          plan={plan}
          completedThisWeek={completedThisWeek}
          weeklyLimit={weeklyLimit}
        />
      </div>

      {/* Background context */}
      <div className="rounded-xl border bg-muted/30 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Background context used</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We combine your onboarding profile with diagnostic signals to produce your Roadmap.
            </p>
          </div>
          <Link
            href="/onboarding/step-1?edit=1"
            className="inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-muted"
          >
            Update
          </Link>
        </div>

        <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <p>Role: <span className="font-medium text-foreground">{userProfile?.currentRole ?? "Not set"}</span></p>
          <p>Track: <span className="font-medium text-foreground">{userProfile?.goal ? getGoalLabel(userProfile.goal) : "Not set"}</span></p>
          <p>Timeline: <span className="font-medium text-foreground">{userProfile?.targetTimeline ?? "Not set"}</span></p>
          <p>Pace: <span className="font-medium text-foreground">{userProfile?.hoursPerDay && userProfile?.daysPerWeek ? `${userProfile.hoursPerDay} hr/day · ${userProfile.daysPerWeek} day${userProfile.daysPerWeek === "1" ? "" : "s"}/week` : "Not set"}</span></p>
        </div>
      </div>

      {/* Readiness level cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { key: "technical",    label: "Technical",    score: groupedReadiness.technical },
          { key: "professional", label: "Professional", score: groupedReadiness.professional },
        ].map((group) => {
          const levelLabel =
            group.score >= 70 ? "Advanced" :
            group.score >= 45 ? "Intermediate" : "Beginner";
          const levelColor =
            group.score >= 70
              ? "bg-green-500/10 text-green-700 dark:text-green-400"
              : group.score >= 45
              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
              : "bg-destructive/10 text-destructive";
          return (
            <div key={group.key} className="rounded-xl border p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</p>
              <div className="mt-2 flex items-center gap-3">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${levelColor}`}>
                  {levelLabel}
                </span>
                <span className="text-xs text-muted-foreground">{group.score}% signal</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-1.5 rounded-full ${READINESS_COLOR(group.score)}`}
                  style={{ width: `${group.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="-mt-6 rounded-xl border bg-muted/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          How grouped readiness is calculated
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Fixed grouping order (technical → professional). Each grouped score is a deterministic average of the dimensions below.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            { key: "technical",    label: "Technical" },
            { key: "professional", label: "Professional" },
          ].map((group) => (
            <div key={group.key} className="rounded-lg border bg-background p-3">
              <p className="text-xs font-semibold">{group.label}</p>
              <div className="mt-2 space-y-1.5 text-xs">
                {GROUP_METHOD_DIMENSION_KEYS[group.key as keyof typeof GROUP_METHOD_DIMENSION_KEYS].map((dimensionKey) => {
                  const dimensionLabel =
                    scores.find((s) => s.dimension === dimensionKey)?.label ?? dimensionKey;
                  const score = scores.find((s) => s.dimension === dimensionKey)?.score ?? 0;

                  return (
                    <div key={dimensionKey} className="flex items-center justify-between text-muted-foreground">
                      <span>{dimensionLabel}</span>
                      <span className="font-medium text-foreground">{score}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dimension bars */}
      <div className="flex flex-col gap-3">
        {scores.map(({ dimension, label, score }) => (
          <div key={dimension}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium">{label}</span>
              <span
                className={`text-xs font-medium ${
                  score >= 70
                    ? "text-green-600"
                    : score >= 40
                    ? "text-amber-500"
                    : "text-destructive"
                }`}
              >
                {score}% signal
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-2 rounded-full transition-all ${
                  score >= 70 ? "bg-green-500" : score >= 40 ? "bg-amber-400" : "bg-destructive"
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Strengths / Gaps */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-green-500/5 p-5">
          <p className="text-sm font-semibold text-green-700 dark:text-green-400">Current strengths</p>
          <ul className="mt-3 flex flex-col gap-2">
            {summary.strengths.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-foreground/80">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border bg-destructive/5 p-5">
          <p className="text-sm font-semibold text-destructive">Priority growth areas</p>
          <ul className="mt-3 flex flex-col gap-2">
            {summary.gaps.map((g) => (
              <li key={g} className="flex items-start gap-2 text-sm text-foreground/80">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/60" />
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Enriched signals row */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* CEFR */}
        <div className="rounded-xl border p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            English Level
          </p>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${CEFR_COLOR[summary.cefrLevel] ?? "bg-muted text-foreground"}`}>
            {summary.cefrLevel}
          </span>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            {summary.cefrJustification}
          </p>
        </div>

        {/* Work style */}
        <div className="rounded-xl border p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Work Style
          </p>
          <p className="text-sm font-semibold">{summary.workStyle}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {summary.workStyleTraits.map((t) => (
              <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Job readiness */}
        <div className="rounded-xl border p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Job readiness index
          </p>
          <p className="text-2xl font-bold">{summary.jobReadinessScore}</p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-2 rounded-full transition-all ${READINESS_COLOR(summary.jobReadinessScore)}`}
              style={{ width: `${summary.jobReadinessScore}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">{summary.jobReadinessLabel}</p>
        </div>
      </div>

      {/* Roadmap hint */}
      <div className="rounded-xl border bg-muted/30 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recommended roadmap focus</p>
        <p className="mt-2 text-sm leading-relaxed">{summary.roadmapHint}</p>
      </div>

      {/* ── Contextual upgrade nudge (free plan only) ── */}
      {plan === "free" && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Get more from your results</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Pro unlocks unlimited diagnostics, Roadmap regeneration, and daily Tariq with no cap.
            </p>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Upgrade to Pro
          </Link>
        </div>
      )}

      {/* ── HITL #1 — Confirm profile ────────────────────────────────── */}
      <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-6">
        {roadmapIsStale ? (
          <>
            <p className="text-sm font-semibold">Your roadmap will be updated with these results</p>
            <p className="mt-1 text-xs text-muted-foreground">
              You already have a roadmap. Confirm your profile below and we&apos;ll regenerate it using your latest diagnostic signals.
            </p>
          </>
        ) : existingRoadmap ? (
          <>
            <p className="text-sm font-semibold">Does this match how you see yourself?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Correct anything below and confirm — your Roadmap will be regenerated with the updated signals.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold">Does this match how you see yourself?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              The AI assessed your profile below. Correct anything before we generate your Roadmap — your input takes priority over the model.
            </p>
          </>
        )}

        <form action={confirmAssessmentProfile} className="mt-5 space-y-4">
          <input type="hidden" name="roadmapHint" value={summary.roadmapHint} />

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Technical level
              </label>
              <select
                name="technicalLevel"
                defaultValue={summary.overallLevel}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {TECHNICAL_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                English level (CEFR)
              </label>
              <select
                name="cefrLevel"
                defaultValue={summary.cefrLevel}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CEFR_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Work style
              </label>
              <input
                type="text"
                name="workStyle"
                defaultValue={summary.workStyle}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {existingRoadmap ? "Confirm & update my roadmap →" : "Confirm & generate my roadmap →"}
          </button>
        </form>

        <div className="mt-5 rounded-lg border bg-muted/40 p-4">
          <p className="text-sm font-medium">Want a more accurate roadmap?</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Answer 5 evidence questions per skill level to prove what you actually know — not just what the MCQ thinks you know.
          </p>
          <Link
            href="/assessment/self-assessment"
            className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Take the self-assessment →
          </Link>
        </div>
      </div>

    </div>
  );
}
