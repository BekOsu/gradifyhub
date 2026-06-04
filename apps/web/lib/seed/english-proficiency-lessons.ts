// English Proficiency track — 15 lessons (5 dimensions × L1–L3).
// Not yet wired into the main seed runner; awaits the `track` schema field.
// See local-only/tasks/english-proficiency-path/IMPLEMENTATION_PLAN.md Stage 1.

import { eq } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { lesson, quiz } from "@repo/db/schema";

import { D1_LESSONS } from "./english-proficiency/d1-reading";
import { D2_LESSONS } from "./english-proficiency/d2-listening";
import { D3_LESSONS } from "./english-proficiency/d3-speaking";
import { D4_LESSONS } from "./english-proficiency/d4-writing";
import { D5_LESSONS } from "./english-proficiency/d5-cross-cultural";

const ENGLISH_LESSONS = [
  ...D1_LESSONS,
  ...D2_LESSONS,
  ...D3_LESSONS,
  ...D4_LESSONS,
  ...D5_LESSONS,
];

export async function seedEnglishProficiencyLessons() {
  for (const lessonData of ENGLISH_LESSONS) {
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
        track: "english-proficiency",
        difficulty: lessonData.difficulty,
        estimatedMinutes: lessonData.estimatedMinutes,
        order: lessonData.order,
        content: lessonData.content,
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
      console.error(`[seed] Failed to seed english-proficiency lesson ${lessonData.slug}:`, err);
    }
  }
}
