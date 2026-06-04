import { redirect } from "next/navigation";
import { eq, and, inArray } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { lesson, lessonProgress, profile, roadmapCatalogNode } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { ArrowLeft, BookOpen, Headphones, PenLine, Clock } from "lucide-react";
import Link from "next/link";
import { ContinueButton } from "./continue-button";

const FOUNDATION_LESSON_SLUGS = [
  "eng-reading-api-docs-without-translating",
  "eng-tech-podcasts-at-1x",
  "eng-pr-descriptions-code-comments-english",
];

type Resource = { id: string; type: string; title: string; url: string };

type FoundationLesson = {
  id: string;
  slug: string | null;
  title: string | null;
  description: string | null;
  estimatedMinutes: number;
  completedAt: Date | null;
  resources: Resource[];
};

const LESSON_ICONS: Record<string, React.ElementType> = {
  "eng-reading-api-docs-without-translating": BookOpen,
  "eng-tech-podcasts-at-1x": Headphones,
  "eng-pr-descriptions-code-comments-english": PenLine,
};

export default async function FoundationPathEngPage() {
  const user = await requireAuth();

  const userProfile = await db.query.profile.findFirst({
    where: eq(profile.userId, user.id),
  });

  const aiCalib = (userProfile?.aiCalibration as Record<string, unknown>) || {};
  const engFoundationCheckScore = aiCalib?.engFoundationCheckScore as number | undefined;
  const hasCompletedFoundationPath = aiCalib?.engFoundationPathCompletedAt !== undefined;

  if (hasCompletedFoundationPath) {
    redirect("/roadmap?track=english-proficiency");
  }

  if (!engFoundationCheckScore || engFoundationCheckScore >= 3) {
    redirect("/roadmap?track=english-proficiency");
  }

  const lessons = await db.query.lesson.findMany({
    where: inArray(lesson.slug, FOUNDATION_LESSON_SLUGS),
  });

  if (lessons.length !== FOUNDATION_LESSON_SLUGS.length) {
    const foundSlugs = lessons.map((l) => l.slug);
    const missingSlugs = FOUNDATION_LESSON_SLUGS.filter((s) => !foundSlugs.includes(s));
    console.error("[foundation-path-eng] Missing lessons:", missingSlugs);
    return (
      <div className="mx-auto max-w-2xl py-12 px-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/30">
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Configuration Error</h2>
          <p className="text-sm text-red-800 dark:text-red-200 mb-4">
            Some foundation lessons are not available. Please contact support.
          </p>
          <p className="text-xs text-red-700 dark:text-red-300">Missing: {missingSlugs.join(", ")}</p>
        </div>
      </div>
    );
  }

  const progressRecords = await db.query.lessonProgress.findMany({
    where: and(
      eq(lessonProgress.userId, user.id),
      inArray(lessonProgress.lessonId, lessons.map((l) => l.id)),
    ),
  });

  const progressMap = new Map(progressRecords.map((p) => [p.lessonId, p]));
  const lessonIds = lessons.map((l) => l.id);
  const roadmapNodes = await db.query.roadmapCatalogNode.findMany({
    where: inArray(roadmapCatalogNode.lessonId, lessonIds),
    with: { content: { orderBy: (c, { asc }) => [asc(c.order)] } },
  });

  const resourcesByLessonId = new Map<string, Resource[]>();
  for (const node of roadmapNodes) {
    if (node.lessonId) {
      resourcesByLessonId.set(
        node.lessonId,
        node.content.map((c) => ({ id: c.id, type: c.type, title: c.title, url: c.url })),
      );
    }
  }

  const foundationLessons: FoundationLesson[] = lessons
    .map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      description: l.description,
      estimatedMinutes: l.estimatedMinutes,
      completedAt: progressMap.get(l.id)?.completedAt ?? null,
      resources: resourcesByLessonId.get(l.id) ?? [],
    }))
    .sort((a, b) => FOUNDATION_LESSON_SLUGS.indexOf(a.slug || "") - FOUNDATION_LESSON_SLUGS.indexOf(b.slug || ""));

  const allCompleted = foundationLessons.every((l) => l.completedAt !== null);

  const getResourceIcon = (type: string) =>
    ({ course: "📚", video: "🎥" }[type] ?? "📄");

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-16 px-4 sm:px-6 lg:px-8">
      <Link
        href="/roadmap?track=english-proficiency"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to English track
      </Link>

      <div className="space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-600">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
          English Proficiency · Foundation Path
        </span>
        <h1 className="text-3xl font-bold tracking-tight">Build your English foundation</h1>
        <p className="text-base text-muted-foreground max-w-lg">
          Complete these three lessons to unlock the full English Proficiency roadmap.
        </p>
      </div>

      <div className="space-y-3">
        {foundationLessons.map((l) => {
          const IconComponent = l.slug ? LESSON_ICONS[l.slug] : BookOpen;
          const isCompleted = l.completedAt !== null;

          return (
            <Link
              key={l.id}
              href={`/learn/${l.slug}?from=foundation-path-eng`}
              className={`block rounded-lg border p-5 space-y-3 transition-all ${
                isCompleted
                  ? "border-sky-300/40 bg-sky-500/5 hover:bg-sky-500/8"
                  : "border-border bg-card hover:border-border/80 hover:shadow-sm hover:bg-muted/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isCompleted ? "bg-sky-500/20" : "bg-muted"}`}>
                    {IconComponent && <IconComponent className={`h-4 w-4 ${isCompleted ? "text-sky-600" : "text-muted-foreground"}`} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{l.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{l.description}</p>

                    {l.resources.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
                        <p className="text-xs font-medium text-muted-foreground">Resources:</p>
                        <div className="flex flex-wrap gap-2">
                          {l.resources.map((r) => (
                            <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                              <span>{getResourceIcon(r.type)}</span>
                              <span className="underline">{r.title.length > 40 ? r.title.slice(0, 40) + "..." : r.title}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        ~{l.estimatedMinutes} min
                      </div>
                      {!isCompleted && <span className="text-xs font-medium text-sky-600">Start lesson →</span>}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {isCompleted ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-sky-600">Completed</span>
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500">
                        <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-border" />
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Progress</p>
          <p className="text-xs text-muted-foreground">
            {foundationLessons.filter((l) => l.completedAt).length} of {foundationLessons.length} complete
          </p>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-sky-500 transition-all duration-300"
            style={{ width: `${(foundationLessons.filter((l) => l.completedAt).length / foundationLessons.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-950/30">
        <p className="text-xs text-sky-700 dark:text-sky-300">
          <span className="font-semibold">How it works:</span> Complete each lesson&apos;s quiz with 70%+ to mark it done. Once all three are complete, the full roadmap unlocks.
        </p>
      </div>

      <ContinueButton isEnabled={allCompleted} />
    </div>
  );
}
