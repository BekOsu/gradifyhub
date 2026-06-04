"use server";

import { db } from "@repo/db/client";
import { skillGroup, tutorSkillGroup, message, roadmap, user, attempt, skillGroupApprovalRequest } from "@repo/db/schema";
import { eq, and, inArray } from "@repo/db/drizzle";
import { requireSuperAdmin } from "~/lib/auth/permissions";
import { requireAuth } from "~/lib/auth/session";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "~/lib/admin/audit";
import { approveRoadmap as approveRoadmapHelper, rejectRoadmap as rejectRoadmapHelper } from "~/lib/tutor/approval";
import { canTutorAccessStudent, getTutorAssignedGroups, canStudentMessageTutor } from "~/lib/tutor/scope";
import { z } from "zod";

// ============================================================================
// SUPERADMIN ACTIONS: Skill Group & Tutor Management
// ============================================================================

const CreateSkillGroupSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export async function createSkillGroup(name: string): Promise<{ id: string }> {
  const admin = await requireSuperAdmin();

  const schema = CreateSkillGroupSchema.parse({ name });

  const id = crypto.randomUUID();
  await db.insert(skillGroup).values({
    id,
    name: schema.name,
    approvalRequired: true,
    capacity: null,
    createdAt: new Date(),
  });

  logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "create_skill_group",
    details: { name: schema.name },
  });

  revalidatePath("/admin/tutors");
  return { id };
}

export async function deleteSkillGroup(skillGroupId: string) {
  const admin = await requireSuperAdmin();

  const group = await db.query.skillGroup.findFirst({
    where: eq(skillGroup.id, skillGroupId),
  });

  if (!group) throw new Error("Skill group not found");

  await db.delete(skillGroup).where(eq(skillGroup.id, skillGroupId));

  logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "delete_skill_group",
    details: { skillGroupId, name: group.name },
  });

  revalidatePath("/admin/tutors");
}

export async function updateSkillGroupName(
  skillGroupId: string,
  name: string
) {
  const admin = await requireSuperAdmin();

  const group = await db.query.skillGroup.findFirst({
    where: eq(skillGroup.id, skillGroupId),
  });

  if (!group) throw new Error("Skill group not found");

  await db
    .update(skillGroup)
    .set({ name })
    .where(eq(skillGroup.id, skillGroupId));

  logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "update_skill_group",
    details: { skillGroupId, name },
  });

  revalidatePath("/admin/tutors");
}

const SetApprovalRequiredSchema = z.object({
  skillGroupId: z.string().min(1),
  required: z.boolean(),
});

export async function setApprovalRequired(
  skillGroupId: string,
  required: boolean
): Promise<void> {
  const admin = await requireSuperAdmin();

  const schema = SetApprovalRequiredSchema.parse({ skillGroupId, required });

  const group = await db.query.skillGroup.findFirst({
    where: eq(skillGroup.id, schema.skillGroupId),
  });

  if (!group) throw new Error("Skill group not found");

  await db
    .update(skillGroup)
    .set({ approvalRequired: schema.required })
    .where(eq(skillGroup.id, schema.skillGroupId));

  // Auto-approve all pending roadmaps for this group if approval is no longer required
  if (!schema.required) {
    const students = await db
      .select({ userId: user.id })
      .from(user)
      .where(eq(user.skillGroupId, schema.skillGroupId));

    const studentIds = students.map((s) => s.userId);

    if (studentIds.length > 0) {
      await db
        .update(roadmap)
        .set({ approvalStatus: "approved" })
        .where(
          and(
            inArray(roadmap.userId, studentIds),
            eq(roadmap.approvalStatus, "pending"),
            eq(roadmap.approvalRequired, true)
          )
        );
    }
  }

  logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "set_approval_required",
    details: { skillGroupId: schema.skillGroupId, required: schema.required },
  });

  revalidatePath("/admin/tutors");
}

const AssignTutorToGroupSchema = z.object({
  tutorId: z.string().min(1),
  skillGroupId: z.string().min(1),
});

export async function assignTutorToGroup(
  tutorId: string,
  skillGroupId: string
): Promise<void> {
  const admin = await requireSuperAdmin();

  const schema = AssignTutorToGroupSchema.parse({ tutorId, skillGroupId });

  // Verify tutor exists
  const tutorUser = await db.query.user.findFirst({
    where: eq(user.id, schema.tutorId),
  });
  if (!tutorUser) throw new Error("Tutor not found");

  // Verify skill group exists
  const skillGroupRecord = await db.query.skillGroup.findFirst({
    where: eq(skillGroup.id, schema.skillGroupId),
  });
  if (!skillGroupRecord) throw new Error("Skill group not found");

  // Insert or ignore if already exists (unique constraint)
  await db
    .insert(tutorSkillGroup)
    .values({
      id: crypto.randomUUID(),
      tutorId: schema.tutorId,
      skillGroupId: schema.skillGroupId,
      createdAt: new Date(),
    })
    .onConflictDoNothing();

  logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "assign_tutor_to_group",
    targetUserId: schema.tutorId,
    targetUserEmail: tutorUser.email,
    details: { skillGroupId: schema.skillGroupId },
  });

  revalidatePath("/admin/tutors");
}

const RemoveTutorFromGroupSchema = z.object({
  tutorId: z.string().min(1),
  skillGroupId: z.string().min(1),
});

export async function removeTutorFromGroup(
  tutorId: string,
  skillGroupId: string
): Promise<void> {
  const admin = await requireSuperAdmin();

  const schema = RemoveTutorFromGroupSchema.parse({ tutorId, skillGroupId });

  const tutorUser = await db.query.user.findFirst({
    where: eq(user.id, schema.tutorId),
  });
  if (!tutorUser) throw new Error("Tutor not found");

  await db
    .delete(tutorSkillGroup)
    .where(
      and(
        eq(tutorSkillGroup.tutorId, schema.tutorId),
        eq(tutorSkillGroup.skillGroupId, schema.skillGroupId)
      )
    );

  logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "remove_tutor_from_group",
    targetUserId: schema.tutorId,
    targetUserEmail: tutorUser.email,
    details: { skillGroupId: schema.skillGroupId },
  });

  revalidatePath("/admin/tutors");
}

export async function getAssignedTutorsForGroup(skillGroupId: string): Promise<string[]> {
  const assigned = await db
    .select({ tutorId: tutorSkillGroup.tutorId })
    .from(tutorSkillGroup)
    .where(eq(tutorSkillGroup.skillGroupId, skillGroupId));

  return assigned.map((a) => a.tutorId);
}

type RoadmapDetails = {
  id: string;
  title: string;
  totalWeeks: number;
  phases: {
    id: string;
    name: string;
    weeks: number;
    skills: {
      id: string;
      name: string;
      estimatedHours: number;
    }[];
  }[];
};

export async function getRoadmapDetails(roadmapId: string): Promise<RoadmapDetails | null> {
  const rm = await db.query.roadmap.findFirst({
    where: eq(roadmap.id, roadmapId),
    with: {
      phases: {
        with: {
          skills: true,
        },
      },
    },
  });

  if (!rm) return null;

  return {
    id: rm.id,
    title: rm.title,
    totalWeeks: rm.totalWeeks,
    phases: rm.phases.map((p) => ({
      id: p.id,
      name: p.name,
      weeks: p.weeks,
      skills: p.skills.map((s) => ({
        id: s.id,
        name: s.name,
        estimatedHours: s.estimatedHours,
      })),
    })),
  };
}

const AssignStudentToGroupSchema = z.object({
  skillGroupId: z.string().min(1),
});

export async function assignStudentToGroup(
  skillGroupId: string
): Promise<void> {
  const currentUser = await requireAuth();

  const schema = AssignStudentToGroupSchema.parse({ skillGroupId });

  const group = await db.query.skillGroup.findFirst({
    where: eq(skillGroup.id, schema.skillGroupId),
  });
  if (!group) throw new Error("Skill group not found");

  await db
    .update(user)
    .set({ skillGroupId: schema.skillGroupId })
    .where(eq(user.id, currentUser.id));

  revalidatePath("/onboarding/step-2");
  revalidatePath("/dashboard");
}

// ============================================================================
// TUTOR ACTIONS: Roadmap Approval & Student Management
// ============================================================================

const ApproveRoadmapSchema = z.object({
  roadmapId: z.string().min(1),
});

export async function approveRoadmap(roadmapId: string): Promise<void> {
  const currentUser = await requireAuth();

  const schema = ApproveRoadmapSchema.parse({ roadmapId });

  // Verify user is a tutor
  if (currentUser.role !== "tutor") {
    throw new Error("Unauthorized: Tutor role required");
  }

  // Get roadmap and verify it exists
  const roadmapRecord = await db.query.roadmap.findFirst({
    where: eq(roadmap.id, schema.roadmapId),
    with: {
      user: {
        columns: { skillGroupId: true },
      },
    },
  });
  if (!roadmapRecord) throw new Error("Roadmap not found");

  // Verify tutor can access this student's roadmap
  const canAccess = await canTutorAccessStudent(currentUser.id, roadmapRecord.userId);
  if (!canAccess) {
    throw new Error("Unauthorized: Cannot access this student");
  }

  // Verify roadmap approval scoping: tutor's assigned groups must include student's group
  const studentGroup = roadmapRecord.user?.skillGroupId;
  if (!studentGroup) {
    throw new Error("Student has no skill group assigned");
  }
  const assignedGroupIds = await getTutorAssignedGroups(currentUser.id);
  if (!assignedGroupIds.includes(studentGroup)) {
    throw new Error("You don't have permission to approve this roadmap");
  }

  // Get student details for audit log
  const studentUser = await db.query.user.findFirst({
    where: eq(user.id, roadmapRecord.userId),
  });

  // Call helper and log
  await approveRoadmapHelper(schema.roadmapId, currentUser.id);

  logAdminAction({
    adminId: currentUser.id,
    adminEmail: currentUser.email,
    action: "approve_roadmap",
    targetUserId: roadmapRecord.userId,
    targetUserEmail: studentUser?.email,
    details: { roadmapId: schema.roadmapId },
  });

  revalidatePath("/tutor/approvals");
  revalidatePath("/tutor/dashboard");
}

const RejectRoadmapSchema = z.object({
  roadmapId: z.string().min(1),
  reason: z.string().min(1, "Reason is required"),
});

export async function rejectRoadmap(
  roadmapId: string,
  reason: string
): Promise<void> {
  const currentUser = await requireAuth();

  const schema = RejectRoadmapSchema.parse({ roadmapId, reason });

  // Verify user is a tutor
  if (currentUser.role !== "tutor") {
    throw new Error("Unauthorized: Tutor role required");
  }

  // Get roadmap and verify it exists
  const roadmapRecord = await db.query.roadmap.findFirst({
    where: eq(roadmap.id, schema.roadmapId),
    with: {
      user: {
        columns: { skillGroupId: true },
      },
    },
  });
  if (!roadmapRecord) throw new Error("Roadmap not found");

  // Verify tutor can access this student's roadmap
  const canAccess = await canTutorAccessStudent(currentUser.id, roadmapRecord.userId);
  if (!canAccess) {
    throw new Error("Unauthorized: Cannot access this student");
  }

  // Verify roadmap approval scoping: tutor's assigned groups must include student's group
  const studentGroup = roadmapRecord.user?.skillGroupId;
  if (!studentGroup) {
    throw new Error("Student has no skill group assigned");
  }
  const assignedGroupIds = await getTutorAssignedGroups(currentUser.id);
  if (!assignedGroupIds.includes(studentGroup)) {
    throw new Error("You don't have permission to reject this roadmap");
  }

  // Get student details for audit log
  const studentUser = await db.query.user.findFirst({
    where: eq(user.id, roadmapRecord.userId),
  });

  // Call helper and log
  await rejectRoadmapHelper(schema.roadmapId);

  logAdminAction({
    adminId: currentUser.id,
    adminEmail: currentUser.email,
    action: "reject_roadmap",
    targetUserId: roadmapRecord.userId,
    targetUserEmail: studentUser?.email,
    details: { roadmapId: schema.roadmapId, reason: schema.reason },
  });

  revalidatePath("/tutor/approvals");
  revalidatePath("/tutor/dashboard");
}

const SendMessageToStudentSchema = z.object({
  studentId: z.string().min(1),
  content: z.string().min(1, "Message content is required"),
});

export async function sendMessageToStudent(
  studentId: string,
  content: string
): Promise<void> {
  const currentUser = await requireAuth();

  const schema = SendMessageToStudentSchema.parse({ studentId, content });

  // Verify user is a tutor
  if (currentUser.role !== "tutor") {
    throw new Error("Unauthorized: Tutor role required");
  }

  // Get student and verify exists
  const studentUser = await db.query.user.findFirst({
    where: eq(user.id, schema.studentId),
  });
  if (!studentUser) throw new Error("Student not found");

  // Verify tutor can access this student
  const canAccess = await canTutorAccessStudent(currentUser.id, schema.studentId);
  if (!canAccess) throw new Error("Unauthorized: Cannot message this student");

  // Insert message
  await db.insert(message).values({
    id: crypto.randomUUID(),
    tutorId: currentUser.id,
    studentId: schema.studentId,
    content: schema.content,
    senderRole: "tutor",
    createdAt: new Date(),
  });

  logAdminAction({
    adminId: currentUser.id,
    adminEmail: currentUser.email,
    action: "send_message",
    targetUserId: schema.studentId,
    targetUserEmail: studentUser.email,
  });

  revalidatePath(`/messages`);
  revalidatePath(`/tutor/messages`);
}

const ReassignAssessmentSchema = z.object({
  studentId: z.string().min(1),
  assessmentId: z.string().min(1),
});

export async function reassignAssessment(
  studentId: string,
  assessmentId: string
): Promise<void> {
  const currentUser = await requireAuth();

  const schema = ReassignAssessmentSchema.parse({ studentId, assessmentId });

  // Verify user is a tutor
  if (currentUser.role !== "tutor") {
    throw new Error("Unauthorized: Tutor role required");
  }

  // Get student and verify exists
  const studentUser = await db.query.user.findFirst({
    where: eq(user.id, schema.studentId),
  });
  if (!studentUser) throw new Error("Student not found");

  // Verify tutor can access this student
  const canAccess = await canTutorAccessStudent(currentUser.id, schema.studentId);
  if (!canAccess) {
    throw new Error("Unauthorized: Cannot reassign assessment for this student");
  }

  // Verify the assessment (attempt) exists and belongs to the student
  const attemptRecord = await db.query.attempt.findFirst({
    where: eq(attempt.id, schema.assessmentId),
  });

  if (!attemptRecord || attemptRecord.userId !== schema.studentId) {
    throw new Error("Assessment not found for this student");
  }

  // Mark the attempt as completed if not already
  if (!attemptRecord.completedAt) {
    await db
      .update(attempt)
      .set({ completedAt: new Date() })
      .where(eq(attempt.id, schema.assessmentId));
  }

  logAdminAction({
    adminId: currentUser.id,
    adminEmail: currentUser.email,
    action: "reassign_assessment",
    targetUserId: schema.studentId,
    targetUserEmail: studentUser.email,
    details: { assessmentId: schema.assessmentId },
  });
}

const RequestStudentReassignmentSchema = z.object({
  studentId: z.string().min(1),
  targetSkillGroupId: z.string().min(1),
  reason: z.string().min(10, "Please provide a reason (min 10 chars)"),
});

export async function requestStudentReassignment(
  studentId: string,
  targetSkillGroupId: string,
  reason: string,
): Promise<{ success: boolean; error?: string }> {
  const tutor = await requireAuth();
  if (tutor.role !== "tutor") return { success: false, error: "Unauthorized" };

  const schema = RequestStudentReassignmentSchema.safeParse({ studentId, targetSkillGroupId, reason });
  if (!schema.success) {
    return { success: false, error: schema.error.issues[0]?.message };
  }

  const canAccess = await canTutorAccessStudent(tutor.id, schema.data.studentId);
  if (!canAccess) return { success: false, error: "Cannot access this student" };

  const targetGroup = await db.query.skillGroup.findFirst({
    where: eq(skillGroup.id, schema.data.targetSkillGroupId),
  });
  if (!targetGroup) return { success: false, error: "Target skill group not found" };

  const student = await db.query.user.findFirst({
    where: eq(user.id, schema.data.studentId),
  });
  if (!student) return { success: false, error: "Student not found" };

  await db.insert(skillGroupApprovalRequest).values({
    id: crypto.randomUUID(),
    userId: schema.data.studentId,
    skillGroupId: schema.data.targetSkillGroupId,
    status: "pending",
    requestedBy: tutor.id,
    requestedAt: new Date(),
  });

  logAdminAction({
    adminId: tutor.id,
    adminEmail: tutor.email,
    action: "request_student_reassignment",
    targetUserId: schema.data.studentId,
    targetUserEmail: student.email,
    details: { targetSkillGroupId: schema.data.targetSkillGroupId, reason: schema.data.reason },
  });

  revalidatePath("/admin/approvals");
  return { success: true };
}

const SendMessageToTutorSchema = z.object({
  tutorId: z.string().min(1),
  content: z.string().min(1, "Message content is required"),
});

export async function sendMessageToTutor(
  tutorId: string,
  content: string,
): Promise<{ success: boolean; error?: string }> {
  const currentUser = await requireAuth();

  const parsed = SendMessageToTutorSchema.safeParse({ tutorId, content });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const canMessage = await canStudentMessageTutor(currentUser.id, tutorId);
  if (!canMessage) {
    return { success: false, error: "You cannot message this tutor" };
  }

  await db.insert(message).values({
    id: crypto.randomUUID(),
    tutorId: parsed.data.tutorId,
    studentId: currentUser.id,
    content: parsed.data.content,
    senderRole: "student",
    createdAt: new Date(),
  });

  logAdminAction({
    adminId: currentUser.id,
    adminEmail: currentUser.email,
    action: "send_message",
    targetUserId: parsed.data.tutorId,
  });

  revalidatePath("/messages");
  revalidatePath("/tutor/messages");
  return { success: true };
}
