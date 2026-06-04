"use server";

import { db } from "@repo/db/client";
import { subscription, coupon, user, skillGroup, skillGroupApprovalRequest } from "@repo/db/schema";
import { eq, count } from "@repo/db/drizzle";
import { requireAdmin, requireSuperAdmin } from "~/lib/auth/permissions";
import { revalidatePath } from "next/cache";
import { sendWelcomeDiscountEmail } from "~/lib/email/resend";
import { logAdminAction } from "~/lib/admin/audit";
import {
  getTracks,
  createTrack,
  updateTrack,
  deleteTrack,
  getDimensionUsage,
  type TrackDimension,
} from "@repo/db/queries/tracks";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from "@repo/db/queries/courses";
import {
  getAllBlogPosts,
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "@repo/db/queries/blog-posts";

export async function adminOverridePlan(userId: string, plan: "free" | "pro") {
  const admin = await requireAdmin();

  const targetUser = await db.query.user.findFirst({ where: eq(user.id, userId) });
  if (!targetUser) throw new Error("User not found");

  await db
    .insert(subscription)
    .values({ id: crypto.randomUUID(), userId, plan, status: "active" })
    .onConflictDoUpdate({ target: subscription.userId, set: { plan, status: "active" } });

  logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "change_plan",
    targetUserId: userId,
    targetUserEmail: targetUser.email,
    details: { plan },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function adminBanUser(userId: string) {
  const admin = await requireAdmin();

  const targetUser = await db.query.user.findFirst({ where: eq(user.id, userId) });
  if (!targetUser) throw new Error("User not found");

  await db
    .insert(subscription)
    .values({ id: crypto.randomUUID(), userId, plan: "free", status: "banned" })
    .onConflictDoUpdate({ target: subscription.userId, set: { status: "banned" } });

  logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "ban_user",
    targetUserId: userId,
    targetUserEmail: targetUser.email,
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function adminUnbanUser(userId: string) {
  const admin = await requireAdmin();

  const targetUser = await db.query.user.findFirst({ where: eq(user.id, userId) });
  if (!targetUser) throw new Error("User not found");

  await db
    .insert(subscription)
    .values({ id: crypto.randomUUID(), userId, plan: "free", status: "active" })
    .onConflictDoUpdate({ target: subscription.userId, set: { status: "active", plan: "free" } });

  logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "unban_user",
    targetUserId: userId,
    targetUserEmail: targetUser.email,
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function adminDeleteUser(userId: string) {
  const admin = await requireSuperAdmin();

  // Prevent self-deletion via admin panel
  if (admin.id === userId) throw new Error("Cannot delete your own account via admin panel.");

  const targetUser = await db.query.user.findFirst({ where: eq(user.id, userId) });
  if (!targetUser) throw new Error("User not found");

  await db.delete(user).where(eq(user.id, userId));

  logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "delete_user",
    targetUserId: userId,
    targetUserEmail: targetUser.email,
  });

  revalidatePath("/admin/users");
}

export async function adminBulkSetPlan(
  userIds: string[],
  plan: "free" | "pro",
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();
  if (!userIds.length) return { success: false, error: "No users selected." };
  if (userIds.length > 100) {
    return { success: false, error: "Maximum 100 users per bulk operation." };
  }

  try {
    for (const userId of userIds) {
      await db
        .insert(subscription)
        .values({ id: crypto.randomUUID(), userId, plan, status: "active" })
        .onConflictDoUpdate({ target: subscription.userId, set: { plan, status: "active" } });
    }

    logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: "bulk_change_plan",
      details: { userIds, plan },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update selected users." };
  }
}

export async function adminBulkBan(
  userIds: string[],
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();
  if (!userIds.length) return { success: false, error: "No users selected." };
  if (userIds.length > 100) {
    return { success: false, error: "Maximum 100 users per bulk operation." };
  }

  try {
    for (const userId of userIds) {
      if (userId === admin.id) continue;
      await db
        .insert(subscription)
        .values({ id: crypto.randomUUID(), userId, plan: "free", status: "banned" })
        .onConflictDoUpdate({ target: subscription.userId, set: { status: "banned" } });
    }

    logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: "bulk_ban",
      details: { userIds },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to ban selected users." };
  }
}

export async function adminBulkUnban(
  userIds: string[],
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();
  if (!userIds.length) return { success: false, error: "No users selected." };
  if (userIds.length > 100) {
    return { success: false, error: "Maximum 100 users per bulk operation." };
  }

  try {
    for (const userId of userIds) {
      await db
        .insert(subscription)
        .values({ id: crypto.randomUUID(), userId, plan: "free", status: "active" })
        .onConflictDoUpdate({ target: subscription.userId, set: { status: "active" } });
    }

    logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: "bulk_unban",
      details: { userIds },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to unban selected users." };
  }
}

export async function adminBulkSetStatus(
  userIds: string[],
  status: string,
): Promise<{ success: boolean; error?: string }> {
  const validStatuses = ["active", "paused", "cancelled", "expired", "banned"];
  if (!validStatuses.includes(status)) {
    return { success: false, error: "Invalid status." };
  }

  // Superadmin required only for "banned" status
  const admin = status === "banned" ? await requireSuperAdmin() : await requireAdmin();
  if (!userIds.length) return { success: false, error: "No users selected." };
  if (userIds.length > 100) {
    return { success: false, error: "Maximum 100 users per bulk operation." };
  }

  try {
    for (const userId of userIds) {
      if (userId === admin.id) continue;
      await db
        .insert(subscription)
        .values({ id: crypto.randomUUID(), userId, plan: "free", status })
        .onConflictDoUpdate({ target: subscription.userId, set: { status } });
    }

    logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: "bulk_change_status",
      details: { userIds, status },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update selected users." };
  }
}

export async function adminBulkDelete(
  userIds: string[],
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireSuperAdmin();
  if (!userIds.length) return { success: false, error: "No users selected." };
  if (userIds.length > 100) {
    return { success: false, error: "Maximum 100 users per bulk operation." };
  }

  try {
    for (const userId of userIds) {
      if (userId === admin.id) continue;
      await db.delete(user).where(eq(user.id, userId));
    }

    logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: "bulk_delete",
      details: { userIds },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete selected users." };
  }
}

export async function adminSendCoupon(
  userId: string,
  couponCode: string,
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();

  const normalized = couponCode.trim().toUpperCase();
  if (!normalized || !/^[A-Z0-9-]{4,24}$/.test(normalized)) {
    return { success: false, error: "Invalid coupon code format." };
  }

  const [targetUser, couponRow] = await Promise.all([
    db.query.user.findFirst({ where: eq(user.id, userId) }),
    db.query.coupon.findFirst({ where: eq(coupon.code, normalized) }),
  ]);

  if (!targetUser) return { success: false, error: "User not found." };
  if (!couponRow || !couponRow.active) return { success: false, error: "Coupon not found or inactive." };
  if (couponRow.expiresAt && couponRow.expiresAt < new Date()) {
    return { success: false, error: "This coupon has expired." };
  }

  await sendWelcomeDiscountEmail({
    to: targetUser.email,
    name: targetUser.name,
    couponCode: normalized,
    discountPct: couponRow.discountPct,
  });

  logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "send_coupon",
    targetUserId: userId,
    targetUserEmail: targetUser.email,
    details: { couponCode: normalized },
  });

  return { success: true };
}

export async function adminChangeRole(
  userId: string,
  newRole: string,
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireSuperAdmin();

  // Prevent self-role-change via admin panel
  if (admin.id === userId) {
    return { success: false, error: "Cannot change your own role via admin panel." };
  }

  const validRoles = ["user", "admin", "tutor", "superadmin"];
  if (!validRoles.includes(newRole)) {
    return { success: false, error: "Invalid role." };
  }

  const targetUser = await db.query.user.findFirst({ where: eq(user.id, userId) });
  if (!targetUser) return { success: false, error: "User not found." };

  await db.update(user).set({ role: newRole }).where(eq(user.id, userId));

  logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "change_role",
    targetUserId: userId,
    targetUserEmail: targetUser.email,
    details: { oldRole: targetUser.role, newRole },
  });

  return { success: true };
}

export async function adminChangeSkillGroup(
  userId: string,
  skillGroupId: string | null,
): Promise<{ success: boolean; error?: string; requiresApproval?: boolean }> {
  const admin = await requireAdmin();

  const targetUser = await db.query.user.findFirst({ where: eq(user.id, userId) });
  if (!targetUser) return { success: false, error: "User not found." };

  // Validate skill group if provided
  let group = null;
  if (skillGroupId) {
    group = await db.query.skillGroup.findFirst({ where: eq(skillGroup.id, skillGroupId) });
    if (!group) return { success: false, error: "Skill group not found." };
  }

  const oldSkillGroupId = targetUser.skillGroupId;

  // Check if group has capacity limit and if it's exceeded
  let needsApproval = false;
  if (group && group.capacity && skillGroupId) {
    const usersInGroup = await db
      .select({ count: count() })
      .from(user)
      .where(eq(user.skillGroupId, skillGroupId));
    const currentCount = usersInGroup[0]?.count ?? 0;

    if (currentCount >= group.capacity) {
      needsApproval = true;
    }
  }

  if (needsApproval) {
    // Create approval request instead of immediately assigning
    await db.insert(skillGroupApprovalRequest).values({
      id: crypto.randomUUID(),
      userId,
      skillGroupId: skillGroupId!,
      status: "pending",
      requestedBy: admin.id,
      requestedAt: new Date(),
    });

    logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: "request_skill_group_change",
      targetUserId: userId,
      targetUserEmail: targetUser.email,
      details: { oldSkillGroupId, requestedSkillGroupId: skillGroupId, reason: "Capacity limit reached" },
    });

    revalidatePath("/admin/approvals");
    return { success: true, requiresApproval: true };
  }

  // No capacity issue, immediately assign
  await db.update(user).set({ skillGroupId }).where(eq(user.id, userId));

  logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "change_skill_group",
    targetUserId: userId,
    targetUserEmail: targetUser.email,
    details: { oldSkillGroupId, newSkillGroupId: skillGroupId },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}

export async function adminApproveSkillGroupRequest(
  requestId: string,
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();

  const request = await db.query.skillGroupApprovalRequest.findFirst({
    where: eq(skillGroupApprovalRequest.id, requestId),
  });

  if (!request) return { success: false, error: "Request not found." };
  if (request.status !== "pending") return { success: false, error: "Request is not pending." };

  // Update approval status
  await db
    .update(skillGroupApprovalRequest)
    .set({ status: "approved", approvedBy: admin.id, approvedAt: new Date() })
    .where(eq(skillGroupApprovalRequest.id, requestId));

  // Assign user to skill group
  await db.update(user).set({ skillGroupId: request.skillGroupId }).where(eq(user.id, request.userId));

  const targetUser = await db.query.user.findFirst({ where: eq(user.id, request.userId) });
  logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "approve_skill_group_request",
    targetUserId: request.userId,
    targetUserEmail: targetUser?.email,
    details: { skillGroupId: request.skillGroupId },
  });

  revalidatePath("/admin/approvals");
  revalidatePath("/admin/users");
  return { success: true };
}

export async function adminRejectSkillGroupRequest(
  requestId: string,
  reason: string,
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();

  const request = await db.query.skillGroupApprovalRequest.findFirst({
    where: eq(skillGroupApprovalRequest.id, requestId),
  });

  if (!request) return { success: false, error: "Request not found." };
  if (request.status !== "pending") return { success: false, error: "Request is not pending." };

  // Update to rejected
  await db
    .update(skillGroupApprovalRequest)
    .set({ status: "rejected", rejectionReason: reason, approvedBy: admin.id, approvedAt: new Date() })
    .where(eq(skillGroupApprovalRequest.id, requestId));

  const targetUser = await db.query.user.findFirst({ where: eq(user.id, request.userId) });
  logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "reject_skill_group_request",
    targetUserId: request.userId,
    targetUserEmail: targetUser?.email,
    details: { skillGroupId: request.skillGroupId, reason },
  });

  revalidatePath("/admin/approvals");
  return { success: true };
}

export async function adminToggleTrack(
  id: string,
  enabled: boolean,
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();

  const tracks = await getTracks();
  const t = tracks.find((t) => t.id === id);
  if (!t) return { success: false, error: "Track not found." };

  await updateTrack(id, { enabled });

  logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: enabled ? "enable_track" : "disable_track",
    details: { track: t.value },
  });

  revalidatePath("/admin/tracks");
  revalidatePath("/(app)/onboarding/step-2");
  return { success: true };
}

export async function adminCreateTrack(data: {
  value: string;
  label: string;
  description: string;
  icon: string;
  recommended: boolean;
  order: number;
  languages: string[];
  dimensions: TrackDimension[];
}): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();

  if (!data.value || !/^[a-z_]+$/.test(data.value)) {
    return { success: false, error: "Value must be lowercase letters and underscores only." };
  }

  const existing = await getTracks();
  if (existing.some((t) => t.value === data.value)) {
    return { success: false, error: "A track with this value already exists." };
  }

  await createTrack({ ...data, enabled: false });

  logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "create_track",
    details: { value: data.value, label: data.label },
  });

  revalidatePath("/admin/tracks");
  return { success: true };
}

export async function adminUpdateTrack(
  id: string,
  data: Partial<{
    label: string;
    description: string;
    icon: string;
    recommended: boolean;
    order: number;
    languages: string[];
    dimensions: TrackDimension[];
  }>,
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();

  const tracks = await getTracks();
  const t = tracks.find((t) => t.id === id);
  if (!t) return { success: false, error: "Track not found." };

  // Dimension safety: if removing a dimension key that has content, block it
  if (data.dimensions) {
    const removedKeys = (t.dimensions as TrackDimension[])
      .map((d) => d.key)
      .filter((k) => !data.dimensions!.some((d) => d.key === k));

    for (const key of removedKeys) {
      const usage = await getDimensionUsage(key);
      if (usage.total > 0) {
        return {
          success: false,
          error: `Cannot remove dimension "${key}" — it has ${usage.itemCount} item(s) and ${usage.lessonCount} lesson(s) referencing it.`,
        };
      }
    }
  }

  await updateTrack(id, data);

  logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "update_track",
    details: { id, changes: Object.keys(data) },
  });

  revalidatePath("/admin/tracks");
  revalidatePath("/(app)/onboarding/step-2");
  return { success: true };
}

export async function adminDeleteTrack(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();

  const result = await deleteTrack(id);

  if (!result.ok) return { success: false, error: result.reason };

  logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "delete_track",
    details: { id },
  });

  revalidatePath("/admin/tracks");
  revalidatePath("/(app)/onboarding/step-2");
  return { success: true };
}

// --- Courses (admin-managed free courses catalog) ---

export async function adminCreateCourse(data: {
  slug: string;
  title: string;
  description: string;
  provider: string;
  imageUrl?: string;
  courseUrl: string;
  level: string;
  category: string;
  tags: string[];
  durationHours?: number;
  studentCount?: number;
  rating?: number;
  isFree: boolean;
  order: number;
}): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const slug = data.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!slug) return { success: false, error: "Slug is invalid." };

  const existing = await getCourses();
  if (existing.some((c) => c.slug === slug)) {
    return { success: false, error: "A course with this slug already exists." };
  }

  await createCourse({ ...data, slug, isPublished: false });

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  return { success: true };
}

export async function adminUpdateCourse(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    provider: string;
    imageUrl: string | null;
    courseUrl: string;
    level: string;
    category: string;
    tags: string[];
    durationHours: number | null;
    studentCount: number | null;
    rating: number | null;
    isFree: boolean;
    order: number;
  }>,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const existing = await getCourseById(id);
  if (!existing) return { success: false, error: "Course not found." };

  await updateCourse(id, data);

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  return { success: true };
}

export async function adminToggleCoursePublished(
  id: string,
  isPublished: boolean,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const existing = await getCourseById(id);
  if (!existing) return { success: false, error: "Course not found." };

  await updateCourse(id, { isPublished });

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  return { success: true };
}

export async function adminDeleteCourse(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const existing = await getCourseById(id);
  if (!existing) return { success: false, error: "Course not found." };

  await deleteCourse(id);

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  return { success: true };
}

// --- Blog Posts (admin-managed) ---

export async function adminCreateBlogPost(data: {
  slug: string;
  title: string;
  description: string;
  author: string;
  content: string;
  tags: string[];
}): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const slug = data.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!slug) return { success: false, error: "Slug is invalid." };

  const existing = await getAllBlogPosts();
  if (existing.some((p) => p.slug === slug)) {
    return { success: false, error: "A post with this slug already exists." };
  }

  const wordCount = data.content.replace(/[#*`[\]()]/g, "").trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  await createBlogPost({
    slug,
    title: data.title.trim(),
    description: data.description.trim(),
    author: data.author.trim(),
    content: data.content,
    tags: data.tags,
    readingTime,
    isPublished: false,
  });

  revalidatePath("/admin/blog-posts");
  revalidatePath("/blog");
  return { success: true };
}

export async function adminUpdateBlogPost(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    author: string;
    content: string;
    tags: string[];
  }>,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const existing = await getBlogPost(id);
  if (!existing) return { success: false, error: "Post not found." };

  const updates: Partial<typeof data> = { ...data };

  if (data.content) {
    const wordCount = data.content.replace(/[#*`[\]()]/g, "").trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    (updates as Record<string, unknown>).readingTime = readingTime;
  }

  await updateBlogPost(id, updates as Record<string, unknown>);

  revalidatePath("/admin/blog-posts");
  revalidatePath("/blog");
  return { success: true };
}

export async function adminToggleBlogPostPublished(
  id: string,
  isPublished: boolean,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const existing = await getBlogPost(id);
  if (!existing) return { success: false, error: "Post not found." };

  await updateBlogPost(id, {
    isPublished,
    publishedAt: isPublished ? new Date() : null,
  });

  revalidatePath("/admin/blog-posts");
  revalidatePath("/blog");
  return { success: true };
}

export async function adminDeleteBlogPost(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const existing = await getBlogPost(id);
  if (!existing) return { success: false, error: "Post not found." };

  await deleteBlogPost(id);

  revalidatePath("/admin/blog-posts");
  revalidatePath("/blog");
  return { success: true };
}

