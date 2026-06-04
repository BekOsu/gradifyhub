"use server";

import { and, eq } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { userRoadmapNodeProgress } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";

export async function setNodeProgress(
  catalogNodeId: string,
  status: "done" | "in-progress" | "skip" | null,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();

  if (status === null) {
    await db
      .delete(userRoadmapNodeProgress)
      .where(
        and(
          eq(userRoadmapNodeProgress.userId, user.id),
          eq(userRoadmapNodeProgress.catalogNodeId, catalogNodeId),
        ),
      );
    return { success: true };
  }

  await db
    .insert(userRoadmapNodeProgress)
    .values({
      id: crypto.randomUUID(),
      userId: user.id,
      catalogNodeId,
      status,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [userRoadmapNodeProgress.userId, userRoadmapNodeProgress.catalogNodeId],
      set: { status, updatedAt: new Date() },
    });

  return { success: true };
}
