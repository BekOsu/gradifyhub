import Link from "next/link";
import { redirect } from "next/navigation";
import { eq, and, isNull } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { attempt, item, profile, response, type AiCalibration } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { getMockItem, MOCK_TOTAL } from "~/lib/assessment/mock";
import { isAttemptStale } from "~/lib/assessment/staleness";
import { ReviewList } from "./review-list";
import { ReviewActions } from "./review-actions";

const USE_MOCK = process.env.ASSESSMENT_MODE !== "real";
const REAL_TOTAL = Number(process.env.ASSESSMENT_QUESTION_LIMIT ?? 15);
const TOTAL_QUESTIONS = USE_MOCK ? MOCK_TOTAL : REAL_TOTAL;

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ attempt?: string }>;
}) {
  const user = await requireAuth();
  await searchParams;

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

  // Foundation-path enforcement
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

  type ReviewRow = {
    index: number;
    question: string;
    stem: string;
    stemTruncated: string;
    userChoice: string | null;
    dimension: string;
    status: "answered" | "skipped" | "unanswered";
    allChoices: Array<{ id: string; label: string }>;
    selectedChoiceId: string | null;
  };

  const reviewRows: ReviewRow[] = [];
  let answered = 0;
  let skipped = 0;

  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    const itemId = itemSequence[i];
    const resp = responses.find((r) => r.itemId === itemId);

    const dbItem = USE_MOCK
      ? getMockItem(i)
      : itemId
        ? await db.query.item.findFirst({ where: eq(item.id, itemId) })
        : null;

    if (!dbItem) continue;

    const stem = dbItem.stem;
    const stemTruncated = stem.length > 80 ? stem.substring(0, 80) + "…" : stem;
    const choices = Array.isArray(dbItem.choices) ? dbItem.choices : [];
    const dimension = dbItem.dimension;

    let status: "answered" | "skipped" | "unanswered" = "unanswered";
    let selectedChoiceId: string | null = null;
    let userChoice: string | null = null;

    if (resp) {
      if (resp.skipped) {
        status = "skipped";
        skipped++;
      } else {
        status = "answered";
        answered++;
        selectedChoiceId = resp.choiceId;
        const selectedChoice = choices.find((c): c is { id: string; label: string } => {
          return typeof c === "object" && c !== null && "id" in c && (c as { id?: unknown }).id === resp.choiceId;
        });
        userChoice = selectedChoice?.label ?? null;
      }
    } else {
      // Check if this is the last question and attempt completed
      if (i === TOTAL_QUESTIONS - 1 && currentAttempt.completedAt) {
        continue;
      }
    }

    reviewRows.push({
      index: i,
      question: `Q${i + 1}`,
      stem,
      stemTruncated,
      userChoice,
      dimension,
      status,
      allChoices: choices.map((c): { id: string; label: string } => {
        if (typeof c === "object" && c !== null && "id" in c && "label" in c) {
          return { id: (c as { id?: unknown }).id as string, label: (c as { label?: unknown }).label as string };
        }
        return { id: "", label: "" };
      }),
      selectedChoiceId,
    });
  }

  const unanswered = TOTAL_QUESTIONS - answered - skipped;
  const answeredCount = answered + skipped;
  const hasUnanswered = unanswered > 0;

  const firstUnansweredIndex = reviewRows.find((r) => r.status === "unanswered")?.index ?? null;

  return (
    <div className="mx-auto max-w-2xl py-12 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href={`/assessment/q/1?attempt=${currentAttempt.id}`}
            className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            ← Back to questions
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Review your answers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {answered} answered · {skipped} skipped · {unanswered} remaining
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {answeredCount} of {TOTAL_QUESTIONS} answered
          </span>
          <span className="text-muted-foreground">
            {answered} answered · {skipped} skipped
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${(answeredCount / TOTAL_QUESTIONS) * 100}%` }}
          />
        </div>
      </div>

      {/* Warning if unanswered */}
      {hasUnanswered && firstUnansweredIndex !== null && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
          <p className="text-sm font-semibold text-destructive">
            {unanswered} {unanswered === 1 ? "question" : "questions"} unanswered
          </p>
          <p className="text-xs text-muted-foreground">
            Unanswered questions reduce signal quality. You can skip them or go back and answer.
          </p>
          <Link
            href={`/assessment/q/${firstUnansweredIndex + 1}?attempt=${currentAttempt.id}`}
            className="inline-flex rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90"
          >
            Answer Q{firstUnansweredIndex + 1} →
          </Link>
        </div>
      )}

      {/* Review list */}
      <ReviewList rows={reviewRows} attemptId={currentAttempt.id} />

      {/* Actions */}
      <ReviewActions attemptId={currentAttempt.id} hasUnanswered={hasUnanswered} />
    </div>
  );
}
