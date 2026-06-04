import { notFound } from "next/navigation";
import { db } from "@repo/db/client";
import { user, skillGroup, lessonProgress, attempt, roadmap } from "@repo/db/schema";
import { eq, and, count, isNotNull } from "@repo/db/drizzle";
import { requireAuth } from "~/lib/auth/session";
import { canTutorAccessStudent } from "~/lib/tutor/scope";
import { BookOpen, CheckCircle2, AlertCircle } from "lucide-react";
import { ReassignmentModal } from "./_components/reassignment-modal";
import { SendMessageModal } from "./_components/send-message-modal";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TutorStudentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const authUser = await requireAuth();

  const canAccess = await canTutorAccessStudent(authUser.id, id);
  if (!canAccess) {
    notFound();
  }

  const [studentData, skillGroups] = await Promise.all([
    db.query.user.findFirst({
      where: eq(user.id, id),
    }),
    db.query.skillGroup.findMany(),
  ]);

  if (!studentData) {
    notFound();
  }

  const [
    skillGroupData,
    completedLessonsResult,
    completedAttemptsResult,
    latestRoadmapData,
  ] = await Promise.all([
    studentData.skillGroupId
      ? db.query.skillGroup.findFirst({
          where: eq(skillGroup.id, studentData.skillGroupId),
        })
      : Promise.resolve(null),
    db
      .select({ count: count() })
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, id),
          isNotNull(lessonProgress.completedAt)
        )
      ),
    db
      .select({ count: count() })
      .from(attempt)
      .where(
        and(eq(attempt.userId, id), isNotNull(attempt.completedAt))
      ),
    db.query.roadmap.findFirst({
      where: eq(roadmap.userId, id),
      orderBy: (r, { desc }) => [desc(r.createdAt)],
    }),
  ]);

  const completedLessonsCount = completedLessonsResult[0]?.count ?? 0;
  const completedAttemptsCount = completedAttemptsResult[0]?.count ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{studentData.name}</h1>
        <p className="mt-2 text-gray-600">{studentData.email}</p>
        {skillGroupData && (
          <div className="mt-4 inline-block rounded-full bg-blue-50 px-3 py-1">
            <p className="text-sm font-medium text-blue-700">
              {skillGroupData.name}
            </p>
          </div>
        )}
      </div>

      {/* Key metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Lessons Completed
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {completedLessonsCount}
              </p>
            </div>
            <div className="rounded-full bg-blue-50 p-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Assessments Completed
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {completedAttemptsCount}
              </p>
            </div>
            <div className="rounded-full bg-green-50 p-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Roadmap Status
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {latestRoadmapData ? (
                  <span className="text-lg">
                    {latestRoadmapData.approvalStatus === "pending" && "Pending"}
                    {latestRoadmapData.approvalStatus === "approved" && "Approved"}
                    {latestRoadmapData.approvalStatus === "rejected" && "Rejected"}
                  </span>
                ) : (
                  "—"
                )}
              </p>
            </div>
            <div className="rounded-full bg-yellow-50 p-3">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap card */}
      {latestRoadmapData && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900">Current Roadmap</h2>
          <p className="mt-2 text-gray-600">{latestRoadmapData.title}</p>
          <div className="mt-4 flex items-center justify-between">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                latestRoadmapData.approvalStatus === "pending"
                  ? "bg-yellow-50 text-yellow-700"
                  : latestRoadmapData.approvalStatus === "approved"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
              }`}
            >
              {latestRoadmapData.approvalStatus}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <SendMessageModal studentId={id} studentName={studentData.name || "Student"} />
        <ReassignmentModal
          studentId={id}
          currentSkillGroupId={studentData.skillGroupId ?? undefined}
          allSkillGroups={skillGroups}
        />
      </div>
    </div>
  );
}
