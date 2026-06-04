import { eq, and, isNotNull } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import {
  lessonProgress,
  userSkillProgress,
  streak,
  roadmap,
  profile,
} from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { BookOpen, Flame, Target, Map, Brain, MessageSquare } from "lucide-react";
import Link from "next/link";
import { OutcomeTracker } from "./outcome-tracker";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 rounded-2xl border bg-card p-5 transition-all hover:shadow-sm">
      <Icon className="mb-2 h-4 w-4 text-muted-foreground/70" />
      <span className="text-2xl font-bold tabular-nums tracking-tight">{value}</span>
      <span className="text-center text-xs text-muted-foreground leading-snug">{label}</span>
    </div>
  );
}

export default async function AccountActivityPage() {
  const user = await requireAuth();

  const [
    completedLessons,
    inProgressSkills,
    userStreak,
    recentLessons,
    userRoadmap,
    userProfile,
  ] = await Promise.all([
    db.query.lessonProgress.findMany({
      where: and(eq(lessonProgress.userId, user.id), isNotNull(lessonProgress.completedAt)),
      with: { lesson: true },
    }),
    db.query.userSkillProgress.findMany({
      where: and(
        eq(userSkillProgress.userId, user.id),
        eq(userSkillProgress.status, "in-progress"),
      ),
    }),
    db.query.streak.findFirst({ where: eq(streak.userId, user.id) }),
    db.query.lessonProgress.findMany({
      where: and(eq(lessonProgress.userId, user.id), isNotNull(lessonProgress.completedAt)),
      orderBy: (lp, { desc }) => [desc(lp.completedAt)],
      limit: 8,
      with: { lesson: true },
    }),
    db.query.roadmap.findFirst({
      where: eq(roadmap.userId, user.id),
      with: { phases: { with: { skills: true } } },
    }),
    db.query.profile.findFirst({
      where: eq(profile.userId, user.id),
    }),
  ]);

  const totalSkills = userRoadmap?.phases.flatMap((p) => p.skills).length ?? 0;
  const completedSkills =
    userRoadmap?.phases
      .flatMap((p) => p.skills)
      .filter((s) => s.status === "completed").length ?? 0;

  const TRACK_TOTALS = {
    "ai-engineer": 34,
    "soft-skills": 18,
    "english-proficiency": 15,
  } as const;

  function completedForTrack(track: string) {
    return completedLessons.filter((lp) => lp.lesson?.track === track).length;
  }

  const trackBadgeData = [
    {
      id: "ai-engineer" as const,
      label: "AI Engineer",
      icon: Brain,
      color: "blue",
      done: completedForTrack("ai-engineer"),
      total: TRACK_TOTALS["ai-engineer"],
    },
    {
      id: "soft-skills" as const,
      label: "Soft Skills",
      icon: MessageSquare,
      color: "purple",
      done: completedForTrack("soft-skills"),
      total: TRACK_TOTALS["soft-skills"],
    },
    {
      id: "english-proficiency" as const,
      label: "English",
      icon: BookOpen,
      color: "sky",
      done: completedForTrack("english-proficiency"),
      total: TRACK_TOTALS["english-proficiency"],
    },
  ] as const;

  function getBadgeTier(
    done: number,
    total: number,
  ): "none" | "first" | "started" | "halfway" | "complete" {
    if (done === 0) return "none";
    if (done >= total) return "complete";
    if (done >= Math.floor(total / 2)) return "halfway";
    if (done >= 5) return "started";
    return "first";
  }

  function formatDate(d: Date | null | undefined) {
    if (!d) return "";
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
      new Date(d),
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Activity</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your learning progress at a glance.
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <StatCard
          label="Topics Completed"
          value={completedLessons.length}
          icon={BookOpen}
        />
        <StatCard
          label="Currently Learning"
          value={inProgressSkills.length}
          icon={Target}
        />
        <StatCard
          label="Streak"
          value={`${userStreak?.currentStreak ?? 0}d`}
          icon={Flame}
        />
      </div>

      {/* Track milestones */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <p className="mb-4 text-sm font-semibold">Track milestones</p>
        <div className="space-y-4">
          {trackBadgeData.map(({ id, label, icon: TrackIcon, color, done, total }) => {
            const tier = getBadgeTier(done, total);
            const earnedCls =
              color === "blue"
                ? "bg-blue-500/10 text-blue-700"
                : color === "purple"
                  ? "bg-purple-500/10 text-purple-700"
                  : "bg-sky-500/10 text-sky-700";
            const unearnedCls = "bg-muted text-muted-foreground/40";
            const chip = (earned: boolean, emoji: string, chipLabel: string) => (
              <span
                key={chipLabel}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${earned ? earnedCls : unearnedCls}`}
              >
                {emoji} {chipLabel}
              </span>
            );
            return (
              <div key={id}>
                <div className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <TrackIcon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                  <span className="ml-auto tabular-nums">
                    {done}/{total}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {chip(tier !== "none", "🎯", "First lesson")}
                  {chip(tier === "started" || tier === "halfway" || tier === "complete", "📚", "Getting started")}
                  {chip(tier === "halfway" || tier === "complete", "⚡", "Halfway")}
                  {chip(tier === "complete", "🏆", "Complete")}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Roadmap progress */}
      {userRoadmap && totalSkills > 0 && (
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Map className="h-4 w-4 text-muted-foreground" />
              Roadmap progress
            </div>
            <span className="text-xs text-muted-foreground">
              {completedSkills} / {totalSkills} skills
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-brand-green transition-all"
              style={{ width: `${Math.round((completedSkills / totalSkills) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {Math.round((completedSkills / totalSkills) * 100)}% complete
          </p>
        </div>
      )}

      {/* ── Outcome tracker (Stage 4 — data moat) ── */}
      <OutcomeTracker currentOutcome={(userProfile?.aiCalibration as Record<string, unknown>)?.outcome as string | undefined} />

      {/* Recent lessons */}
      <div>
        <h2 className="mb-3 text-sm font-semibold">Recent activity</h2>
        {recentLessons.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center">
            <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium">No progress yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Progress will appear here as you complete lessons.{" "}
              <Link href="/learn" className="text-brand-green hover:underline">
                Start learning →
              </Link>
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60 rounded-2xl border bg-card">
            {recentLessons.map((lp) => (
              <div key={lp.id} className="flex items-center justify-between px-4 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{lp.lesson?.title ?? "Lesson"}</p>
                  {lp.quizScore !== null && (
                    <p className="text-xs text-muted-foreground">
                      Quiz score: {lp.quizScore}%
                    </p>
                  )}
                </div>
                <span className="ml-4 shrink-0 text-xs text-muted-foreground">
                  {formatDate(lp.completedAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
