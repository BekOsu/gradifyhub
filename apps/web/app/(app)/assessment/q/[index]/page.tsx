import { redirect } from "next/navigation";
import { eq, and, isNull } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { attempt, item, profile, response, type AiCalibration } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { getMockItem, MOCK_TOTAL } from "~/lib/assessment/mock";
import { isAttemptStale } from "~/lib/assessment/staleness";
import { DIMENSION_SIGNAL_LENS } from "~/lib/ai/assessment";
import { getGoalLabel } from "~/lib/journey/goals";
import { QuestionForm } from "./question-form";

const USE_MOCK = process.env.ASSESSMENT_MODE !== "real";
const REAL_TOTAL = Number(process.env.ASSESSMENT_QUESTION_LIMIT ?? 15);
const TOTAL_QUESTIONS = USE_MOCK ? MOCK_TOTAL : REAL_TOTAL;

export default async function QuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ index: string }>;
  searchParams: Promise<{ attempt?: string; "from-review"?: string }>;
}) {
  const user = await requireAuth();
  const { index } = await params;
  const params_ = await searchParams;
  const fromReview = params_["from-review"] === "true";

  const indexNum = parseInt(index, 10);
  if (isNaN(indexNum) || indexNum < 1) redirect("/assessment");

  const currentAttempt = await db.query.attempt.findFirst({
    where: and(eq(attempt.userId, user.id), isNull(attempt.completedAt)),
    orderBy: (a, { desc }) => [desc(a.startedAt)],
  });

  if (!currentAttempt) redirect("/assessment");
  const userProfile = await db.query.profile.findFirst({
    where: eq(profile.userId, user.id),
  });
  if (isAttemptStale(userProfile?.updatedAt, currentAttempt.startedAt)) {
    redirect("/assessment?refresh=preferences");
  }

  // Foundation-path enforcement: users who scored < 3 on foundation-check must complete foundation-path first
  const aiCalib = userProfile?.aiCalibration as AiCalibration & Record<string, unknown>;
  const foundationCheckScore = aiCalib?.foundationCheckScore as number | undefined;
  const hasCompletedFoundationPath = aiCalib?.foundationPathCompletedAt !== undefined;
  const needsFoundationPath = foundationCheckScore !== undefined && foundationCheckScore < 3;

  if (needsFoundationPath && !hasCompletedFoundationPath) {
    redirect("/assessment/foundation-path");
  }

  const responses = await db.query.response.findMany({
    where: eq(response.attemptId, currentAttempt.id),
  });

  const itemSequence = Array.isArray(currentAttempt.itemSequence)
    ? (currentAttempt.itemSequence as string[])
    : [];

  // Use actual sequence length so display and bounds match the real item bank size
  const effectiveTotal = !USE_MOCK && itemSequence.length > 0 ? itemSequence.length : TOTAL_QUESTIONS;

  const answeredQuestions = new Set(
    responses
      .filter((r) => !r.skipped)
      .map((r) => itemSequence.indexOf(r.itemId))
      .filter((idx) => idx >= 0)
  );

  const skippedQuestions = new Set(
    responses
      .filter((r) => r.skipped)
      .map((r) => itemSequence.indexOf(r.itemId))
      .filter((idx) => idx >= 0)
  );

  const answeredCount = answeredQuestions.size;
  const requestedIndex = indexNum - 1;
  const currentIndex = USE_MOCK ? answeredCount : requestedIndex;

  if (USE_MOCK && requestedIndex > answeredCount) {
    redirect(`/assessment/q/${answeredCount + 1}?attempt=${currentAttempt.id}`);
  }

  if (currentIndex < 0 || currentIndex >= effectiveTotal) {
    redirect(`/assessment/results/${currentAttempt.id}`);
  }

  const realItemId = itemSequence[currentIndex];

  const question = USE_MOCK
    ? getMockItem(currentIndex)
    : realItemId
    ? await db.query.item.findFirst({ where: eq(item.id, realItemId) })
    : null;

  if (!question) redirect(`/assessment/results/${currentAttempt.id}`);

  const uiItem = {
    id: question.id,
    stem: question.stem,
    dimension: question.dimension,
    choices: Array.isArray(question.choices) ? question.choices : [],
  };

  const previousResponse = responses.find((r) => r.itemId === uiItem.id);
  const previousAnswer = previousResponse && !previousResponse.skipped ? previousResponse.choiceId : undefined;

  const dimLabel = uiItem.dimension
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const goalLabel = getGoalLabel(userProfile?.goal);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* ── Header ── */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center rounded-full border border-brand-green/25 bg-brand-green/8 px-3 py-1 text-xs font-semibold text-brand-green">
            {dimLabel}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {userProfile?.goal ? `${goalLabel} Assessment` : "Assessment"}
            {" — "}
            <span className="font-bold text-foreground">Q{Math.min(currentIndex + 1, effectiveTotal)}</span>{" "}
            <span className="text-muted-foreground/60">of {effectiveTotal}</span>
          </span>
        </div>
        <div className="flex h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="bg-brand-green transition-all duration-500"
            style={{ width: `${(answeredCount / effectiveTotal) * 100}%` }}
          />
          <div
            className="bg-amber-400 transition-all duration-500"
            style={{ width: `${(skippedQuestions.size / effectiveTotal) * 100}%` }}
          />
        </div>
      </div>

      <QuestionForm
        attemptId={currentAttempt.id}
        item={uiItem}
        signalLens={DIMENSION_SIGNAL_LENS[uiItem.dimension] ?? "General job-readiness signal"}
        currentIndex={currentIndex}
        total={effectiveTotal}
        previousAnswer={previousAnswer}
        canGoBack={true}
        answeredQuestions={answeredQuestions}
        skippedQuestions={skippedQuestions}
        startedAt={currentAttempt.startedAt}
        pausedAt={currentAttempt.pausedAt}
        totalPauseMs={currentAttempt.totalPauseMs}
        fromReview={fromReview}
        timeExpiredAt={null}
      />
    </div>
  );
}
