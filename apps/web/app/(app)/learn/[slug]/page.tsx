import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { eq, asc, and, inArray } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { lesson, quiz, lessonProgress, roadmapCatalogNode, roadmapCatalogContent } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { SectionedLesson } from "~/components/lesson/sectioned-lesson";
import { LessonMarkdown } from "~/components/lesson/markdown-render";
import { QuizSection } from "./quiz";
import { ReadingProgressBar } from "./reading-progress";

function splitIntoSections(
  source: string
): Array<{ title: string; source: string }> {
  const lines = source.split("\n");
  const sections: Array<{ title: string; source: string }> = [];
  let currentTitle = "";
  let currentLines: string[] = [];

  for (const line of lines) {
    const h2 = line.match(/^## (.+?)\s*$/);
    if (h2) {
      if (currentLines.some((l) => l.trim())) {
        sections.push({ title: currentTitle, source: currentLines.join("\n") });
      }
      currentTitle = h2[1] ?? "";
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }

  if (currentLines.some((l) => l.trim())) {
    sections.push({ title: currentTitle, source: currentLines.join("\n") });
  }

  return sections.filter((s) => s.source.trim());
}

// Maps our lesson dimension to the roadmap.sh roadmap slug that has relevant resources.
const DIMENSION_TO_ROADMAP: Record<string, string> = {
  python: "python",
  llm_fundamentals_evals: "ai-engineer",
  context_engineering: "ai-engineer",
  system_design: "system-design",
  agentic_patterns: "ai-agents",
  rag_retrieval: "machine-learning",
  tooling_workflow: "devops",
};

const RESOURCE_TYPE_ORDER: Record<string, number> = {
  video: 1,
  course: 2,
  official: 3,
  article: 4,
  opensource: 5,
};

type CatalogResource = { type: string; title: string; url: string };

async function getGoingDeeperResources(dimension: string | null): Promise<CatalogResource[]> {
  if (!dimension) return [];
  const roadmapSlug = DIMENSION_TO_ROADMAP[dimension];
  if (!roadmapSlug) return [];

  try {
    const nodes = await db.query.roadmapCatalogNode.findMany({
      where: eq(roadmapCatalogNode.roadmapId, roadmapSlug),
      orderBy: [asc(roadmapCatalogNode.order)],
      limit: 8,
      columns: { id: true },
    });
    if (nodes.length === 0) return [];

    const nodeIds = nodes.map((n) => n.id);
    // Fetch at most 40 rows (8 nodes × max ~5 resources each) to avoid unbounded reads.
    const content = await db.query.roadmapCatalogContent.findMany({
      where: inArray(roadmapCatalogContent.nodeId, nodeIds),
      orderBy: [asc(roadmapCatalogContent.order)],
      limit: 40,
      columns: { type: true, title: true, url: true },
    });

    // Deduplicate by URL, sort by type priority, cap at 8.
    const seen = new Set<string>();
    const deduped: CatalogResource[] = [];
    for (const r of content) {
      if (!seen.has(r.url)) {
        seen.add(r.url);
        deduped.push(r);
      }
    }

    return deduped
      .sort((a, b) => (RESOURCE_TYPE_ORDER[a.type] ?? 9) - (RESOURCE_TYPE_ORDER[b.type] ?? 9))
      .slice(0, 8);
  } catch {
    // Non-fatal: resources section is additive. Don't crash the lesson page.
    return [];
  }
}

const DIFFICULTY_STYLES: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-600",
  intermediate: "bg-amber-500/10 text-amber-600",
  advanced: "bg-red-500/10 text-red-600",
};

type Quiz = {
  id: string;
  question: string;
  choices: { id: string; label: string; correct: boolean }[];
  order: number;
};

type LessonOrigin = "foundation-path" | "roadmap";

function parseOrigin(value: string | undefined): LessonOrigin | null {
  if (value === "foundation-path" || value === "roadmap") return value;
  return null;
}

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { slug } = await params;
  const { from } = await searchParams;
  const origin = parseOrigin(from);

  // Lessons are only accessible via foundation-path or roadmap. Block direct access.
  if (!origin) redirect("/roadmap");

  const user = await requireAuth();

  const row = await db.query.lesson.findFirst({
    where: eq(lesson.slug, slug),
  });
  if (!row) notFound();

  const [quizRows, progressRow, goingDeeper] = await Promise.all([
    db.query.quiz.findMany({
      where: eq(quiz.lessonId, row.id),
      orderBy: [asc(quiz.order)],
    }),
    db.query.lessonProgress.findFirst({
      where: and(eq(lessonProgress.userId, user.id), eq(lessonProgress.lessonId, row.id)),
    }),
    getGoingDeeperResources(row.dimension ?? null),
  ]);

  const alreadyCompleted = !!progressRow?.completedAt;
  const hasContent = !!row.content && row.content.trim().length > 0;
  const difficultyClass = DIFFICULTY_STYLES[row.difficulty] ?? "bg-muted text-muted-foreground";
  const sections = hasContent ? splitIntoSections(row.content) : [];

  const backHref = origin === "foundation-path" ? "/assessment/foundation-path" : "/roadmap";
  const backLabel = origin === "foundation-path" ? "Back to foundation-path" : "Back to roadmap";

  const quizzes = quizRows as unknown as Quiz[];

  const quizSlot =
    quizzes.length > 0 ? (
      <QuizSection
        lessonId={row.id}
        quizzes={quizzes}
        alreadyCompleted={alreadyCompleted}
        origin={origin}
      />
    ) : undefined;

  return (
    <div className="mx-auto max-w-4xl">
      <ReadingProgressBar />

      <div className="mb-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      </div>

      <h1 className="text-2xl font-bold tracking-tight mb-3">{row.title}</h1>

      <div className="flex flex-wrap items-center gap-2.5 mb-8">
        {row.dimension && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {row.dimension}
          </span>
        )}
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${difficultyClass}`}>
          {row.difficulty}
        </span>
        <span className="text-xs text-muted-foreground">{row.estimatedMinutes} min</span>
      </div>

      {hasContent && sections.length > 0 ? (
        sections.length <= 12 ? (
          <SectionedLesson sections={sections} quizSlot={quizSlot} />
        ) : (
          <div className="space-y-10">
            <LessonMarkdown source={row.content} />
            {quizSlot}
          </div>
        )
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-900">This lesson content is not available.</p>
        </div>
      )}

      {goingDeeper.length > 0 && (
        <p className="mt-12 text-[11px] text-muted-foreground/40">
          Additional resources sourced from{" "}
          <a
            href="https://roadmap.sh"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-colors"
          >
            roadmap.sh
          </a>{" "}
          (CC BY 4.0)
        </p>
      )}
    </div>
  );
}
