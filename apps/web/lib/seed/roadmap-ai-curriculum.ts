import { eq, and } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { roadmapCatalog, roadmapCatalogNode, lesson } from "@repo/db/schema";

const AI_CURRICULUM_ROADMAP = {
  slug: "ai-engineer-curriculum",
  title: "AI Engineer Curriculum",
  description: "The 9 core dimensions of AI engineering: from Python fundamentals to shipping production systems.",
  nodeCount: 34,
};

// Dimensions that have an L4 lesson (D2–D8; D1 Python and D9 Soft Skills do not).
const L4_DIMENSIONS = new Set([
  "llm_fundamentals_evals",
  "context_engineering",
  "rag_retrieval",
  "agentic_systems",
  "voice_multimodal",
  "system_design",
  "tooling_observability",
]);

const DIMENSIONS = [
  { key: "python", label: "Python", description: "Programming fundamentals for AI engineers" },
  { key: "llm_fundamentals_evals", label: "LLM Fundamentals & Evals", description: "Understanding language models and how to evaluate them" },
  { key: "context_engineering", label: "Context Engineering", description: "Mastering prompt engineering and structured outputs" },
  { key: "rag_retrieval", label: "RAG & Retrieval", description: "Building retrieval-augmented generation systems" },
  { key: "agentic_systems", label: "Agentic Systems", description: "Multi-agent orchestration and tool use" },
  { key: "voice_multimodal", label: "Voice & Multimodal", description: "Building with audio, vision, and real-time systems" },
  { key: "system_design", label: "System Design", description: "Architecting production AI services" },
  { key: "tooling_observability", label: "Tooling & Observability", description: "MLOps and debugging AI systems" },
  { key: "soft_skills", label: "Soft Skills", description: "Product thinking and delivering AI projects" },
];

export async function seedRoadmapAiCurriculum() {
  try {
    // Check if roadmap already exists
    const existing = await db.query.roadmapCatalog.findFirst({
      where: eq(roadmapCatalog.slug, AI_CURRICULUM_ROADMAP.slug),
      columns: { id: true, nodeCount: true },
    });

    if (existing) {
      // Bump nodeCount if it was seeded before L4 lessons existed.
      if (existing.nodeCount !== AI_CURRICULUM_ROADMAP.nodeCount) {
        await db
          .update(roadmapCatalog)
          .set({ nodeCount: AI_CURRICULUM_ROADMAP.nodeCount })
          .where(eq(roadmapCatalog.slug, AI_CURRICULUM_ROADMAP.slug));
      }
      // Seed any missing L4 nodes without recreating the whole roadmap.
      await seedMissingL4Nodes(existing.id);
      return;
    }

    // Create the roadmap
    const roadmapId = crypto.randomUUID();
    await db.insert(roadmapCatalog).values({
      id: roadmapId,
      slug: AI_CURRICULUM_ROADMAP.slug,
      title: AI_CURRICULUM_ROADMAP.title,
      description: AI_CURRICULUM_ROADMAP.description,
      nodeCount: AI_CURRICULUM_ROADMAP.nodeCount,
      rawData: {},
    });

    // For each dimension, create a parent node and 3 child nodes (L1, L2, L3)
    for (const dim of DIMENSIONS) {
      // Create parent node for dimension
      const parentNodeId = crypto.randomUUID();
      const parentDbId = crypto.randomUUID();

      await db.insert(roadmapCatalogNode).values({
        id: parentDbId,
        roadmapId,
        nodeId: parentNodeId,
        type: "topic",
        label: dim.label,
        description: dim.description,
        parentNodeId: null,
        order: DIMENSIONS.indexOf(dim),
      });

    // Create 3 child nodes (L1, L2, L3)
    const difficulties: Array<"beginner" | "intermediate" | "advanced"> = ["beginner", "intermediate", "advanced"];
    const levelLabels = ["L1", "L2", "L3"] as const;

    for (let i = 0; i < 3; i++) {
      const difficulty = difficulties[i]!;
      const levelLabel = levelLabels[i]!;

      // For soft_skills (D9) nodes, re-point to the richer SS-D2 discovery/scoping lessons
      // instead of the deprecated AI D9 duplicates.
      const SS_D2_SLUGS: Record<"beginner" | "intermediate" | "advanced", string> = {
        beginner: "ss-discovery-call-without-losing-them",
        intermediate: "ss-project-brief-prevents-scope-creep",
        advanced: "ss-cutting-scope-without-burning-relationship",
      };

      // Find the lesson matching this dimension and difficulty (order 1/2/3 to skip L4 "advanced")
      let matchingLesson;
      if (dim.key === "soft_skills") {
        const slug = SS_D2_SLUGS[difficulty];
        if (!slug) throw new Error(`[seed] No SS-D2 slug mapped for difficulty="${difficulty}"`);
        matchingLesson = await db.query.lesson.findFirst({
          where: eq(lesson.slug, slug),
          columns: { id: true, title: true },
        });
      } else {
        matchingLesson = await db.query.lesson.findFirst({
          where: and(eq(lesson.dimension, dim.key), eq(lesson.difficulty, difficulty), eq(lesson.order, i + 1)),
          columns: { id: true, title: true },
        });
      }

      const nodeId = crypto.randomUUID();
      const dbId = crypto.randomUUID();

      if (!matchingLesson) {
        console.warn(
          `[seed] No lesson found for dimension="${dim.key}" difficulty="${difficulty}" - node will have no linked lesson`
        );
      }

      await db.insert(roadmapCatalogNode).values({
        id: dbId,
        roadmapId,
        nodeId,
        type: "subtopic",
        label: `${dim.label} - ${levelLabel}`,
        description: matchingLesson?.title || null,
        parentNodeId: parentDbId,
        order: i,
        lessonId: matchingLesson?.id || null,
        dimension: dim.key,
        difficulty,
      });
    }

    // Create L4 node for dimensions that have a Level 4 lesson (D2–D8).
    if (L4_DIMENSIONS.has(dim.key)) {
      const l4Lesson = await db.query.lesson.findFirst({
        where: and(eq(lesson.dimension, dim.key), eq(lesson.order, 4)),
        columns: { id: true, title: true },
      });

      if (!l4Lesson) {
        console.warn(`[seed] No L4 lesson found for dimension="${dim.key}"`);
      }

      await db.insert(roadmapCatalogNode).values({
        id: crypto.randomUUID(),
        roadmapId,
        nodeId: crypto.randomUUID(),
        type: "subtopic",
        label: `${dim.label} - L4`,
        description: l4Lesson?.title || null,
        parentNodeId: parentDbId,
        order: 3,
        lessonId: l4Lesson?.id || null,
        dimension: dim.key,
        difficulty: "advanced",
      });
    }
  }
  } catch (error) {
    console.error("[seed] Failed to seed AI curriculum roadmap:", error);
    throw error;
  }
}

/**
 * Called when the roadmap catalog row already exists.
 * Finds parent nodes for L4-eligible dimensions and inserts any missing L4 child nodes.
 */
async function seedMissingL4Nodes(roadmapId: string) {
  for (const dimKey of L4_DIMENSIONS) {
    // Check if L4 node already exists
    const existingL4 = await db.query.roadmapCatalogNode.findFirst({
      where: and(
        eq(roadmapCatalogNode.roadmapId, roadmapId),
        eq(roadmapCatalogNode.dimension, dimKey),
        eq(roadmapCatalogNode.order, 3),
      ),
      columns: { id: true },
    });

    if (existingL4) continue;

    // Find the L4 lesson
    const l4Lesson = await db.query.lesson.findFirst({
      where: and(eq(lesson.dimension, dimKey), eq(lesson.order, 4)),
      columns: { id: true, title: true },
    });

    if (!l4Lesson) {
      console.warn(`[seed] seedMissingL4Nodes: no L4 lesson for dimension="${dimKey}"`);
      continue;
    }

    // Find parent via a subtopic sibling (L1/L2/L3 share the same parentNodeId)
    const sibling = await db.query.roadmapCatalogNode.findFirst({
      where: and(
        eq(roadmapCatalogNode.roadmapId, roadmapId),
        eq(roadmapCatalogNode.dimension, dimKey),
        eq(roadmapCatalogNode.type, "subtopic"),
      ),
      columns: { parentNodeId: true, label: true },
    });

    if (!sibling?.parentNodeId) {
      console.warn(`[seed] seedMissingL4Nodes: no sibling subtopic for dimension="${dimKey}" — cannot determine parentNodeId`);
      continue;
    }

    const dimLabel = sibling.label.replace(/ - L[123]$/, "");

    await db.insert(roadmapCatalogNode).values({
      id: crypto.randomUUID(),
      roadmapId,
      nodeId: crypto.randomUUID(),
      type: "subtopic",
      label: `${dimLabel} - L4`,
      description: l4Lesson.title,
      parentNodeId: sibling.parentNodeId,
      order: 3,
      lessonId: l4Lesson.id,
      dimension: dimKey,
      difficulty: "advanced",
    });
  }
}
