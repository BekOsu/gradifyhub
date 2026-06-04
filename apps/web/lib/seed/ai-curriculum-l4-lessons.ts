// AI Engineer curriculum — Level 4 lessons (7 advanced lessons).
// Bridges the 27 → 34 lesson gap identified in the curriculum-alignment audit.
// Each lesson is the "L4" tier within its dimension (one per D2..D8).

import { eq } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { lesson, quiz } from "@repo/db/schema";
import { sequenceFor } from "./ai-curriculum-sequence";

// Repair map: old dash-style dimension → correct underscore dimension.
// Needed because early seeds may have written the wrong value to Neon.
const DIMENSION_REPAIR: Record<string, string> = {
  "llm-fundamentals":        "llm_fundamentals_evals",
  "context-engineering":     "context_engineering",
  "rag-retrieval":           "rag_retrieval",
  "agentic-systems":         "agentic_systems",
  "voice-multimodal":        "voice_multimodal",
  "production-system-design":"system_design",
  "tooling-observability":   "tooling_observability",
};

import { D2_L4_LESSON } from "./ai-curriculum-l4/d2-l4";
import { D3_L4_LESSON } from "./ai-curriculum-l4/d3-l4";
import { D4_L4_LESSON } from "./ai-curriculum-l4/d4-l4";
import { D5_L4_LESSON } from "./ai-curriculum-l4/d5-l4";
import { D6_L4_LESSON } from "./ai-curriculum-l4/d6-l4";
import { D7_L4_LESSON } from "./ai-curriculum-l4/d7-l4";
import { D8_L4_LESSON } from "./ai-curriculum-l4/d8-l4";

const L4_LESSONS = [
  D2_L4_LESSON,
  D3_L4_LESSON,
  D4_L4_LESSON,
  D5_L4_LESSON,
  D6_L4_LESSON,
  D7_L4_LESSON,
  D8_L4_LESSON,
];

export async function seedAiCurriculumL4Lessons() {
  // Repair any existing rows that were seeded with old dash-style dimension keys.
  for (const [oldDim, newDim] of Object.entries(DIMENSION_REPAIR)) {
    await db
      .update(lesson)
      .set({ dimension: newDim })
      .where(eq(lesson.dimension, oldDim));
  }

  for (const lessonData of L4_LESSONS) {
    try {
      const existing = await db.query.lesson.findFirst({
        where: eq(lesson.slug, lessonData.slug),
      });

      if (existing) continue;

      const lessonId = crypto.randomUUID();

      await db.insert(lesson).values({
        id: lessonId,
        slug: lessonData.slug,
        title: lessonData.title,
        description: lessonData.description,
        dimension: lessonData.dimension,
        difficulty: lessonData.difficulty,
        estimatedMinutes: lessonData.estimatedMinutes,
        order: lessonData.order,
        content: lessonData.content,
        globalSequenceIndex: sequenceFor(lessonData.slug),
      });

      for (const quizData of lessonData.quizzes) {
        await db.insert(quiz).values({
          id: crypto.randomUUID(),
          lessonId,
          question: quizData.question,
          choices: quizData.choices,
          order: quizData.order,
        });
      }
    } catch (err) {
      console.error(`[seed] Failed to seed L4 lesson ${lessonData.slug}:`, err);
    }
  }
}
