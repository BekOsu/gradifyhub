import { redirect } from "next/navigation";
import Link from "next/link";
import { eq, and, isNotNull, inArray } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { attempt, profile, lesson, lessonProgress } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { getRoadmapCatalogBySlug, getUserNodeProgress } from "@repo/db/queries/roadmap-catalog";
import { getTrackKnowledge } from "~/lib/journey/engineering-knowledge";
import { RoadmapDiagram } from "~/components/roadmap/roadmap-diagram";
import { CurriculumRoadmapView } from "~/components/roadmap/curriculum-roadmap-view";
import { AssessmentInsights } from "~/components/roadmap/assessment-insights";
import { seedRoadmapAiCurriculum } from "~/lib/seed/roadmap-ai-curriculum";
import { seedRoadmapSoftSkills } from "~/lib/seed/roadmap-soft-skills";
import { seedRoadmapEnglishProficiency } from "~/lib/seed/roadmap-english-proficiency";
import { seedLessons } from "~/lib/seed/lessons";
import { seedCurriculumLessons } from "~/lib/seed/lessons-curriculum";
import { seedAiCurriculumL4Lessons } from "~/lib/seed/ai-curriculum-l4-lessons";
import { seedSoftSkillsLessons } from "~/lib/seed/soft-skills-lessons";
import { seedEnglishProficiencyLessons } from "~/lib/seed/english-proficiency-lessons";
import { Brain, BookOpen, MessageSquare } from "lucide-react";
import { cn } from "~/lib/utils";
import { getGoalLabel } from "~/lib/journey/goals";

const GOAL_TO_SLUG: Record<string, string> = {
  backend_engineer:          "backend",
  frontend_engineer:         "frontend",
  full_stack_engineer:       "full-stack",
  mobile_engineer:           "react-native",
  devops_engineer:           "devops",
  data_analyst:              "data-analyst",
  qa_engineer:               "qa",
  ai_ml_engineer:            "ai-engineer",
  land_first_ai_role:        "ai-engineer",
  ml_research_to_production: "ai-engineer",
  software_to_ai:            "ai-engineer",
  freelance_ai_engineer:     "ai-engineer",
};

const AI_TRACK_GOALS = [
  "ai_ml_engineer",
  "land_first_ai_role",
  "ml_research_to_production",
  "software_to_ai",
  "freelance_ai_engineer",
];

// Maps the `?track=` query param value → roadmap catalog slug.
const TRACK_PARAM_TO_SLUG: Record<string, string> = {
  "ai-engineer":        "ai-engineer-curriculum",
  "soft-skills":        "soft-skills-curriculum",
  "english-proficiency":"english-proficiency-curriculum",
};

const TRACK_TABS = [
  { param: "ai-engineer",         label: "AI Engineer",        icon: Brain },
  { param: "soft-skills",         label: "Soft Skills",        icon: BookOpen },
  { param: "english-proficiency", label: "English Proficiency",icon: MessageSquare },
] as const;

export default async function RoadmapPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string }>;
}) {
  const user = await requireAuth();
  const { track: trackParam } = await searchParams;

  // Ensure all lessons and roadmaps are seeded
  await Promise.all([
    seedLessons(),
    seedCurriculumLessons(),
    seedAiCurriculumL4Lessons(),
    seedSoftSkillsLessons(),
    seedEnglishProficiencyLessons(),
    seedRoadmapAiCurriculum(),
    seedRoadmapSoftSkills(),
    seedRoadmapEnglishProficiency(),
  ]);

  const [userProfile, completedAttempt, allLessons] = await Promise.all([
    db.query.profile.findFirst({ where: eq(profile.userId, user.id) }),
    db.query.attempt.findFirst({
      where: and(eq(attempt.userId, user.id), isNotNull(attempt.completedAt)),
      orderBy: (a, { desc }) => [desc(a.completedAt)],
      columns: { knowledgeScores: true },
    }),
    db.query.lesson.findMany({ columns: { dimension: true } }),
  ]);

  // Resolve active track: explicit `?track=` param takes priority; default to AI for AI-goal users.
  const activeTrack: string = (() => {
    if (trackParam && TRACK_PARAM_TO_SLUG[trackParam]) return trackParam;
    if (userProfile?.goal && AI_TRACK_GOALS.includes(userProfile.goal)) return "ai-engineer";
    return "ai-engineer"; // default
  })();

  const slug = TRACK_PARAM_TO_SLUG[activeTrack]
    ?? (userProfile?.goal && GOAL_TO_SLUG[userProfile.goal])
    ?? "backend";

  const roadmap = await getRoadmapCatalogBySlug(slug);
  if (!roadmap) redirect("/roadmaps");

  const progressMap = await getUserNodeProgress(user.id, roadmap.id);
  const initialProgress = Object.fromEntries(progressMap) as Record<string, "done" | "in-progress" | "skip">;

  // Collect all lessonIds from nodes
  const lessonIds = (roadmap?.nodes ?? [])
    .map((n) => n.lessonId)
    .filter((id): id is string => !!id);

  // Batch fetch lesson rows (slug + sequence) referenced by this roadmap
  const lessonRows = lessonIds.length > 0
    ? await db.query.lesson.findMany({
        where: inArray(lesson.id, lessonIds),
        columns: { id: true, slug: true, title: true, globalSequenceIndex: true },
      })
    : [];

  const lessonsMap: Record<string, string> = Object.fromEntries(
    lessonRows.map((l) => [l.id, l.slug])
  );

  // Sequence + title lookups used by the gating UI
  const lessonSequenceByNodeLessonId: Record<string, number> = Object.fromEntries(
    lessonRows.map((l) => [l.id, l.globalSequenceIndex])
  );
  const titleByGlobalIndex: Record<number, string> = Object.fromEntries(
    lessonRows.map((l) => [l.globalSequenceIndex, l.title])
  );

  // Compute the user's furthest completed sequence index from real lesson_progress
  const completedRows = await db.query.lessonProgress.findMany({
    where: and(eq(lessonProgress.userId, user.id), isNotNull(lessonProgress.completedAt)),
    columns: { lessonId: true },
  });
  let userMaxCompletedSequence = 0;
  if (completedRows.length > 0) {
    const completedLessons = await db.query.lesson.findMany({
      where: inArray(lesson.id, completedRows.map((r) => r.lessonId)),
      columns: { globalSequenceIndex: true },
    });
    userMaxCompletedSequence = completedLessons.reduce(
      (max, l) => (l.globalSequenceIndex > max ? l.globalSequenceIndex : max),
      0,
    );
  }

  // Convert to array for serialization (Sets don't serialize to JSON)
  const availableLessonDimensions = Array.from(
    new Set(allLessons.map((l) => l.dimension).filter((d) => d !== null && d !== undefined))
  );

  const trackKnowledge = getTrackKnowledge(userProfile?.goal);
  const knowledgeScores = completedAttempt?.knowledgeScores as Record<string, number> | null;
  const earnedLevels = userProfile?.earnedLevels as Record<string, number> | null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 pb-10 pt-6 sm:px-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {userProfile?.goal ? `Your ${getGoalLabel(userProfile.goal)} Roadmap` : "Your Roadmap"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {roadmap.nodeCount} topics · mark each one as you go
          </p>
        </div>
        <Link
          href="/onboarding/step-1?edit=1"
          className="shrink-0 rounded-xl border border-border/70 px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
        >
          Change goal
        </Link>
      </div>

      {/* Track tabs */}
      <div className="flex gap-1.5 rounded-xl border bg-muted/40 p-1">
        {TRACK_TABS.map(({ param, label, icon: Icon }) => {
          const isActive = activeTrack === param;
          return (
            <Link
              key={param}
              href={`/roadmap?track=${param}`}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>

      {activeTrack === "ai-engineer" && (
        <AssessmentInsights
          dimensions={trackKnowledge.dimensions}
          knowledgeScores={knowledgeScores}
          earnedLevels={earnedLevels}
        />
      )}

      {slug === "ai-engineer-curriculum" ? (
        <CurriculumRoadmapView
          nodes={roadmap.nodes}
          initialProgress={initialProgress}
          dimensionScores={knowledgeScores ?? undefined}
          lessonsMap={lessonsMap}
          lessonSequenceMap={lessonSequenceByNodeLessonId}
          titleByGlobalIndex={titleByGlobalIndex}
          userMaxCompletedSequence={userMaxCompletedSequence}
        />
      ) : (
        <RoadmapDiagram
          roadmapId={roadmap.id}
          nodes={roadmap.nodes}
          initialProgress={initialProgress}
          dimensionScores={knowledgeScores ?? undefined}
          availableLessonDimensions={availableLessonDimensions}
        />
      )}
    </div>
  );
}
