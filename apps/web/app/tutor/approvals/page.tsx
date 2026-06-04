import { db } from "@repo/db/client";
import { roadmap, skillGroup } from "@repo/db/schema";
import { eq, and } from "@repo/db/drizzle";
import { requireAuth } from "~/lib/auth/session";
import { getTutorAssignedGroups } from "~/lib/tutor/scope";
import { ApprovalsTable } from "./_components/approvals-table";

export default async function TutorApprovalsPage() {
  const authUser = await requireAuth();

  const assignedGroupIds = await getTutorAssignedGroups(authUser.id);

  if (assignedGroupIds.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Pending Approvals</h1>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
          <p className="text-sm text-gray-600">
            You haven&rsquo;t been assigned to any skill groups yet
          </p>
        </div>
      </div>
    );
  }

  const pendingRoadmaps = await db.query.roadmap.findMany({
    where: and(
      eq(roadmap.approvalStatus, "pending"),
      eq(roadmap.approvalRequired, true)
    ),
    with: {
      user: true,
    },
  });

  const roadmapDetails = await Promise.all(
    pendingRoadmaps.map(async (rm) => {
      const group = rm.user.skillGroupId
        ? await db.query.skillGroup.findFirst({
            where: eq(skillGroup.id, rm.user.skillGroupId),
          })
        : null;

      return {
        id: rm.id,
        title: rm.title,
        studentName: rm.user.name || "Unknown",
        studentEmail: rm.user.email,
        skillGroup: group?.name || "Unassigned",
        createdAt: rm.createdAt,
        // Only show if student's group matches tutor's assigned groups
        canApprove: !!rm.user.skillGroupId && assignedGroupIds.includes(rm.user.skillGroupId),
      };
    })
  );

  const approvableRoadmaps = roadmapDetails.filter((r) => r.canApprove);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pending Approvals</h1>
        <p className="text-sm text-muted-foreground">
          {approvableRoadmaps.length} pending
        </p>
      </div>

      <ApprovalsTable roadmaps={approvableRoadmaps} />
    </div>
  );
}
