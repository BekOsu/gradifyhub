import { db } from "@repo/db/client";
import { user, tutorSkillGroup } from "@repo/db/schema";
import { eq, inArray, and } from "@repo/db/drizzle";

export async function getTutorAssignedGroups(tutorId: string): Promise<string[]> {
  const groups = await db.query.tutorSkillGroup.findMany({
    where: eq(tutorSkillGroup.tutorId, tutorId),
    columns: { skillGroupId: true },
  });

  return groups.map((g) => g.skillGroupId);
}

export async function getTutorStudents(tutorId: string) {
  const groupIds = await getTutorAssignedGroups(tutorId);
  if (groupIds.length === 0) return [];

  const students = await db.query.user.findMany({
    where: inArray(user.skillGroupId, groupIds),
  });

  return students;
}

export async function canTutorAccessStudent(
  tutorId: string,
  studentId: string
): Promise<boolean> {
  const student = await db.query.user.findFirst({
    where: eq(user.id, studentId),
    columns: { skillGroupId: true },
  });

  if (!student?.skillGroupId) return false;

  const groupIds = await getTutorAssignedGroups(tutorId);
  return groupIds.includes(student.skillGroupId);
}

export async function canStudentMessageTutor(
  studentId: string,
  tutorId: string
): Promise<boolean> {
  const student = await db.query.user.findFirst({
    where: eq(user.id, studentId),
    columns: { skillGroupId: true },
  });

  if (!student?.skillGroupId) return false;

  const assignment = await db.query.tutorSkillGroup.findFirst({
    where: and(
      eq(tutorSkillGroup.tutorId, tutorId),
      eq(tutorSkillGroup.skillGroupId, student.skillGroupId)
    ),
    columns: { id: true },
  });

  return !!assignment;
}
