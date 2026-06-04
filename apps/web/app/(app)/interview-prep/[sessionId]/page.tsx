import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, and } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { interviewPrepSession } from "@repo/db/schema";
import { PageHeader } from "@repo/ui/page-header";
import { requireAuth } from "~/lib/auth/session";
import {
  GapAnalysisSchema,
  PrepPlanSchema,
  MockQuestionsSchema,
} from "@repo/contracts/interview-prep";
import type { GapAnalysis, PrepPlan, MockQuestion } from "@repo/contracts/interview-prep";

function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const PRIORITY_STYLES = {
  high: "bg-red-500/10 text-red-600 dark:text-red-400",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  low: "bg-muted text-muted-foreground",
};

const TYPE_LABELS: Record<MockQuestion["type"], string> = {
  technical: "Technical",
  behavioral: "Behavioral",
  "system-design": "System Design",
  coding: "Coding",
};

const DIFFICULTY_STYLES: Record<MockQuestion["difficulty"], string> = {
  easy: "text-green-600 dark:text-green-400",
  medium: "text-amber-600 dark:text-amber-400",
  hard: "text-red-600 dark:text-red-400",
};

export default async function InterviewPrepResultsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const user = await requireAuth();

  const session = await db.query.interviewPrepSession.findFirst({
    where: and(
      eq(interviewPrepSession.id, sessionId),
      eq(interviewPrepSession.userId, user.id),
    ),
  });

  if (!session) notFound();

  if (session.status === "failed") {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader
          title="Prep plan failed"
          description={session.error ?? "Something went wrong during analysis."}
        />
        <Link
          href="/onboarding/interview-prep"
          className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </Link>
      </div>
    );
  }

  if (session.status !== "ready") {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <PageHeader title="Your plan is being prepared…" description="This usually takes under a minute." />
        <p className="text-sm text-muted-foreground">
          Refresh this page in a moment, or{" "}
          <Link href="/dashboard" className="underline underline-offset-4 hover:text-foreground">
            return to dashboard
          </Link>
          .
        </p>
      </div>
    );
  }

  const gapResult = GapAnalysisSchema.safeParse(session.gapAnalysis);
  const planResult = PrepPlanSchema.safeParse(session.prepPlan);
  const questionsResult = MockQuestionsSchema.safeParse(session.mockQuestions);

  const gaps: GapAnalysis | null = gapResult.success ? gapResult.data : null;
  const plan: PrepPlan | null = planResult.success ? planResult.data : null;
  const questions: MockQuestion[] = questionsResult.success ? questionsResult.data : [];

  const days = daysUntil(session.interviewDate);
  const questionsByType = questions.reduce<Record<string, MockQuestion[]>>((acc, q) => {
    (acc[q.type] ??= []).push(q);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground">
              ← Dashboard
            </Link>
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            {session.targetRole ?? "Interview"} at {session.targetCompany ?? "the company"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {days > 0 ? `${days} day${days === 1 ? "" : "s"} until your interview` : "Interview day is here"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {questions.length > 0 && (
            <Link
              href={`/interview-prep/${sessionId}/practice`}
              className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Start session →
            </Link>
          )}
          <Link
            href="/onboarding/interview-prep"
            className="shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
          >
            + New Session
          </Link>
        </div>
      </div>

      {/* Strengths + gaps */}
      {gaps && (
        <section className="space-y-4">
          <h2 className="font-semibold">Skill gap analysis</h2>

          {gaps.strengths.length > 0 && (
            <div className="rounded-xl border bg-green-50 p-5 dark:bg-green-950/20">
              <p className="mb-2 text-sm font-medium text-green-700 dark:text-green-400">
                Your strengths
              </p>
              <div className="flex flex-wrap gap-2">
                {gaps.strengths.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {gaps.priorities.length > 0 && (
            <div className="rounded-xl border p-5">
              <p className="mb-2 text-sm font-medium">Top priorities</p>
              <ol className="flex flex-col gap-1.5">
                {gaps.priorities.map((p, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    {i + 1}. {p}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {gaps.gaps.map((gap) => (
              <div key={gap.skill} className="rounded-xl border p-5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{gap.skill}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${PRIORITY_STYLES[gap.priority]}`}
                  >
                    {gap.priority}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{gap.reason}</p>
                <p className="mt-2.5 text-xs font-medium text-muted-foreground">
                  ~{gap.estimatedHours}h to get interview-ready
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Day-by-day prep plan */}
      {plan && (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold">Your day-by-day plan</h2>
            <p className="text-xs text-muted-foreground">~{plan.totalStudyHours}h total</p>
          </div>

          <div className="flex flex-col gap-3">
            {plan.days.map((day) => (
              <div key={day.date} className="rounded-xl border p-4">
                <div className="mb-2 flex items-center gap-3">
                  <p className="text-xs font-medium text-muted-foreground">{formatDate(day.date)}</p>
                  <p className="text-sm font-semibold">{day.focus}</p>
                </div>
                <ul className="flex flex-col gap-1">
                  {day.tasks.map((task, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mock questions */}
      {questions.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-semibold">Interview questions</h2>

          {(["technical", "system-design", "coding", "behavioral"] as const).map((type) => {
            const qs = questionsByType[type];
            if (!qs?.length) return null;
            return (
              <div key={type} className="rounded-xl border">
                <div className="border-b px-5 py-3">
                  <p className="text-sm font-semibold">{TYPE_LABELS[type]}</p>
                </div>
                <div className="divide-y">
                  {qs.map((q, i) => (
                    <div key={i} className="px-5 py-4">
                      <div className="mb-2 flex items-start justify-between gap-4">
                        <p className="text-sm font-medium leading-relaxed">{q.question}</p>
                        <span className={`shrink-0 text-xs font-medium capitalize ${DIFFICULTY_STYLES[q.difficulty]}`}>
                          {q.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground/70">Hint: </span>
                        {q.hint}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
