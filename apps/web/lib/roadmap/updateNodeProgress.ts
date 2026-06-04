import { eq, and } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { roadmapCatalogNode, userRoadmapNodeProgress } from "@repo/db/schema";

export async function markRoadmapNodeDoneByLesson(userId: string, lessonId: string) {
  try {
    // Find the roadmap node that maps to this lesson
    const node = await db.query.roadmapCatalogNode.findFirst({
      where: eq(roadmapCatalogNode.lessonId, lessonId),
      columns: { id: true, roadmapId: true },
    });

    if (!node) {
      // No roadmap node maps to this lesson - that's ok, lesson exists independently
      return;
    }

    // Upsert the user's progress on this node
    const existingProgress = await db.query.userRoadmapNodeProgress.findFirst({
      where: and(
        eq(userRoadmapNodeProgress.userId, userId),
        eq(userRoadmapNodeProgress.catalogNodeId, node.id),
      ),
      columns: { id: true },
    });

    if (existingProgress) {
      // Update existing progress to done
      await db
        .update(userRoadmapNodeProgress)
        .set({ status: "done" })
        .where(eq(userRoadmapNodeProgress.id, existingProgress.id));
    } else {
      // Create new progress record
      const progressId = crypto.randomUUID();
      await db.insert(userRoadmapNodeProgress).values({
        id: progressId,
        userId,
        catalogNodeId: node.id,
        status: "done",
      });
    }
  } catch (error) {
    // Log the error for debugging but don't throw - lesson completion shouldn't fail due to roadmap update
    console.error("[roadmap] Failed to mark node done for lesson", lessonId, error);
  }
}
