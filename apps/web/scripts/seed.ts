// Load env before any workspace imports (which trigger db connection)
process.loadEnvFile(".env.local");

import { seedAdminUsers } from "../lib/seed/admin-users";
import { seedSkillGroups } from "../lib/seed/skill-groups";
import { seedLessons } from "../lib/seed/lessons";
import { seedCurriculumLessons } from "../lib/seed/lessons-curriculum";
import { seedAiCurriculumL4Lessons } from "../lib/seed/ai-curriculum-l4-lessons";
import { seedSoftSkillsLessons } from "../lib/seed/soft-skills-lessons";
import { seedEnglishProficiencyLessons } from "../lib/seed/english-proficiency-lessons";
import { seedItems } from "../lib/seed/items";
import { seedTracks } from "../lib/seed/tracks";
import { seedRoadmapAiCurriculum } from "../lib/seed/roadmap-ai-curriculum";
import { seedRoadmapSoftSkills, patchSoftSkillsMissingLessonIds } from "../lib/seed/roadmap-soft-skills";
import { seedRoadmapEnglishProficiency, patchEnglishMissingLessonIds } from "../lib/seed/roadmap-english-proficiency";

async function main() {
  console.log("Seeding database...");

  try {
    await seedAdminUsers();
    console.log("✓ Admin users seeded");

    await seedSkillGroups();
    console.log("✓ Skill groups seeded");

    await seedTracks();
    console.log("✓ Tracks seeded");

    await seedLessons();
    console.log("✓ Lessons seeded");

    await seedCurriculumLessons();
    console.log("✓ Curriculum lessons seeded");

    await seedAiCurriculumL4Lessons();
    console.log("✓ AI curriculum L4 lessons seeded");

    await seedSoftSkillsLessons();
    console.log("✓ Soft skills lessons seeded");

    await seedEnglishProficiencyLessons();
    console.log("✓ English proficiency lessons seeded");

    await seedRoadmapAiCurriculum();
    console.log("✓ AI curriculum roadmap seeded");

    await seedRoadmapSoftSkills();
    console.log("✓ Soft skills roadmap seeded");

    await patchSoftSkillsMissingLessonIds();
    console.log("✓ Soft skills nodes patched");

    await seedRoadmapEnglishProficiency();
    console.log("✓ English proficiency roadmap seeded");

    await patchEnglishMissingLessonIds();
    console.log("✓ English proficiency nodes patched");

    await seedItems();
    console.log("✓ Assessment items seeded");

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

main();