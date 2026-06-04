import { eq } from "drizzle-orm";
import { db } from "../client";
import { roadmap, skill } from "../schema";

export async function getUserRoadmap(userId: string) {
  return db.query.roadmap.findFirst({
    where: eq(roadmap.userId, userId),
    with: {
      phases: {
        orderBy: (p, { asc }) => [asc(p.order)],
        with: {
          skills: {
            orderBy: (s, { asc }) => [asc(s.order)],
          },
        },
      },
    },
  });
}

export async function getSkill(userId: string, skillId: string) {
  const s = await db.query.skill.findFirst({
    where: eq(skill.id, skillId),
    with: {
      phase: {
        with: { roadmap: true },
      },
    },
  });
  if (!s) return null;
  const ownerUserId = (s.phase as { roadmap: { userId: string } }).roadmap.userId;
  if (ownerUserId !== userId) return null;
  return s;
}
