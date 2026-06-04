import { db } from "@repo/db/client";
import { roadmap, skillGroup } from "@repo/db/schema";
import { eq } from "@repo/db/drizzle";

export async function shouldApproveRoadmapAuto(
  skillGroupId: string
): Promise<boolean> {
  const group = await db.query.skillGroup.findFirst({
    where: eq(skillGroup.id, skillGroupId),
  });

  return group ? !group.approvalRequired : false;
}

export async function approveRoadmap(
  roadmapId: string,
  tutorId: string
): Promise<void> {
  await db
    .update(roadmap)
    .set({
      approvalStatus: "approved",
      approvedByTutorId: tutorId,
    })
    .where(eq(roadmap.id, roadmapId));
}

export async function rejectRoadmap(
  roadmapId: string
): Promise<void> {
  await db
    .update(roadmap)
    .set({
      approvalStatus: "rejected",
    })
    .where(eq(roadmap.id, roadmapId));
}
