import Link from "next/link";
import { eq, and, isNotNull, inArray } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { profile, lesson, lessonProgress } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { Brain, BookOpen, MessageSquare, ArrowRight, CheckCircle2, PlayCircle, Lock } from "lucide-react";
import { cn } from "~/lib/utils";

// ── Track definitions ─────────────────────────────────────────────────────────

const TRACKS = [
  {
    id:          "ai-engineer",
    label:       "AI Engineer",
    description: "Master LLMs, RAG, agentic patterns, and production-ready AI systems. Build the skills to land your first AI engineering role.",
    icon:        Brain,
    color:       "from-blue-500/10 to-indigo-500/10",
    borderColor: "border-blue-200 dark:border-blue-800",
    badgeColor:  "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    iconColor:   "text-blue-600 dark:text-blue-400",
    ctaColor:    "bg-blue-600 hover:bg-blue-700",
    barColor:    "bg-blue-500",
    totalLessons: 34,
    dimPrefix:   "ai",
    entryPath:   "/assessment/foundation-check",
    activePath:  "/roadmap?track=ai-engineer",
  },
  {
    id:          "soft-skills",
    label:       "Soft Skills",
    description: "Async communication, discovery calls, code-review collaboration, and conflict navigation — the invisible skills that get you promoted.",
    icon:        BookOpen,
    color:       "from-purple-500/10 to-violet-500/10",
    borderColor: "border-purple-200 dark:border-purple-800",
    badgeColor:  "bg-purple-500/10 text-purple-700 dark:text-purple-300",
    iconColor:   "text-purple-600 dark:text-purple-400",
    ctaColor:    "bg-purple-600 hover:bg-purple-700",
    barColor:    "bg-purple-500",
    totalLessons: 18,
    dimPrefix:   "ss",
    entryPath:   "/assessment/foundation-check-ss",
    activePath:  "/roadmap?track=soft-skills",
  },
  {
    id:          "english-proficiency",
    label:       "English Proficiency",
    description: "Read API docs without translating, ship clear PR descriptions, join stand-ups confidently, and communicate across time zones.",
    icon:        MessageSquare,
    color:       "from-sky-500/10 to-cyan-500/10",
    borderColor: "border-sky-200 dark:border-sky-800",
    badgeColor:  "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    iconColor:   "text-sky-600 dark:text-sky-400",
    ctaColor:    "bg-sky-600 hover:bg-sky-700",
    barColor:    "bg-sky-500",
    totalLessons: 15,
    dimPrefix:   "eng",
    entryPath:   "/assessment/foundation-check-eng",
    activePath:  "/roadmap?track=english-proficiency",
  },
] as const;

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function TracksPage() {
  const user = await requireAuth();

  // Fetch profile for foundation check status per track
  const userProfile = await db.query.profile.findFirst({
    where: eq(profile.userId, user.id),
    columns: { aiCalibration: true, goal: true },
  });

  const AI_TRACK_GOALS = ["ai_ml_engineer", "land_first_ai_role", "software_to_ai", "freelance_ai_engineer", "ml_engineer", "ml_research_to_production"];
  const primaryTrackSlug = userProfile?.goal && AI_TRACK_GOALS.includes(userProfile.goal) ? "ai-engineer" : null;

  const aiCalib = (userProfile?.aiCalibration ?? {}) as Record<string, unknown>;

  // Fetch completed lesson count per track (dimension prefix match)
  const completedRows = await db.query.lessonProgress.findMany({
    where: and(eq(lessonProgress.userId, user.id), isNotNull(lessonProgress.completedAt)),
    columns: { lessonId: true },
  });
  const completedLessonIds = completedRows.map((r) => r.lessonId);

  let lessonDims: Array<{ id: string; dimension: string | null }> = [];
  if (completedLessonIds.length > 0) {
    lessonDims = await db.query.lesson.findMany({
      where: inArray(lesson.id, completedLessonIds),
      columns: { id: true, dimension: true },
    });
  }

  function completedCountForPrefix(prefix: string): number {
    return lessonDims.filter((l) => l.dimension?.startsWith(prefix)).length;
  }

  // Determine per-track state
  function getTrackState(t: typeof TRACKS[number]): {
    status: "not-started" | "foundation-pending" | "active";
    completedLessons: number;
    cta: { label: string; href: string };
  } {
    const completedLessons = completedCountForPrefix(t.dimPrefix);

    if (t.id === "ai-engineer") {
      const hasCheck = aiCalib.foundationCheckScore !== undefined;
      if (!hasCheck) {
        return { status: "not-started", completedLessons, cta: { label: "Start assessment", href: t.entryPath } };
      }
      const score = aiCalib.foundationCheckScore as number;
      const pathDone = aiCalib.foundationPathCompletedAt !== undefined;
      if (score < 3 && !pathDone) {
        return { status: "foundation-pending", completedLessons, cta: { label: "Continue foundation path", href: "/assessment/foundation-path" } };
      }
      return { status: "active", completedLessons, cta: { label: "Go to roadmap", href: t.activePath } };
    }

    if (t.id === "soft-skills") {
      const hasCheck = aiCalib.ssFoundationCheckScore !== undefined;
      if (!hasCheck) {
        return { status: "not-started", completedLessons, cta: { label: "Start assessment", href: t.entryPath } };
      }
      const score = aiCalib.ssFoundationCheckScore as number;
      const pathDone = aiCalib.ssFoundationPathCompletedAt !== undefined;
      if (score < 3 && !pathDone) {
        return { status: "foundation-pending", completedLessons, cta: { label: "Continue foundation path", href: "/assessment/foundation-path-ss" } };
      }
      return { status: "active", completedLessons, cta: { label: "Go to roadmap", href: t.activePath } };
    }

    if (t.id === "english-proficiency") {
      const hasCheck = aiCalib.engFoundationCheckScore !== undefined;
      if (!hasCheck) {
        return { status: "not-started", completedLessons, cta: { label: "Start assessment", href: t.entryPath } };
      }
      const score = aiCalib.engFoundationCheckScore as number;
      const pathDone = aiCalib.engFoundationPathCompletedAt !== undefined;
      if (score < 3 && !pathDone) {
        return { status: "foundation-pending", completedLessons, cta: { label: "Continue foundation path", href: "/assessment/foundation-path-eng" } };
      }
      return { status: "active", completedLessons, cta: { label: "Go to roadmap", href: t.activePath } };
    }

    // Exhaustive — all track ids handled above
    return { status: "not-started" as const, completedLessons, cta: { label: "Start assessment", href: (t as (typeof TRACKS[number])).entryPath } };
  }

  const trackStates = TRACKS.map((t) => ({ ...t, ...getTrackState(t) }));

  const STATUS_LABELS: Record<string, string> = {
    "not-started":        "Not started",
    "foundation-pending": "Foundation in progress",
    "active":             "Active",
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 pb-10 pt-6 sm:px-0">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Learning tracks</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a track to start, or continue where you left off. All three are independent — you can work on any of them at your own pace.
        </p>
      </div>

      {/* Track cards */}
      <div className="grid gap-4">
        {trackStates.map((track) => {
          const Icon = track.icon;
          const StatusIcon =
            track.status === "active"           ? CheckCircle2 :
            track.status === "foundation-pending"? PlayCircle   : Lock;

          const pct = Math.round((track.completedLessons / track.totalLessons) * 100);

          return (
            <div
              key={track.id}
              className={cn(
                "relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6",
                track.color,
                track.borderColor,
              )}
            >
              {/* Top row: icon + status badge */}
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl bg-background/80", track.borderColor, "border")}>
                  <Icon className={cn("h-5 w-5", track.iconColor)} />
                </div>
                <div className="flex items-center gap-2">
                  {primaryTrackSlug === track.id && (
                    <span className="inline-flex items-center rounded-full border border-green-500 px-2.5 py-1 text-[11px] font-semibold text-green-700 dark:text-green-400">
                      Your track
                    </span>
                  )}
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", track.badgeColor)}>
                    <StatusIcon className="h-3 w-3" />
                    {STATUS_LABELS[track.status]}
                  </span>
                </div>
              </div>

              {/* Title + description */}
              <h2 className="mb-1.5 text-base font-semibold text-foreground">{track.label}</h2>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{track.description}</p>

              {/* Progress bar */}
              <div className="mb-5">
                <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{track.completedLessons} / {track.totalLessons} lessons</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-background/60">
                  <div
                    className={cn("h-full rounded-full transition-all", track.barColor)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* CTA */}
              <Link
                href={track.cta.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90",
                  track.ctaColor,
                )}
              >
                {track.cta.label}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <p className="text-center text-xs text-muted-foreground">
        Track progress is saved automatically. You can switch between tracks at any time.
      </p>
    </div>
  );
}
