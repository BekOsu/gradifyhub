import { eq, and, isNull } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { roadmapCatalog, roadmapCatalogNode, lesson } from "@repo/db/schema";

const ENGLISH_ROADMAP = {
  slug: "english-proficiency-curriculum",
  title: "English Proficiency Curriculum",
  description: "5 dimensions of professional English for B2+ engineers: reading, listening, speaking, writing, and cross-cultural communication.",
  nodeCount: 15,
};

const DIMENSIONS = [
  { key: "eng-reading",       label: "Technical Reading",         description: "API docs, papers, and reference material — fast" },
  { key: "eng-listening",     label: "Listening Comprehension",   description: "Podcasts, talks, and meetings at native speed" },
  { key: "eng-speaking",      label: "Speaking & Presenting",     description: "Standups, interviews, and thinking aloud in English" },
  { key: "eng-writing",       label: "Professional Writing",      description: "PRs, Slack, email — tone and clarity in English" },
  { key: "eng-cross-cultural",label: "Cross-Cultural Comms",      description: "Tone calibration, timezone async, and global teams" },
];

export async function seedRoadmapEnglishProficiency() {
  try {
    const existing = await db.query.roadmapCatalog.findFirst({
      where: eq(roadmapCatalog.slug, ENGLISH_ROADMAP.slug),
      columns: { id: true },
    });

    if (existing) return;

    const roadmapId = crypto.randomUUID();
    await db.insert(roadmapCatalog).values({
      id: roadmapId,
      slug: ENGLISH_ROADMAP.slug,
      title: ENGLISH_ROADMAP.title,
      description: ENGLISH_ROADMAP.description,
      nodeCount: ENGLISH_ROADMAP.nodeCount,
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
            `[seed] No english-proficiency lesson for dimension="${dim.key}" difficulty="${difficulty}"`
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
    console.error("[seed] Failed to seed english-proficiency roadmap:", error);
    throw error;
  }
}

/**
 * Patches existing English roadmap nodes that have lessonId=null.
 * Runs every seed so nodes seeded before lessons existed get backfilled.
 */
export async function patchEnglishMissingLessonIds() {
  const roadmap = await db.query.roadmapCatalog.findFirst({
    where: eq(roadmapCatalog.slug, ENGLISH_ROADMAP.slug),
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
        eq(lesson.track, "english-proficiency"),
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
  if (patched > 0) console.log(`[seed] Patched ${patched} english-proficiency nodes with lessonId.`);
}
