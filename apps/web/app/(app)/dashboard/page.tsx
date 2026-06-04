import Link from "next/link";
import { eq, and, isNotNull, notInArray, count as drizzleCount, inArray } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { attempt, response, roadmap, streak, lesson, lessonProgress, subscription, profile, interviewPrepSession } from "@repo/db/schema";
import { Progress } from "@repo/ui/progress";
import { ProgressRing } from "@repo/ui/progress-ring";
import { requireAuth } from "~/lib/auth/session";
import { scoreResponses } from "~/lib/ai/assessment";
import { buildJourneyStatus } from "~/lib/journey/status";
import { getGoalLabel } from "~/lib/journey/goals";
import { AssignedTutors } from "~/components/student/assigned-tutors";
import {
  ArrowRight,
  Flame,
  GraduationCap,
  Target,
  ClipboardList,
  Map,
  BookOpen,
  FileText,
  Briefcase,
  Brain,
  Clock,
  MessageSquare,
} from "lucide-react";

function toValidDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const parsed = new Date(value as string | number);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatShortDate(value: unknown): string {
  const date = toValidDate(value);
  if (!date) return "Unknown date";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default async function DashboardPage() {
  const user = await requireAuth();

  const [
    completedAttempt,
    userRoadmap,
    userStreak,
    userSub,
    recentLessons,
    totalCompletedCount,
    userProfile,
    latestInterviewSession,
    completedLessonIds,
  ] = await Promise.all([
    db.query.attempt.findFirst({
      where: and(eq(attempt.userId, user.id), isNotNull(attempt.completedAt)),
      orderBy: (a, { desc }) => [desc(a.completedAt)],
    }),
    db.query.roadmap.findFirst({
      where: eq(roadmap.userId, user.id),
      with: {
        phases: {
          orderBy: (p, { asc }) => [asc(p.order)],
          with: { skills: { orderBy: (s, { asc }) => [asc(s.order)] } },
        },
      },
    }),
    db.query.streak.findFirst({ where: eq(streak.userId, user.id) }),
    db.query.subscription.findFirst({ where: eq(subscription.userId, user.id) }),
    db.query.lessonProgress.findMany({
      where: and(eq(lessonProgress.userId, user.id), isNotNull(lessonProgress.completedAt)),
      orderBy: (lp, { desc }) => [desc(lp.completedAt)],
      limit: 5,
      with: { lesson: true },
    }),
    db
      .select({ count: drizzleCount() })
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, user.id), isNotNull(lessonProgress.completedAt)))
      .then((r) => r[0]?.count ?? 0),
    db.query.profile.findFirst({ where: eq(profile.userId, user.id) }),
    db.query.interviewPrepSession.findFirst({
      where: and(eq(interviewPrepSession.userId, user.id), eq(interviewPrepSession.status, "ready")),
      orderBy: (s, { desc }) => [desc(s.createdAt)],
    }),
    // Slim query — only lessonId needed to build the exclusion set for Tariq lookup
    db.query.lessonProgress.findMany({
      where: and(eq(lessonProgress.userId, user.id), isNotNull(lessonProgress.completedAt)),
      columns: { lessonId: true },
    }).then((rows) => rows.map((r) => r.lessonId)),
  ]);

  // Find the next uncompleted lesson for "Today's Tariq".
  // Only meaningful when the user has an active roadmap.
  const nextTariq = userRoadmap
    ? await db.query.lesson.findFirst({
        where: completedLessonIds.length > 0
          ? notInArray(lesson.id, completedLessonIds)
          : undefined,
        orderBy: (l, { asc }) => [asc(l.order)],
      })
    : null;

  let scores: { label: string; score: number }[] = [];
  if (completedAttempt) {
    const responses = await db.query.response.findMany({
      where: eq(response.attemptId, completedAttempt.id),
    });
    const raw = scoreResponses(responses.map((r) => ({ itemId: r.itemId, choiceId: r.choiceId })));
    scores = raw.map((s) => ({ label: s.label, score: s.score }));
  }

  // Per-track lesson progress counts
  const allTrackLessons = await db.query.lesson.findMany({
    where: inArray(lesson.track, ["ai-engineer", "soft-skills", "english-proficiency"]),
    columns: { id: true, track: true },
  });
  const completedSet = new Set(completedLessonIds);
  const trackStats = (["ai-engineer", "soft-skills", "english-proficiency"] as const).map((t) => {
    const total = allTrackLessons.filter((l) => l.track === t).length;
    const done  = allTrackLessons.filter((l) => l.track === t && completedSet.has(l.id)).length;
    return { track: t, total, done };
  });

  const allSkills = userRoadmap?.phases.flatMap((p) => p.skills) ?? [];
  const completedSkills = allSkills.filter((s) => s.status === "completed").length;
  const activePhase = userRoadmap?.phases.find((p) => p.status === "active");
  const roadmapPct = allSkills.length > 0 ? Math.round((completedSkills / allSkills.length) * 100) : 0;

  const plan = userSub?.plan ?? "free";
  const firstName = user.name?.split(" ")[0] ?? "there";
  const goalLabel = userProfile?.goal ? getGoalLabel(userProfile.goal) : null;

  const journey = buildJourneyStatus({
    isOnboarded: Boolean(userProfile?.onboardedAt),
    hasCompletedAssessment: Boolean(completedAttempt),
    hasRoadmap: Boolean(userRoadmap),
    completedLessonsCount: totalCompletedCount,
  });

  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
      : null;

  const currentStreak = userStreak?.currentStreak ?? 0;
  const longestStreak = userStreak?.longestStreak ?? 0;

  const currentStep = journey.steps.find((s) => s.status === "current");
  const needsAction = currentStep?.id !== "learning" || totalCompletedCount === 0;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 pb-12 sm:px-0">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Good to see you, {firstName}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            {goalLabel && (
              <>
                <span className="font-medium text-foreground">{goalLabel}</span>
                <span className="text-muted-foreground/40">·</span>
              </>
            )}
            {plan === "free" ? (
              <>
                Free plan ·{" "}
                <Link
                  href="/pricing"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Upgrade to Pro
                </Link>
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-green/30 bg-brand-green/8 px-2.5 py-0.5 text-xs font-medium text-brand-green">
                Pro plan
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Next step banner */}
      {needsAction && (
        <div className="rounded-2xl border border-brand-green/20 bg-gradient-to-br from-brand-green/5 to-transparent p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <div className="mb-3 flex items-center gap-1.5">
                {journey.steps.map((step, i) => (
                  <div key={step.id} className="flex items-center gap-1">
                    <div
                      className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                        step.status === "complete"
                          ? "bg-brand-green"
                          : step.status === "current"
                          ? "h-2 w-2 bg-brand-green ring-2 ring-brand-green/25 ring-offset-1"
                          : "bg-border"
                      }`}
                    />
                    {i < journey.steps.length - 1 && (
                      <div
                        className={`h-px w-4 transition-colors ${
                          step.status === "complete" ? "bg-brand-green/50" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                ))}
                <span className="ml-2 text-[11px] font-medium text-muted-foreground">
                  {journey.steps.filter((s) => s.status === "complete").length} of {journey.steps.length} steps
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground">{journey.headline}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{journey.message}</p>
            </div>
            <Link
              href={journey.cta.href}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-brand-green/90 hover:shadow-md active:scale-[0.98]"
            >
              {journey.cta.label}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Today's Tariq — next uncompleted lesson */}
      {nextTariq && (
        <div className="rounded-2xl border-l-4 border-l-brand-green border border-brand-green/15 bg-card p-5 shadow-sm">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Today&apos;s Tariq
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">GradifyHub always knows what to do today. You don&apos;t have to.</p>
          <h2 className="text-base font-semibold text-foreground leading-snug">
            {nextTariq.title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {nextTariq.dimension && (
              <span className="inline-flex items-center rounded-full bg-brand-green/10 px-2.5 py-0.5 text-[11px] font-medium text-brand-green">
                {nextTariq.dimension.replace(/_/g, " ")}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {nextTariq.estimatedMinutes} min
            </span>
          </div>
          <div className="mt-4">
            <Link
              href={`/learn/${nextTariq.slug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-brand-green/90 hover:shadow-md active:scale-[0.98]"
            >
              Start Tariq
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <div
          className={`group rounded-2xl border p-5 transition-all duration-150 hover:shadow-sm ${
            currentStreak > 0
              ? "border-orange-200/70 bg-orange-50/60 dark:border-orange-900/30 dark:bg-orange-950/20"
              : "hover:border-border/80"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={`text-2xl font-bold tabular-nums tracking-tight ${currentStreak > 0 ? "text-orange-500" : "text-foreground"}`}>
                {currentStreak}
              </p>
              <p className="mt-1 text-xs font-medium text-foreground">Streak</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
                {currentStreak > 0 ? `Best: ${longestStreak}d` : "Complete a lesson"}
              </p>
            </div>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${currentStreak > 0 ? "bg-orange-100 dark:bg-orange-900/30" : "bg-muted"}`}>
              <Flame className={`h-4 w-4 ${currentStreak > 0 ? "text-orange-400" : "text-muted-foreground/40"}`} />
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border p-5 transition-all duration-150 hover:border-border/80 hover:shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">{totalCompletedCount}</p>
              <p className="mt-1 text-xs font-medium text-foreground">Lessons done</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
                {totalCompletedCount > 0 ? "Keep it up" : "Start your first"}
              </p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted">
              <GraduationCap className="h-4 w-4 text-muted-foreground/50" />
            </div>
          </div>
        </div>

        <div
          className={`group rounded-2xl border p-5 transition-all duration-150 hover:shadow-sm ${
            roadmapPct > 0
              ? "border-brand-green/20 bg-brand-green/5"
              : "hover:border-border/80"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={`text-2xl font-bold tabular-nums tracking-tight ${roadmapPct > 0 ? "text-brand-green" : "text-foreground"}`}>
                {roadmapPct}%
              </p>
              <p className="mt-1 text-xs font-medium text-foreground">Roadmap</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
                {allSkills.length > 0 ? `${completedSkills}/${allSkills.length} skills` : "No Roadmap yet"}
              </p>
            </div>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${roadmapPct > 0 ? "bg-brand-green/10" : "bg-muted"}`}>
              <Target className={`h-4 w-4 ${roadmapPct > 0 ? "text-brand-green/70" : "text-muted-foreground/40"}`} />
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border p-5 transition-all duration-150 hover:border-border/80 hover:shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
                {avgScore !== null ? `${avgScore}%` : "—"}
              </p>
              <p className="mt-1 text-xs font-medium text-foreground">Skill score</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
                {avgScore !== null ? "Assessment avg." : "Start Assessment"}
              </p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted">
              <ClipboardList className="h-4 w-4 text-muted-foreground/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left: roadmap + activity */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          {userRoadmap ? (
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">{userRoadmap.title} Roadmap</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {roadmapPct}% complete · {completedSkills} of {allSkills.length} skills
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <ProgressRing value={roadmapPct} size={52}>
                    <span className="text-[10px] font-bold">{roadmapPct}%</span>
                  </ProgressRing>
                  <Link
                    href="/roadmap"
                    className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    View all →
                  </Link>
                </div>
              </div>
              <Progress value={roadmapPct} />
              {activePhase && (
                <div className="mt-4 rounded-xl bg-muted/50 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Now learning
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-foreground">{activePhase.name}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {activePhase.skills.slice(0, 5).map((s) => (
                      <Link
                        key={s.id}
                        href={`/roadmap/skill/${s.id}`}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-150 hover:opacity-80 hover:shadow-sm ${
                          s.status === "completed"
                            ? "bg-green-500/10 text-green-600"
                            : s.status === "in-progress"
                            ? "bg-brand-green/10 text-brand-green"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {s.name}
                      </Link>
                    ))}
                    {activePhase.skills.length > 5 && (
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                        +{activePhase.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : completedAttempt ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed p-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                <Map className="h-5 w-5 text-muted-foreground/60" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Ready to generate your Roadmap</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Assessment complete — let AI map your personalised learning path.
                </p>
              </div>
              <Link
                href="/roadmap/generate"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-brand-green/90 hover:shadow-md active:scale-[0.98]"
              >
                Generate Roadmap <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed p-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                <ClipboardList className="h-5 w-5 text-muted-foreground/60" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Run your Assessment</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  15 adaptive questions · ~12 min · unlocks your Roadmap
                </p>
              </div>
              <Link
                href="/assessment"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-brand-green/90 hover:shadow-md active:scale-[0.98]"
              >
                Start Assessment <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {/* Recent activity */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Recent activity</h2>
            </div>
            {recentLessons.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
                  <BookOpen className="h-4 w-4 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">No lessons completed yet.</p>
                <Link
                  href="/roadmap"
                  className="text-sm font-medium text-brand-green underline-offset-4 hover:underline"
                >
                  Go to your Roadmap →
                </Link>
              </div>
            ) : (
              <ol className="divide-y divide-border/60">
                {recentLessons.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/learn/${item.lesson.slug}?from=roadmap`}
                      className="group flex items-center gap-3 py-3 transition-colors hover:text-foreground"
                    >
                      <span className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green/60 transition-colors group-hover:bg-brand-green" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground/90 group-hover:text-foreground">
                          {item.lesson.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatShortDate(item.completedAt)}
                        </p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Learning tracks progress */}
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Learning tracks</h2>
              <Link
                href="/tracks"
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                All tracks →
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              {trackStats.map(({ track: t, total, done }) => {
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                const label = t === "ai-engineer" ? "AI Engineer" : t === "soft-skills" ? "Soft Skills" : "English Proficiency";
                const href = t === "ai-engineer" ? "/roadmap?track=ai-engineer" : t === "soft-skills" ? "/roadmap?track=soft-skills" : "/roadmap?track=english-proficiency";
                const cal = (userProfile?.aiCalibration ?? {}) as Record<string, unknown>;
                const foundationDone =
                  t === "ai-engineer"
                    ? cal.foundationCheckScore !== undefined
                    : t === "soft-skills"
                    ? cal.ssFoundationCheckScore !== undefined
                    : cal.engFoundationCheckScore !== undefined;
                const TrackIcon =
                  t === "ai-engineer" ? Brain : t === "soft-skills" ? BookOpen : MessageSquare;
                const iconClass =
                  t === "ai-engineer"
                    ? "text-blue-500"
                    : t === "soft-skills"
                    ? "text-purple-500"
                    : "text-sky-500";
                return (
                  <Link key={t} href={href} className="group block">
                    <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                      <span className="flex min-w-0 items-center gap-1.5 truncate text-muted-foreground transition-colors group-hover:text-foreground">
                        <TrackIcon className={`h-3.5 w-3.5 shrink-0 ${iconClass}`} />
                        {label}
                        <span
                          className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${foundationDone ? "bg-green-500" : "bg-muted-foreground/30"}`}
                        />
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums text-foreground">{done}/{total}</span>
                    </div>
                    <Progress value={pct} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Skill profile */}
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Skill profile</h2>
              {completedAttempt && (
                <Link
                  href={`/assessment/results/${completedAttempt.id}`}
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Details →
                </Link>
              )}
            </div>
            {scores.length > 0 ? (
              <div className="flex flex-col gap-4">
                {scores.map(({ label, score }) => (
                  <div key={label}>
                    <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                      <span className="truncate text-muted-foreground">{label}</span>
                      <span
                        className={`shrink-0 font-semibold tabular-nums ${
                          score >= 70
                            ? "text-green-600"
                            : score >= 40
                            ? "text-amber-500"
                            : "text-destructive"
                        }`}
                      >
                        {score}%
                      </span>
                    </div>
                    <Progress
                      value={score}
                      color={score >= 70 ? "green" : score >= 40 ? "amber" : "default"}
                    />
                  </div>
                ))}
                {!userProfile?.earnedLevels && (
                  <Link
                    href="/assessment/self-assessment"
                    className="mt-1 inline-flex w-full items-center justify-center rounded-xl border px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    Prove it with self-assessment →
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <p className="text-xs text-muted-foreground">
                  Skill breakdown appears after your Assessment.
                </p>
                <Link
                  href="/assessment"
                  className="text-xs font-medium text-brand-green underline-offset-4 hover:underline"
                >
                  Start Assessment →
                </Link>
              </div>
            )}
          </div>

          {/* Interview prep */}
          {latestInterviewSession ? (
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
                  <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">Interview Prep</h2>
              </div>
              <p className="text-sm font-medium text-foreground">
                {latestInterviewSession.targetRole} at {latestInterviewSession.targetCompany}
              </p>
              {(() => {
                const interviewDate = toValidDate(latestInterviewSession.interviewDate);
                if (!interviewDate) {
                  return <p className="mt-0.5 text-xs text-muted-foreground">Interview date unavailable</p>;
                }
                const days = Math.ceil((interviewDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {days > 0 ? `${days} day${days === 1 ? "" : "s"} until interview` : "Interview day!"}
                  </p>
                );
              })()}
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/interview-prep/${latestInterviewSession.id}`}
                  className="flex-1 rounded-xl border px-3 py-2 text-center text-xs font-semibold transition-colors hover:bg-muted"
                >
                  View plan
                </Link>
                <Link
                  href="/onboarding/interview-prep"
                  className="flex-1 rounded-xl bg-muted px-3 py-2 text-center text-xs font-semibold transition-colors hover:bg-muted/70"
                >
                  New prep
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">Interview prep</p>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
                    CV + job post → gap analysis + study plan
                  </p>
                  <Link
                    href="/onboarding/interview-prep"
                    className="mt-2 inline-flex text-xs font-medium text-brand-green underline-offset-4 hover:underline"
                  >
                    Start prep →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Quick links — only shown once the user has a roadmap; lessons are accessed via roadmap nodes only */}
          {userRoadmap && (
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Quick links</h2>
              <div className="flex flex-col gap-0.5">
                {[
                  { href: "/assessment", icon: Brain, label: "Run Assessment again" },
                  ...(totalCompletedCount >= 10
                    ? [{ href: "/resume", icon: FileText, label: "Resume builder" }]
                    : []),
                ].map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 transition-colors group-hover:text-foreground" />
                    <span>{label}</span>
                    <ArrowRight className="ml-auto h-3 w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <AssignedTutors userId={user.id} />
    </div>
  );
}
