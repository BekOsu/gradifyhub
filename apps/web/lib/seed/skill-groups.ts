import { eq } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { skillGroup } from "@repo/db/schema";

const DEFAULT_SKILL_GROUPS = ["Backend", "Frontend", "AI"];

function getSkillGroupsFromEnv(): string[] {
  const envValue = process.env.SKILL_GROUPS;
  if (!envValue) return DEFAULT_SKILL_GROUPS;

  return envValue
    .split(",")
    .map((group) => group.trim())
    .filter((group) => group.length > 0);
}

export async function seedSkillGroups(): Promise<void> {
  const skillGroupNames = getSkillGroupsFromEnv();

  for (const name of skillGroupNames) {
    const exists = await db.query.skillGroup.findFirst({
      where: eq(skillGroup.name, name),
    });

    if (!exists) {
      await db.insert(skillGroup).values({
        id: crypto.randomUUID(),
        name,
        approvalRequired: true,
        createdAt: new Date(),
      });
    }
  }
}
