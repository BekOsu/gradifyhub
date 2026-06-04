import Link from "next/link";
import { db } from "@repo/db/client";
import { roadmap, user, skillGroup } from "@repo/db/schema";
import { eq, and, count, inArray } from "@repo/db/drizzle";
import { requireAuth } from "~/lib/auth/session";
import { getTutorAssignedGroups } from "~/lib/tutor/scope";
import { ArrowRight, Users, Clock, AlertCircle } from "lucide-react";

export default async function TutorDashboardPage() {
  const authUser = await requireAuth();

  const assignedGroups = await getTutorAssignedGroups(authUser.id);

  const groupDetails = await Promise.all(
    assignedGroups.map(async (groupId) => {
      const group = await db.query.skillGroup.findFirst({
        where: eq(skillGroup.id, groupId),
      });

      const students = await db.query.user.findMany({
        where: eq(user.skillGroupId, groupId),
      });

      return {
        id: groupId,
        name: group?.name || "Unknown",
        studentCount: students.length,
      };
    })
  );

  const students = await db.query.user.findMany({
    where: inArray(user.skillGroupId, assignedGroups),
  });

  const studentIds = students.map((s) => s.id);
  const pendingApprovals =
    studentIds.length > 0
      ? await db
          .select({ count: count() })
          .from(roadmap)
          .where(
            and(
              inArray(roadmap.userId, studentIds),
              eq(roadmap.approvalStatus, "pending"),
              eq(roadmap.approvalRequired, true)
            )
          )
      : [{ count: 0 }];

  const pendingCount = pendingApprovals[0]?.count ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-2 text-gray-600">
          Manage your students and approve roadmaps
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Assigned Students
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {groupDetails.reduce((sum, g) => sum + g.studentCount, 0)}
              </p>
            </div>
            <div className="rounded-full bg-blue-50 p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Skill Groups
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {groupDetails.length}
              </p>
            </div>
            <div className="rounded-full bg-green-50 p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Approvals
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {pendingCount}
              </p>
            </div>
            <div className="rounded-full bg-yellow-50 p-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Skill groups */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Your Skill Groups</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {groupDetails.length === 0 ? (
            <div className="col-span-2 rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                You haven&rsquo;t been assigned to any skill groups yet
              </p>
            </div>
          ) : (
            groupDetails.map((group) => (
              <div
                key={group.id}
                className="rounded-lg border border-gray-200 bg-white p-6"
              >
                <h3 className="font-semibold text-gray-900">{group.name}</h3>
                <p className="mt-2 text-sm text-gray-600">
                  {group.studentCount} student{group.studentCount !== 1 ? "s" : ""}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/tutor/approvals"
          className="block rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <div className="flex items-center justify-between">
            <span>View Pending Approvals</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </Link>
        <Link
          href="/tutor/students"
          className="block rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <div className="flex items-center justify-between">
            <span>View All Students</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </Link>
      </div>
    </div>
  );
}
