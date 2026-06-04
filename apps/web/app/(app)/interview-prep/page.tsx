import Link from "next/link";
import { desc, eq } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { interviewPrepSession, profile } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { getGoalLabel } from "~/lib/journey/goals";
import { Briefcase } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  ready:      "bg-green-500/10 text-green-600",
  processing: "bg-amber-500/10 text-amber-600",
  pending:    "bg-amber-500/10 text-amber-600",
  failed:     "bg-destructive/10 text-destructive",
};

const STATUS_LABELS: Record<string, string> = {
  ready:      "Ready",
  processing: "Preparing…",
  pending:    "Preparing…",
  failed:     "Failed",
};

function daysUntil(date: Date): string {
  const diff = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "Past";
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `${diff} days away`;
}

export default async function InterviewPrepPage() {
  const user = await requireAuth();

  const userProfile = await db.query.profile.findFirst({
    where: eq(profile.userId, user.id),
    columns: { goal: true },
  });

  const goalLabel = getGoalLabel(userProfile?.goal);

  const sessions = await db.query.interviewPrepSession.findMany({
    where: eq(interviewPrepSession.userId, user.id),
    orderBy: [desc(interviewPrepSession.createdAt)],
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{goalLabel} Interview Prep</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Practice for your {goalLabel} interviews with adaptive AI sessions.
          </p>
        </div>
        <Link
          href="/onboarding/interview-prep"
          className="shrink-0 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          + New Session
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold">No interview sessions yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your interview details and get a personalised study plan in under a minute.
            </p>
          </div>
          <Link
            href="/onboarding/interview-prep"
            className="mt-2 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Start your first session →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/interview-prep/${session.id}`}
              className="group rounded-xl border p-5 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold truncate">
                    {session.targetRole ?? "Interview"}{session.targetCompany ? ` at ${session.targetCompany}` : ""}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {daysUntil(session.interviewDate)}
                    {" · "}
                    {session.interviewDate.toLocaleDateString("en-US", {
                      weekday: "short", month: "short", day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[session.status] ?? "bg-muted text-muted-foreground"}`}>
                    {STATUS_LABELS[session.status] ?? session.status}
                  </span>
                  <span className="text-muted-foreground transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}
