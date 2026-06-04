import { redirect } from "next/navigation";
import { eq } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { user as userTable } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default async function AdminDiagnosticsPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string }>;
}) {
  const params = await searchParams;
  const selectedTrack = params.track || "all"; // "all", "curriculum", or "roadmap"

  const user = await requireAuth();

  const userRecord = await db.query.user.findFirst({
    where: eq(userTable.id, user.id),
    columns: { role: true },
  });

  if (!userRecord || !["admin", "superadmin"].includes(userRecord.role)) {
    redirect("/dashboard");
  }

  const lessons: Awaited<ReturnType<typeof db.query.lesson.findMany>> = [];
  const quizzes: Awaited<ReturnType<typeof db.query.quiz.findMany>> = [];
  let roadmaps: Awaited<ReturnType<typeof db.query.roadmapCatalog.findMany>> = [];
  let nodes: Awaited<ReturnType<typeof db.query.roadmapCatalogNode.findMany>> = [];
  let queryTimeMs = 0;

  // Track counts
  const lessonsByTrack = {
    "ai-engineer": 0,
    "english-proficiency": 0,
    "soft-skills": 0,
  };

  try {
    const queryStart = performance.now();
    const BATCH_SIZE = 500; // Cursor-based pagination: fetch in batches to avoid memory spikes

    // Fetch lessons in batches
    let offset = 0;
    let lessonBatch: Awaited<ReturnType<typeof db.query.lesson.findMany>>;
    do {
      lessonBatch = await db.query.lesson.findMany({
        limit: BATCH_SIZE,
        offset,
      });
      lessons.push(...lessonBatch);
      offset += BATCH_SIZE;
    } while (lessonBatch.length === BATCH_SIZE);

    // Fetch quizzes in batches
    offset = 0;
    let quizBatch: Awaited<ReturnType<typeof db.query.quiz.findMany>>;
    do {
      quizBatch = await db.query.quiz.findMany({
        limit: BATCH_SIZE,
        offset,
      });
      quizzes.push(...quizBatch);
      offset += BATCH_SIZE;
    } while (quizBatch.length === BATCH_SIZE);

    // Fetch roadmaps and nodes (usually smaller datasets)
    [roadmaps, nodes] = await Promise.all([
      db.query.roadmapCatalog.findMany({ limit: 200 }),
      db.query.roadmapCatalogNode.findMany({ limit: 5000 }),
    ]);

    queryTimeMs = Math.round(performance.now() - queryStart);
  } catch (e) {
    console.error("[diagnostics] Database query failed:", e);
    return (
      <div className="mx-auto max-w-6xl space-y-8 p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <p className="font-semibold text-red-900 dark:text-red-100">Database Error</p>
              <p className="text-sm text-red-800 dark:text-red-200">Could not load diagnostics data. Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Count lessons by track
  for (const l of lessons) {
    const track = (l.track as string) || "ai-engineer";
    if (track === "ai-engineer") lessonsByTrack["ai-engineer"]++;
    else if (track === "english-proficiency") lessonsByTrack["english-proficiency"]++;
    else if (track === "soft-skills") lessonsByTrack["soft-skills"]++;
  }

  // Lessons by track
  const lessonsWithSkill = lessons.filter((l) => l.skillId);
  const lessonsWithoutSkill = lessons.filter((l) => !l.skillId);

  // Apply track filter to displayed lessons
  let displayedLessons = lessons;
  if (selectedTrack === "ai-engineer") {
    displayedLessons = lessons.filter((l) => (l.track as string) === "ai-engineer" || !l.track);
  } else if (selectedTrack === "english-proficiency") {
    displayedLessons = lessons.filter((l) => (l.track as string) === "english-proficiency");
  } else if (selectedTrack === "soft-skills") {
    displayedLessons = lessons.filter((l) => (l.track as string) === "soft-skills");
  }
  // if selectedTrack === "all", use all lessons

  // Foundation lessons check
  const foundationSlugs = [
    "python-patterns-every-ai-engineer-needs",
    "how-language-models-work",
    "vector-databases-when-why-and-how",
  ];
  const foundationLessons = lessons.filter((l) => foundationSlugs.includes(l.slug));
  const missingFoundation = foundationSlugs.filter(
    (slug) => !foundationLessons.some((l) => l.slug === slug)
  );
  const foundationWithContent = foundationLessons.filter((l) => l.content && l.content.trim().length > 0);

  // AI Engineer curriculum dimensions (core 9)
  const curriculumDimensions = new Set([
    "python",
    "llm_fundamentals_evals",
    "context_engineering",
    "rag_retrieval",
    "agentic_systems",
    "voice_multimodal",
    "system_design",
    "tooling_observability",
    "soft_skills",
  ]);

  const dimensionLabels: Record<string, string> = {
    "python": "Python",
    "llm_fundamentals_evals": "LLM Fundamentals & Evals",
    "context_engineering": "Context Engineering",
    "rag_retrieval": "RAG & Retrieval",
    "agentic_systems": "Agentic Systems",
    "voice_multimodal": "Voice & Multimodal",
    "system_design": "System Design",
    "tooling_observability": "Tooling & Observability",
    "soft_skills": "Soft Skills",
  };

  // Get all actual dimensions from displayed lessons
  const allDimensions = new Set<string>();
  for (const l of displayedLessons) {
    if (l.dimension) allDimensions.add(l.dimension);
  }

  // Separate curriculum and extra dimensions
  const curriculumDims = Array.from(allDimensions).filter((d) => curriculumDimensions.has(d)).sort();
  const extraDims = Array.from(allDimensions).filter((d) => !curriculumDimensions.has(d)).sort();

  const lessonsByDim = new Map<string, typeof displayedLessons>();
  for (const dim of Array.from(allDimensions)) {
    const dimLessons = displayedLessons.filter((l) => l.dimension === dim);
    lessonsByDim.set(dim, dimLessons);
  }

  // Curriculum completeness check
  const curriculumComplete = curriculumDims.length === 9 &&
    curriculumDims.every((dim) => {
      const dimLessons = lessonsByDim.get(dim) ?? [];
      return dimLessons.length >= 3;
    });

  // Missing content warnings
  const lessonsWithoutContent = lessons.filter(
    (l) => !l.content || l.content.trim().length === 0
  );

  // Orphaned quizzes
  const lessonIds = new Set(lessons.map((l) => l.id));
  const orphanedQuizzes = quizzes.filter((q) => !lessonIds.has(q.lessonId));

  // Quizzes per lesson
  const quizzesPerLesson = new Map<string, number>();
  for (const q of quizzes) {
    quizzesPerLesson.set(q.lessonId, (quizzesPerLesson.get(q.lessonId) ?? 0) + 1);
  }
  const lessonsWithoutQuizzes = lessons.filter((l) => !quizzesPerLesson.has(l.id));

  const totalQuizzes = quizzes.length;
  const expectedQuizzesPerLesson = 3;
  const expectedQuizzes = lessons.length * expectedQuizzesPerLesson;

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Data Diagnostics</h1>
          <p className="text-muted-foreground mt-1">System health check for lessons, courses, and catalog data</p>
          <p className="text-xs text-muted-foreground mt-2">
            Loaded in {queryTimeMs}ms · {lessons.length} total lessons · {quizzes.length} quizzes
          </p>
        </div>

        {/* Track Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          <a
            href="/admin/diagnostics"
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              selectedTrack === "all"
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background hover:bg-muted"
            }`}
          >
            All ({lessons.length})
          </a>
          <a
            href="/admin/diagnostics?track=ai-engineer"
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              selectedTrack === "ai-engineer"
                ? "bg-blue-600 text-white"
                : "border border-border bg-background hover:bg-muted"
            }`}
          >
            AI Engineer ({lessonsByTrack["ai-engineer"]})
          </a>
          <a
            href="/admin/diagnostics?track=english-proficiency"
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              selectedTrack === "english-proficiency"
                ? "bg-sky-600 text-white"
                : "border border-border bg-background hover:bg-muted"
            }`}
          >
            English Proficiency ({lessonsByTrack["english-proficiency"]})
          </a>
          <a
            href="/admin/diagnostics?track=soft-skills"
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              selectedTrack === "soft-skills"
                ? "bg-purple-600 text-white"
                : "border border-border bg-background hover:bg-muted"
            }`}
          >
            Soft Skills ({lessonsByTrack["soft-skills"]})
          </a>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span className="text-sm font-semibold">
              {selectedTrack === "all" ? "Total" : "Filtered"} Lessons
            </span>
          </div>
          <p className="text-2xl font-bold">{displayedLessons.length}</p>
          {selectedTrack !== "all" && (
            <p className="text-xs text-muted-foreground">of {lessons.length} total</p>
          )}
        </div>

        <div
          className={`rounded-lg border p-4 space-y-2 ${
            displayedLessons.filter((l) => !l.content || l.content.trim().length === 0).length > 0
              ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
              : ""
          }`}
        >
          <div className="flex items-center gap-2">
            {displayedLessons.filter((l) => !l.content || l.content.trim().length === 0).length === 0 ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
            <span className="text-sm font-semibold">Lessons with Content</span>
          </div>
          <p className="text-2xl font-bold">
            {displayedLessons.filter((l) => l.content && l.content.trim().length > 0).length}/{displayedLessons.length}
          </p>
          {displayedLessons.filter((l) => !l.content || l.content.trim().length === 0).length > 0 && (
            <p className="text-xs text-amber-700 dark:text-amber-200">
              {displayedLessons.filter((l) => !l.content || l.content.trim().length === 0).length} missing
            </p>
          )}
        </div>

        <div className={`rounded-lg border p-4 space-y-2 ${foundationWithContent.length !== foundationLessons.length ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30" : ""}`}>
          <div className="flex items-center gap-2">
            {missingFoundation.length === 0 && foundationWithContent.length === 3 ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm font-semibold">Foundation Lessons</span>
          </div>
          <p className="text-2xl font-bold">{foundationWithContent.length}/3</p>
          {foundationLessons.length > 0 && (
            <div className="text-xs space-y-1 mt-2">
              {foundationLessons.map((l) => (
                <div key={l.id} className={`${l.content && l.content.trim().length > 0 ? "text-muted-foreground" : "text-red-700 dark:text-red-200"}`}>
                  {l.content && l.content.trim().length > 0 ? "✓" : "✗"} {l.title}
                </div>
              ))}
            </div>
          )}
          {missingFoundation.length > 0 && (
            <p className="text-xs text-red-700 dark:text-red-200 mt-2">Missing: {missingFoundation.join(", ")}</p>
          )}
        </div>

        <div className={`rounded-lg border p-4 space-y-2 ${totalQuizzes < expectedQuizzes ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30" : ""}`}>
          <div className="flex items-center gap-2">
            {totalQuizzes >= expectedQuizzes ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
            <span className="text-sm font-semibold">Total Quizzes</span>
          </div>
          <p className="text-2xl font-bold">{totalQuizzes}</p>
          <p className="text-xs text-muted-foreground">Expected: {expectedQuizzes} (3 per lesson)</p>
        </div>
      </div>

      {/* Lessons by Track */}
      <div className="rounded-lg border p-6 space-y-6">
        <h2 className="text-lg font-bold">Lessons by Track</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className={`space-y-2 p-4 rounded-lg border ${lessonsWithSkill.length > 0 ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30" : "border-border bg-muted/20"}`}>
            <p className="text-sm font-medium">Roadmap Track</p>
            <p className="text-2xl font-bold">{lessonsWithSkill.length}</p>
            <p className="text-xs text-muted-foreground">Linked to skill nodes</p>
          </div>
          <div className={`space-y-2 p-4 rounded-lg border ${lessonsWithoutSkill.length > 0 ? "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30" : "border-border bg-muted/20"}`}>
            <p className="text-sm font-medium">AI Engineer Curriculum</p>
            <p className="text-2xl font-bold">{lessonsWithoutSkill.length}</p>
            <p className="text-xs text-muted-foreground">No skill association (core curriculum)</p>
          </div>
        </div>

        {lessonsWithoutSkill.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">Curriculum Lessons ({lessonsWithoutSkill.length})</p>
            <div className="max-h-40 overflow-y-auto space-y-1 text-xs border rounded p-3 bg-muted/30">
              {lessonsWithoutSkill.slice(0, 15).map((l) => (
                <div key={l.id} className="truncate">• {l.title}</div>
              ))}
              {lessonsWithoutSkill.length > 15 && (
                <div className="text-muted-foreground italic">... and {lessonsWithoutSkill.length - 15} more</div>
              )}
            </div>
          </div>
        )}

        {lessonsWithSkill.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">Roadmap Track Lessons ({lessonsWithSkill.length})</p>
            <div className="max-h-40 overflow-y-auto space-y-1 text-xs border rounded p-3 bg-muted/30">
              {lessonsWithSkill.slice(0, 15).map((l) => (
                <div key={l.id} className="truncate">• {l.title}</div>
              ))}
              {lessonsWithSkill.length > 15 && (
                <div className="text-muted-foreground italic">... and {lessonsWithSkill.length - 15} more</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Catalog Status */}
      <div className="rounded-lg border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <h2 className="text-lg font-bold">Roadmap Catalog</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Roadmaps Imported</p>
            <p className="text-2xl font-bold">{roadmaps.length}</p>
            <p className="text-xs text-muted-foreground">Expected: 84</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Catalog Nodes</p>
            <p className="text-2xl font-bold">{nodes.length}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="text-sm font-semibold text-green-600">
              {roadmaps.length === 84 ? "✅ Complete" : "⚠️ Incomplete"}
            </p>
          </div>
        </div>
      </div>

      {/* Lessons by Dimension */}
      <div className="rounded-lg border p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold mb-4">Lessons per Dimension</h2>
          <p className="text-xs text-muted-foreground mb-4">Core AI Engineer Curriculum (9 dimensions)</p>
        </div>

        <div className="space-y-3">
          {curriculumDims.map((dim) => {
            const dimLessons = lessonsByDim.get(dim) ?? [];
            const isOk = dimLessons.length >= 3;
            return (
              <div key={dim} className={`p-3 rounded-lg border space-y-2 ${!isOk ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isOk ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                    <span className="font-medium">{dimensionLabels[dim] || dim}</span>
                  </div>
                  <span className={`text-sm font-semibold ${isOk ? "text-green-600" : "text-amber-600"}`}>
                    {dimLessons.length} {isOk ? "✅" : "⚠️"}
                  </span>
                </div>
                {dimLessons.length > 0 && (
                  <div className="text-xs text-muted-foreground ml-7 space-y-1 max-h-32 overflow-y-auto">
                    {dimLessons.map((l) => (
                      <div key={l.id} className="truncate">• {l.title}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {extraDims.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-semibold mb-4">Additional Lessons ({extraDims.length} dimensions, {extraDims.reduce((sum, d) => sum + (lessonsByDim.get(d)?.length ?? 0), 0)} lessons)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {extraDims.map((dim) => {
                const dimLessons = lessonsByDim.get(dim) ?? [];
                return (
                  <div key={dim} className="p-3 rounded border border-border/50 bg-muted/30 space-y-2">
                    <div className="font-medium text-sm capitalize">{dim.replace(/_/g, " ")}</div>
                    <div className="text-xs space-y-1 max-h-24 overflow-y-auto">
                      {dimLessons.map((l) => (
                        <div key={l.id} className="truncate text-muted-foreground">• {l.title}</div>
                      ))}
                    </div>
                    <div className="text-xs font-medium text-muted-foreground pt-1 border-t border-border/30">
                      {dimLessons.length} lesson{dimLessons.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Warnings */}
      {(lessonsWithoutContent.length > 0 || orphanedQuizzes.length > 0 || lessonsWithoutQuizzes.length > 0) && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/30 space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100">Data Quality Issues</h2>
          </div>

          {lessonsWithoutContent.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                {lessonsWithoutContent.length} lesson(s) missing content
              </p>
              <div className="space-y-1">
                {lessonsWithoutContent.map((l) => (
                  <p key={l.id} className="text-xs text-amber-800 dark:text-amber-200">
                    • {l.slug} ({l.title})
                  </p>
                ))}
              </div>
            </div>
          )}

          {lessonsWithoutQuizzes.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                {lessonsWithoutQuizzes.length} lesson(s) missing quizzes
              </p>
              <div className="space-y-1">
                {lessonsWithoutQuizzes.map((l) => (
                  <p key={l.id} className="text-xs text-amber-800 dark:text-amber-200">
                    • {l.slug} ({l.title})
                  </p>
                ))}
              </div>
            </div>
          )}

          {orphanedQuizzes.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                {orphanedQuizzes.length} orphaned quiz(zes) (lesson deleted?)
              </p>
              <div className="space-y-1">
                {orphanedQuizzes.slice(0, 5).map((q) => (
                  <p key={q.id} className="text-xs text-amber-800 dark:text-amber-200">
                    • Quiz &quot;{q.question.slice(0, 50)}&quot;... (lessonId: {q.lessonId})
                  </p>
                ))}
                {orphanedQuizzes.length > 5 && (
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    • ... and {orphanedQuizzes.length - 5} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* All Good */}
      {lessonsWithoutContent.length === 0 &&
        orphanedQuizzes.length === 0 &&
        lessonsWithoutQuizzes.length === 0 &&
        missingFoundation.length === 0 &&
        curriculumComplete && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950/30">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">All systems healthy ✅</p>
                <p className="text-sm text-green-800 dark:text-green-200">Curriculum complete (9/9 dimensions, 3+ lessons each), all content present, quizzes complete</p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
