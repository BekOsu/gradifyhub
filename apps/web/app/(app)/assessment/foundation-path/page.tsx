import type React from "react";
import { redirect } from "next/navigation";
import { eq, and, inArray } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { lesson, lessonProgress, profile, roadmapCatalogNode } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { ArrowLeft, BookOpen, Code, Database, Clock } from "lucide-react";
import Link from "next/link";
import { ContinueButton } from "./continue-button";

const FOUNDATION_LESSON_SLUGS = [
  "python-memory-model",
  "python-lists",
  "python-dictionaries",
  "python-functions",
  "how-language-models-work",
  "calling-llm-apis",
];

type Resource = {
  id: string;
  type: string;
  title: string;
  url: string;
};

type FoundationLesson = {
  id: string;
  slug: string | null;
  title: string | null;
  description: string | null;
  estimatedMinutes: number;
  completedAt: Date | null;
  resources: Resource[];
};

export default async function FoundationPathPage() {
  const user = await requireAuth();

  // Check foundation-check score & path completion
  const userProfile = await db.query.profile.findFirst({
    where: eq(profile.userId, user.id),
  });

  const aiCalib = (userProfile?.aiCalibration as Record<string, unknown>) || {};
  const foundationCheckScore = aiCalib?.foundationCheckScore as number | undefined;
  const hasCompletedFoundationPath = aiCalib?.foundationPathCompletedAt !== undefined;

  // If already completed, redirect to assessment
  if (hasCompletedFoundationPath) {
    redirect("/assessment");
  }

  // If no foundation-check score or score >= 3, they don't need foundation path
  if (foundationCheckScore === undefined || foundationCheckScore >= 3) {
    redirect("/assessment");
  }

  // Fetch the 3 foundation lessons
  const lessons = await db.query.lesson.findMany({
    where: inArray(lesson.slug, FOUNDATION_LESSON_SLUGS),
  });

  // VALIDATION: Ensure all 3 lessons exist in database
  if (lessons.length !== FOUNDATION_LESSON_SLUGS.length) {
    const foundSlugs = lessons.map((l) => l.slug);
    const missingSlugs = FOUNDATION_LESSON_SLUGS.filter((s) => !foundSlugs.includes(s));
    console.error(
      "[foundation-path] Missing foundation lessons in database:",
      missingSlugs
    );
    // Fail gracefully - show error instead of silent failure
    return (
      <div className="mx-auto max-w-2xl py-12 px-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/30">
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Configuration Error
          </h2>
          <p className="text-sm text-red-800 dark:text-red-200 mb-4">
            Some foundation lessons are not available. Please contact support.
          </p>
          <p className="text-xs text-red-700 dark:text-red-300">
            Missing: {missingSlugs.join(", ")}
          </p>
        </div>
      </div>
    );
  }

  // Fetch user's progress on these lessons
  const progressRecords = await db.query.lessonProgress.findMany({
    where: and(
      eq(lessonProgress.userId, user.id),
      inArray(lessonProgress.lessonId, lessons.map((l) => l.id))
    ),
  });

  const progressMap = new Map(progressRecords.map((p) => [p.lessonId, p]));

  // Fetch roadmap nodes linked to these lessons and their resources
  const lessonIds = lessons.map((l) => l.id);
  const roadmapNodes = await db.query.roadmapCatalogNode.findMany({
    where: inArray(roadmapCatalogNode.lessonId, lessonIds),
    with: {
      content: {
        orderBy: (content, { asc }) => [asc(content.order)],
      },
    },
  });

  // Build a Map of lessonId → resources[]
  const resourcesByLessonId = new Map<string, Resource[]>();
  for (const node of roadmapNodes) {
    if (node.lessonId) {
      const resources = node.content.map((c) => ({
        id: c.id,
        type: c.type,
        title: c.title,
        url: c.url,
      }));
      resourcesByLessonId.set(node.lessonId, resources);
    }
  }

  // Build foundation lessons with completion status and resources
  const foundationLessons: FoundationLesson[] = lessons.map((l) => ({
    id: l.id,
    slug: l.slug,
    title: l.title,
    description: l.description,
    estimatedMinutes: l.estimatedMinutes,
    completedAt: progressMap.get(l.id)?.completedAt ?? null,
    resources: resourcesByLessonId.get(l.id) ?? [],
  }));

  // Sort by the order they appear in FOUNDATION_LESSON_SLUGS
  foundationLessons.sort((a, b) => {
    const aIdx = FOUNDATION_LESSON_SLUGS.indexOf(a.slug || "");
    const bIdx = FOUNDATION_LESSON_SLUGS.indexOf(b.slug || "");
    return aIdx - bIdx;
  });

  const allCompleted = foundationLessons.every((l) => l.completedAt !== null);

  const LESSON_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    "python-memory-model": Code,
    "python-lists": Code,
    "python-dictionaries": Database,
    "python-functions": Code,
    "how-language-models-work": BookOpen,
    "calling-llm-apis": Database,
  };

  const getResourceIcon = (type: string): string => {
    switch (type) {
      case "course":
        return "📚";
      case "video":
        return "🎥";
      case "article":
      case "official":
      case "opensource":
        return "📄";
      default:
        return "📄";
    }
  };

  const truncateTitle = (title: string, maxLength: number = 50): string => {
    return title.length > maxLength ? title.slice(0, maxLength) + "..." : title;
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-16 px-4 sm:px-6 lg:px-8">
      {/* ── Back nav ── */}
      <Link
        href="/assessment"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to assessment
      </Link>

      {/* ── Hero ── */}
      <div className="space-y-4">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green/10 px-3 py-1 text-xs font-semibold text-brand-green">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
            Foundation Learning Path
          </span>
          <h1 className="text-3xl font-bold tracking-tight">
            Build your foundation
          </h1>
          <p className="text-base text-muted-foreground max-w-lg">
            Complete these six lessons to build a strong Python and AI foundation before the main assessment. Each has interactive examples and a quiz.
          </p>
        </div>
      </div>

      {/* ── Lessons ── */}
      <div className="space-y-3">
        {foundationLessons.map((lesson) => {
          const IconComponent = lesson.slug ? LESSON_ICONS[lesson.slug] : BookOpen;
          const isCompleted = lesson.completedAt !== null;

          return (
            <Link
              key={lesson.id}
              href={`/learn/${lesson.slug}?from=foundation-path`}
              className={`block rounded-lg border p-5 space-y-3 transition-all ${
                isCompleted
                  ? "border-brand-green/30 bg-brand-green/5 hover:bg-brand-green/8"
                  : "border-border bg-card hover:border-border/80 hover:shadow-sm hover:bg-muted/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      isCompleted ? "bg-brand-green/20" : "bg-muted"
                    }`}
                  >
                    {IconComponent && (
                      <IconComponent
                        className={`h-4 w-4 ${
                          isCompleted ? "text-brand-green" : "text-muted-foreground"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {lesson.description}
                    </p>

                    {/* Resources section */}
                    {lesson.resources.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
                        <p className="text-xs font-medium text-muted-foreground">Resources:</p>
                        <div className="flex flex-wrap gap-2">
                          {lesson.resources.map((resource) => (
                            <a
                              key={resource.id}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <span>{getResourceIcon(resource.type)}</span>
                              <span className="underline">
                                {truncateTitle(resource.title, 40)}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        ~{lesson.estimatedMinutes} min
                      </div>
                      {!isCompleted && (
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          Start lesson →
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {isCompleted ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-brand-green">Completed</span>
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-green">
                        <svg
                          className="h-3 w-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
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

      {/* ── Progress ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Progress</p>
          <p className="text-xs text-muted-foreground">
            {foundationLessons.filter((l) => l.completedAt).length} of{" "}
            {foundationLessons.length} complete
          </p>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-brand-green transition-all duration-300"
            style={{
              width: `${
                (foundationLessons.filter((l) => l.completedAt).length /
                  foundationLessons.length) *
                100
              }%`,
            }}
          />
        </div>
      </div>

      {/* ── Info ── */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <span className="font-semibold">How it works:</span> Click any lesson
          above to start learning. Complete the quiz with 70%+ to mark it done.
          Once all six are complete, you&apos;ll unlock the full 15-question
          assessment.
        </p>
      </div>

      {/* ── CTA ── */}
      <ContinueButton isEnabled={allCompleted} />
    </div>
  );
}
