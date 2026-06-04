import { eq, and, isNull } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { roadmapCatalog, roadmapCatalogNode, lesson } from "@repo/db/schema";

const SOFT_SKILLS_ROADMAP = {
  slug: "soft-skills-curriculum",
  title: "Soft Skills Curriculum",
  description: "6 dimensions of professional effectiveness for engineers: from written communication to career navigation.",
  nodeCount: 18,
};

const DIMENSIONS = [
  { key: "ss-written-comms",      label: "Written Communication",   description: "PRs, RFCs, and technical writing that lands" },
  { key: "ss-discovery-scoping",  label: "Discovery & Scoping",     description: "Discovery calls, project briefs, and fighting scope creep" },
  { key: "ss-async-collab",       label: "Async Collaboration",     description: "Standups, Slack etiquette, and shipping without meetings" },
  { key: "ss-code-review",        label: "Code Review",             description: "Giving and receiving feedback that improves the codebase" },
  { key: "ss-conflict-escalation",label: "Conflict & Escalation",   description: "Pushing back with evidence, knowing when to escalate" },
  { key: "ss-career-navigation",  label: "Career Navigation",       description: "Mentorship, levelling up, and engineering org dynamics" },
];

export async function seedRoadmapSoftSkills() {
  try {
    const existing = await db.query.roadmapCatalog.findFirst({
      where: eq(roadmapCatalog.slug, SOFT_SKILLS_ROADMAP.slug),
      columns: { id: true },
    });

    if (existing) return;

    const roadmapId = crypto.randomUUID();
    await db.insert(roadmapCatalog).values({
      id: roadmapId,
      slug: SOFT_SKILLS_ROADMAP.slug,
      title: SOFT_SKILLS_ROADMAP.title,
      description: SOFT_SKILLS_ROADMAP.description,
      nodeCount: SOFT_SKILLS_ROADMAP.nodeCount,
      rawData: {},
    });

    const difficulties: Array<"beginner" | "intermediate" | "advanced"> = ["beginner", "intermediate", "advanced"];
    const levelLabels = ["L1", "L2", "L3"] as const;

    for (const dim of DIMENSIONS) {
      const parentDbId = crypto.randomUUID();

      await db.insert(roadmapCatalogNode).values({
        id: parentDbId,
        roadmapId,
        nodeId: crypto.randomUUID(),
        type: "topic",
        label: dim.label,
        description: dim.description,
        parentNodeId: null,
        order: DIMENSIONS.indexOf(dim),
      });

      for (let i = 0; i < 3; i++) {
        const difficulty = difficulties[i]!;
        const levelLabel = levelLabels[i]!;

        const matchingLesson = await db.query.lesson.findFirst({
          where: and(
            eq(lesson.dimension, dim.key),
            eq(lesson.difficulty, difficulty),
          ),
          columns: { id: true, title: true },
        });

        if (!matchingLesson) {
          console.warn(
            `[seed] No soft-skills lesson for dimension="${dim.key}" difficulty="${difficulty}"`
          );
        }

        await db.insert(roadmapCatalogNode).values({
          id: crypto.randomUUID(),
          roadmapId,
          nodeId: crypto.randomUUID(),
          type: "subtopic",
          label: `${dim.label} - ${levelLabel}`,
          description: matchingLesson?.title ?? null,
          parentNodeId: parentDbId,
          order: i,
          lessonId: matchingLesson?.id ?? null,
          dimension: dim.key,
          difficulty,
        });
      }
    }
  } catch (error) {
    console.error("[seed] Failed to seed soft-skills roadmap:", error);
    throw error;
  }
}

/**
 * Patches existing SS roadmap nodes that have lessonId=null.
 * Runs every seed so nodes seeded before lessons existed get backfilled.
 */
export async function patchSoftSkillsMissingLessonIds() {
  const roadmap = await db.query.roadmapCatalog.findFirst({
    where: eq(roadmapCatalog.slug, SOFT_SKILLS_ROADMAP.slug),
    columns: { id: true },
  });
  if (!roadmap) return;

  const emptyNodes = await db
    .select({
      id: roadmapCatalogNode.id,
      dimension: roadmapCatalogNode.dimension,
      difficulty: roadmapCatalogNode.difficulty,
    })
    .from(roadmapCatalogNode)
    .where(
      and(
        eq(roadmapCatalogNode.roadmapId, roadmap.id),
        eq(roadmapCatalogNode.type, "subtopic"),
        isNull(roadmapCatalogNode.lessonId),
      ),
    );

  let patched = 0;
  for (const node of emptyNodes) {
    if (!node.dimension || !node.difficulty) continue;
    const match = await db.query.lesson.findFirst({
      where: and(
        eq(lesson.dimension, node.dimension),
        eq(lesson.difficulty, node.difficulty),
        eq(lesson.track, "soft-skills"),
      ),
      columns: { id: true, title: true },
    });
    if (!match) continue;
    await db
      .update(roadmapCatalogNode)
      .set({ lessonId: match.id, description: match.title })
      .where(eq(roadmapCatalogNode.id, node.id));
    patched++;
  }
  if (patched > 0) console.log(`[seed] Patched ${patched} soft-skills nodes with lessonId.`);
}
