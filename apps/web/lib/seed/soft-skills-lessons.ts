// Soft Skills track — 18 lessons (6 dimensions × L1–L3).
// Not yet wired into the main seed runner; awaits the `track` schema field.
// See local-only/tasks/soft-skills-path/IMPLEMENTATION_PLAN.md Stage 1.

import { eq } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { lesson, quiz } from "@repo/db/schema";

import { D1_LESSONS } from "./soft-skills/d1-written-comms";
import { D2_LESSONS } from "./soft-skills/d2-discovery-scoping";
import { D3_LESSONS } from "./soft-skills/d3-async-collab";
import { D4_LESSONS } from "./soft-skills/d4-code-review";
import { D5_LESSONS } from "./soft-skills/d5-conflict-escalation";
import { D6_LESSONS } from "./soft-skills/d6-career-navigation";

const SOFT_SKILLS_LESSONS = [
  ...D1_LESSONS,
  ...D2_LESSONS,
  ...D3_LESSONS,
  ...D4_LESSONS,
  ...D5_LESSONS,
  ...D6_LESSONS,
];

export async function seedSoftSkillsLessons() {
  for (const lessonData of SOFT_SKILLS_LESSONS) {
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
        track: "soft-skills",
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
      console.error(`[seed] Failed to seed soft-skills lesson ${lessonData.slug}:`, err);
    }
  }
}
