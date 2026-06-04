import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, inArray } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { skill, lesson as lessonTable } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { getSkill } from "@repo/db/queries/roadmap";
import { getLessonsBySkill, getUserLessonProgress } from "@repo/db/queries/lessons";
import { Lock } from "lucide-react";

const DIFFICULTY_STYLES: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-600",
  intermediate: "bg-amber-500/10 text-amber-600",
  advanced: "bg-red-500/10 text-red-600",
};

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ skillId: string }>;
}) {
  const { skillId } = await params;
  const user = await requireAuth();

  const [currentSkill, lessons, progressRows] = await Promise.all([
    getSkill(user.id, skillId),
    getLessonsBySkill(skillId),
    getUserLessonProgress(user.id),
  ]);
  if (!currentSkill) notFound();

  // Auto-advance status: mark in-progress if locked and user is here
  if (currentSkill.status === "locked" && lessons.length > 0) {
    await db.update(skill).set({ status: "in-progress" }).where(eq(skill.id, skillId));
  }

  const progressMap = new Map(progressRows.map((p) => [p.lessonId, p]));
  const completedCount = lessons.filter((l) => !!progressMap.get(l.id)?.completedAt).length;
  const total = lessons.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const nextLesson = lessons.find((l) => !progressMap.get(l.id)?.completedAt);

  // ── Sequence gating (AI-Engineer track) ──────────────────────────────────
  // Compute userMaxCompletedSequence from real lesson_progress completedAt rows.
  let userMaxCompletedSequence = 0;
  const completedProgressRows = progressRows.filter((p) => !!p.completedAt);
  if (completedProgressRows.length > 0) {
    const completedLessonRows = await db.query.lesson.findMany({
      where: inArray(lessonTable.id, completedProgressRows.map((r) => r.lessonId)),
      columns: { globalSequenceIndex: true },
    });
    userMaxCompletedSequence = completedLessonRows.reduce(
      (max, l) => (l.globalSequenceIndex > max ? l.globalSequenceIndex : max),
      0,
    );
  }

  // A lesson is locked if its globalSequenceIndex > userMaxCompletedSequence + 1.
  // Lessons with index 0 (non-sequenced tracks) are never locked.
  function isLocked(globalSeq: number): boolean {
    if (globalSeq === 0) return false;
    return globalSeq > userMaxCompletedSequence + 1;
  }

  const nextLessonIsLocked = nextLesson
    ? isLocked((nextLesson as { globalSequenceIndex?: number }).globalSequenceIndex ?? 0)
    : false;

  const phase = currentSkill.phase as { name: string; id: string };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
        <Link href="/roadmap" className="hover:text-foreground transition-colors">Roadmap</Link>
        <span>/</span>
        <Link href="/roadmap" className="hover:text-foreground transition-colors">{phase.name}</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{currentSkill.name}</span>
      </div>

      {/* Header */}
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{currentSkill.name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>~{currentSkill.estimatedHours}h</span>
              {currentSkill.marketBadge && (
                <span className="font-medium text-green-600">{currentSkill.marketBadge}</span>
              )}
              {total > 0 && (
                <span>{completedCount}/{total} lessons done</span>
              )}
            </div>
          </div>
          {nextLesson && !nextLessonIsLocked && (
            <Link
              href={`/learn/${nextLesson.slug}?from=roadmap`}
              className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {completedCount === 0 ? "Start learning" : "Continue"} →
            </Link>
          )}
          {nextLesson && nextLessonIsLocked && (
            <div className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted px-5 py-2.5 text-sm font-semibold text-muted-foreground cursor-not-allowed">
              <Lock className="h-3.5 w-3.5" />
              Locked
            </div>
          )}
          {total > 0 && completedCount === total && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Completed
            </span>
          )}
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="mt-5">
            <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Completion CTA */}
      {total > 0 && completedCount === total && (
        <div className="rounded-xl border border-green-200 bg-green-50/50 p-5 dark:border-green-900 dark:bg-green-950/20">
          <p className="font-semibold text-green-700 dark:text-green-400">Skill complete!</p>
          <p className="mt-0.5 text-sm text-muted-foreground">All lessons done. Head back to your roadmap to pick the next skill.</p>
          <Link
            href="/roadmap"
            className="mt-3 inline-flex rounded-full bg-brand-green px-5 py-2 text-sm font-semibold text-white hover:bg-brand-green/90"
          >
            Back to roadmap →
          </Link>
        </div>
      )}

      {/* Lesson list */}
      {lessons.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="text-sm font-medium">Lessons being prepared</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Content for this skill will be added soon. Check back shortly.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {lessons.map((lesson, i) => {
            const progress = progressMap.get(lesson.id);
            const done = !!progress?.completedAt;
            const isCurrent = !done && lesson.id === nextLesson?.id;
            const locked = !done && isLocked((lesson as { globalSequenceIndex?: number }).globalSequenceIndex ?? 0);
            const diffClass = DIFFICULTY_STYLES[lesson.difficulty] ?? "bg-muted text-muted-foreground";

            const cardContent = (
              <>
                {/* Step indicator */}
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  done
                    ? "bg-green-500 text-white"
                    : locked
                    ? "bg-muted/60 text-muted-foreground/40"
                    : isCurrent
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {done ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : locked ? (
                    <Lock className="h-3.5 w-3.5" />
                  ) : (
                    i + 1
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium leading-tight ${done || locked ? "text-muted-foreground" : "text-foreground"}`}>
                    {lesson.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${locked ? "bg-muted text-muted-foreground/50" : diffClass}`}>
                      {lesson.difficulty}
                    </span>
                    <span className="text-xs text-muted-foreground">{lesson.estimatedMinutes} min</span>
                    {done && progress?.quizScore != null && (
                      <span className="text-xs text-muted-foreground">Score: {progress.quizScore}%</span>
                    )}
                    {locked && (
                      <span className="text-xs text-muted-foreground/60">Complete previous lesson to unlock</span>
                    )}
                  </div>
                </div>

                {/* Right indicator */}
                {locked ? (
                  <Lock className="h-4 w-4 shrink-0 text-muted-foreground/30" />
                ) : (
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                )}
              </>
            );

            if (locked) {
              return (
                <div
                  key={lesson.id}
                  className="flex items-center gap-4 rounded-xl border border-border/40 bg-muted/20 p-4 opacity-60 cursor-not-allowed"
                >
                  {cardContent}
                </div>
              );
            }

            return (
              <Link
                key={lesson.id}
                href={`/learn/${lesson.slug}?from=roadmap`}
                className={`group flex items-center gap-4 rounded-xl border p-4 transition-all hover:shadow-sm ${
                  isCurrent
                    ? "border-primary/40 bg-primary/5"
                    : done
                    ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20"
                    : "hover:border-foreground/20"
                }`}
              >
                {cardContent}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
