import { db } from "@repo/db/client";
import { skillGroupApprovalRequest, user, skillGroup } from "@repo/db/schema";
import { eq, aliasedTable } from "@repo/db/drizzle";
import { ApprovalsTable } from "./_components/approvals-table";

export default async function AdminApprovalsPage() {
  const requesterUser = aliasedTable(user, "requester_user");

  const requests = await db
    .select({
      id: skillGroupApprovalRequest.id,
      userId: skillGroupApprovalRequest.userId,
      userName: user.name,
      userEmail: user.email,
      skillGroupId: skillGroupApprovalRequest.skillGroupId,
      skillGroupName: skillGroup.name,
      status: skillGroupApprovalRequest.status,
      requestedAt: skillGroupApprovalRequest.requestedAt,
      requestedBy: skillGroupApprovalRequest.requestedBy,
      requesterName: requesterUser.name,
      requesterRole: requesterUser.role,
    })
    .from(skillGroupApprovalRequest)
    .leftJoin(user, eq(skillGroupApprovalRequest.userId, user.id))
    .leftJoin(skillGroup, eq(skillGroupApprovalRequest.skillGroupId, skillGroup.id))
    .leftJoin(requesterUser, eq(skillGroupApprovalRequest.requestedBy, requesterUser.id))
    .orderBy(skillGroupApprovalRequest.requestedAt);

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Skill Group Approvals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pendingCount} pending approval{pendingCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <ApprovalsTable initialRequests={requests} />
    </div>
  );
}
