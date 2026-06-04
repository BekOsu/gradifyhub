import { db } from "@repo/db/client";
import { tutorSkillGroup, user } from "@repo/db/schema";
import { eq, count, isNotNull } from "@repo/db/drizzle";
import { TutorsTable } from "./_components/tutors-table";

export default async function AdminTutorsPage() {
  const skillGroups = await db.query.skillGroup.findMany();

  const [tutorCounts, studentCounts] = await Promise.all([
    db
      .select({ skillGroupId: tutorSkillGroup.skillGroupId, count: count() })
      .from(tutorSkillGroup)
      .groupBy(tutorSkillGroup.skillGroupId),
    db
      .select({ skillGroupId: user.skillGroupId, count: count() })
      .from(user)
      .where(isNotNull(user.skillGroupId))
      .groupBy(user.skillGroupId),
  ]);

  const tutorCountMap = new Map(tutorCounts.map((r) => [r.skillGroupId, r.count]));
  const studentCountMap = new Map(studentCounts.map((r) => [r.skillGroupId, r.count]));

  const groupStats = skillGroups.map((group) => ({
    ...group,
    tutorCount: tutorCountMap.get(group.id) ?? 0,
    studentCount: studentCountMap.get(group.id) ?? 0,
  }));

  const allTutors = await db.query.user.findMany({
    where: eq(user.role, "tutor"),
  });

  const allAssignments = await db
    .select({ skillGroupId: tutorSkillGroup.skillGroupId, tutorId: tutorSkillGroup.tutorId })
    .from(tutorSkillGroup);

  const groupAssignments: Record<string, string[]> = {};
  for (const group of skillGroups) {
    groupAssignments[group.id] = allAssignments
      .filter((a) => a.skillGroupId === group.id)
      .map((a) => a.tutorId);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tutor Management</h1>
        <p className="text-sm text-muted-foreground">
          {skillGroups.length} skill group{skillGroups.length !== 1 ? "s" : ""}
        </p>
      </div>

      <TutorsTable
        skillGroups={groupStats}
        allTutors={allTutors}
        groupAssignments={groupAssignments}
      />
    </div>
  );
}
