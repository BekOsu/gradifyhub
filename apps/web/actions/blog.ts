"use server";

import { db } from "@repo/db/client";
import { blogBookmark, blogComment, blogLike, blogReaction } from "@repo/db/schema";
import { eq, and } from "@repo/db/drizzle";
import { requireAuth } from "~/lib/auth/session";
import { requireAdmin } from "~/lib/auth/permissions";
import { revalidatePath } from "next/cache";

const MAX_BODY = 2000;
const MIN_BODY = 2;
const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"] as const;

function sanitizeSlug(slug: string): string {
  return slug.replace(/[^a-z0-9-]/gi, "").slice(0, 120);
}

export type BlogReactionEmoji = (typeof REACTIONS)[number];

export async function addCommentAction(
  slug: string,
  body: string,
  parentId?: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();

  const trimmed = body.trim();
  if (trimmed.length < MIN_BODY) {
    return { success: false, error: "Comment is too short." };
  }
  if (trimmed.length > MAX_BODY) {
    return { success: false, error: "Comment is too long (max 2000 chars)." };
  }

  const cleanSlug = sanitizeSlug(slug);
  if (!cleanSlug) return { success: false, error: "Invalid post." };

  if (parentId) {
    const parent = await db.query.blogComment.findFirst({
      where: and(eq(blogComment.id, parentId), eq(blogComment.slug, cleanSlug)),
      columns: { id: true },
    });
    if (!parent) return { success: false, error: "Parent comment not found." };
  }

  await db.insert(blogComment).values({
    id: crypto.randomUUID(),
    slug: cleanSlug,
    userId: user.id,
    body: trimmed,
    parentId: parentId ?? null,
  });

  revalidatePath(`/blog/${cleanSlug}`);
  return { success: true };
}

export async function toggleLikeAction(
  slug: string,
): Promise<{ success: boolean; liked?: boolean; error?: string }> {
  const user = await requireAuth();
  const cleanSlug = sanitizeSlug(slug);
  if (!cleanSlug) return { success: false, error: "Invalid post." };

  const existing = await db.query.blogLike.findFirst({
    where: and(eq(blogLike.slug, cleanSlug), eq(blogLike.userId, user.id)),
    columns: { id: true },
  });

  if (existing) {
    await db.delete(blogLike).where(eq(blogLike.id, existing.id));
    revalidatePath(`/blog/${cleanSlug}`);
    return { success: true, liked: false };
  }

  await db.insert(blogLike).values({
    id: crypto.randomUUID(),
    slug: cleanSlug,
    userId: user.id,
  });

  revalidatePath(`/blog/${cleanSlug}`);
  return { success: true, liked: true };
}

export async function toggleBookmarkAction(
  slug: string,
): Promise<{ success: boolean; bookmarked?: boolean; error?: string }> {
  const user = await requireAuth();
  const cleanSlug = sanitizeSlug(slug);
  if (!cleanSlug) return { success: false, error: "Invalid post." };

  const existing = await db.query.blogBookmark.findFirst({
    where: and(eq(blogBookmark.slug, cleanSlug), eq(blogBookmark.userId, user.id)),
    columns: { id: true },
  });

  if (existing) {
    await db.delete(blogBookmark).where(eq(blogBookmark.id, existing.id));
    revalidatePath(`/blog/${cleanSlug}`);
    return { success: true, bookmarked: false };
  }

  await db.insert(blogBookmark).values({
    id: crypto.randomUUID(),
    slug: cleanSlug,
    userId: user.id,
  });

  revalidatePath(`/blog/${cleanSlug}`);
  return { success: true, bookmarked: true };
}

export async function setReactionAction(
  slug: string,
  emoji: BlogReactionEmoji,
): Promise<{ success: boolean; active?: BlogReactionEmoji | null; error?: string }> {
  const user = await requireAuth();
  const cleanSlug = sanitizeSlug(slug);
  if (!cleanSlug) return { success: false, error: "Invalid post." };
  if (!REACTIONS.includes(emoji)) return { success: false, error: "Invalid reaction." };

  const existing = await db.query.blogReaction.findFirst({
    where: and(eq(blogReaction.slug, cleanSlug), eq(blogReaction.userId, user.id)),
    columns: { id: true, emoji: true },
  });

  if (existing?.emoji === emoji) {
    await db.delete(blogReaction).where(eq(blogReaction.id, existing.id));
    revalidatePath(`/blog/${cleanSlug}`);
    return { success: true, active: null };
  }

  if (existing) {
    await db.update(blogReaction).set({ emoji }).where(eq(blogReaction.id, existing.id));
    revalidatePath(`/blog/${cleanSlug}`);
    return { success: true, active: emoji };
  }

  await db.insert(blogReaction).values({
    id: crypto.randomUUID(),
    slug: cleanSlug,
    userId: user.id,
    emoji,
  });

  revalidatePath(`/blog/${cleanSlug}`);
  return { success: true, active: emoji };
}

export async function deleteCommentAction(
  commentId: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();

  const row = await db.query.blogComment.findFirst({
    where: eq(blogComment.id, commentId),
  });

  if (!row) return { success: false, error: "Comment not found." };
  if (row.userId !== user.id) return { success: false, error: "Not your comment." };

  await db.delete(blogComment).where(
    and(eq(blogComment.id, commentId), eq(blogComment.userId, user.id)),
  );

  revalidatePath(`/blog/${row.slug}`);
  return { success: true };
}

export async function adminDeleteCommentAction(
  commentId: string,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const row = await db.query.blogComment.findFirst({
    where: eq(blogComment.id, commentId),
  });
  if (!row) return { success: false, error: "Comment not found." };

  await db.delete(blogComment).where(eq(blogComment.id, commentId));

  revalidatePath(`/blog/${row.slug}`);
  return { success: true };
}
