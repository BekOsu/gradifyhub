"use server";

import { db } from "@repo/db/client";
import {
  communityComment,
  communityPoll,
  communityPollOption,
  communityPollVote,
  communityPost,
  communityReaction,
  userFollow,
} from "@repo/db/schema";
import { eq, and } from "@repo/db/drizzle";
import { requireAuth } from "~/lib/auth/session";
import { revalidatePath } from "next/cache";

export type PostCategory = "general" | "win" | "question" | "resource";
export type CommunityReactionEmoji = "👍" | "❤️" | "😂" | "😮" | "😢" | "😡";

const MAX_BODY = 280;
const MIN_BODY = 2;
const COMMENT_MAX_BODY = 2000;
const ALLOWED_REACTIONS: CommunityReactionEmoji[] = ["👍", "❤️", "😂", "😮", "😢", "😡"];

interface CreatePostOptions {
  title?: string;
  mediaUrl?: string;
  tags?: string[];
  poll?: {
    question: string;
    options: string[];
    endsAt?: string;
  };
}

export async function createPostAction(
  body: string,
  category: PostCategory,
  options?: CreatePostOptions,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();

  const trimmed = body.trim();
  if (trimmed.length < MIN_BODY) return { success: false, error: "Too short." };
  if (trimmed.length > MAX_BODY) return { success: false, error: "Max 280 characters." };

  const tags = (options?.tags ?? [])
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);

  const question = options?.poll?.question?.trim();
  const pollOptions = (options?.poll?.options ?? []).map((option) => option.trim()).filter(Boolean);
  const hasPoll = Boolean(question && pollOptions.length >= 2);

  await db.transaction(async (tx) => {
    const postId = crypto.randomUUID();
    await tx.insert(communityPost).values({
      id: postId,
      userId: user.id,
      title: options?.title?.trim() || null,
      body: trimmed,
      category,
      mediaUrl: options?.mediaUrl?.trim() || null,
      tags,
      isPoll: hasPoll,
    });

    if (hasPoll && question) {
      const pollId = crypto.randomUUID();
      await tx.insert(communityPoll).values({
        id: pollId,
        postId,
        question,
        endsAt: options?.poll?.endsAt ? new Date(options.poll.endsAt) : null,
      });

      await tx.insert(communityPollOption).values(
        pollOptions.slice(0, 6).map((option, index) => ({
          id: crypto.randomUUID(),
          pollId,
          label: option,
          order: index,
        })),
      );
    }
  });

  revalidatePath("/community");
  return { success: true };
}

export async function deletePostAction(
  postId: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();

  const row = await db.query.communityPost.findFirst({
    where: eq(communityPost.id, postId),
  });

  if (!row) return { success: false, error: "Post not found." };
  if (row.userId !== user.id) return { success: false, error: "Not your post." };

  await db
    .delete(communityPost)
    .where(and(eq(communityPost.id, postId), eq(communityPost.userId, user.id)));

  revalidatePath("/community");
  revalidatePath(`/community/${postId}`);
  return { success: true };
}

export async function setReactionAction(
  postId: string,
  emoji: CommunityReactionEmoji,
): Promise<{ success: boolean; active?: CommunityReactionEmoji | null; error?: string }> {
  const user = await requireAuth();
  if (!ALLOWED_REACTIONS.includes(emoji)) {
    return { success: false, error: "Invalid reaction." };
  }

  const post = await db.query.communityPost.findFirst({
    where: eq(communityPost.id, postId),
    columns: { id: true },
  });
  if (!post) return { success: false, error: "Post not found." };

  const existing = await db.query.communityReaction.findFirst({
    where: and(eq(communityReaction.postId, postId), eq(communityReaction.userId, user.id)),
    columns: { id: true, emoji: true },
  });

  if (existing?.emoji === emoji) {
    await db.delete(communityReaction).where(eq(communityReaction.id, existing.id));
    revalidatePath("/community");
    revalidatePath(`/community/${postId}`);
    return { success: true, active: null };
  }

  if (existing) {
    await db.update(communityReaction).set({ emoji }).where(eq(communityReaction.id, existing.id));
    revalidatePath("/community");
    revalidatePath(`/community/${postId}`);
    return { success: true, active: emoji };
  }

  await db.insert(communityReaction).values({
    id: crypto.randomUUID(),
    postId,
    userId: user.id,
    emoji,
  });

  revalidatePath("/community");
  revalidatePath(`/community/${postId}`);
  return { success: true, active: emoji };
}

export async function addCommentAction(
  postId: string,
  body: string,
  parentId?: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  const trimmed = body.trim();
  if (trimmed.length < MIN_BODY) return { success: false, error: "Comment is too short." };
  if (trimmed.length > COMMENT_MAX_BODY) {
    return { success: false, error: "Comment is too long (max 2000 chars)." };
  }

  const post = await db.query.communityPost.findFirst({
    where: eq(communityPost.id, postId),
    columns: { id: true },
  });
  if (!post) return { success: false, error: "Post not found." };

  if (parentId) {
    const parent = await db.query.communityComment.findFirst({
      where: and(eq(communityComment.id, parentId), eq(communityComment.postId, postId)),
      columns: { id: true },
    });
    if (!parent) return { success: false, error: "Parent comment not found." };
  }

  await db.insert(communityComment).values({
    id: crypto.randomUUID(),
    postId,
    userId: user.id,
    body: trimmed,
    parentId: parentId ?? null,
  });

  revalidatePath("/community");
  revalidatePath(`/community/${postId}`);
  return { success: true };
}

export async function deleteCommentAction(
  commentId: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();

  const comment = await db.query.communityComment.findFirst({
    where: eq(communityComment.id, commentId),
  });
  if (!comment) return { success: false, error: "Comment not found." };
  if (comment.userId !== user.id) return { success: false, error: "Not your comment." };

  await db
    .delete(communityComment)
    .where(and(eq(communityComment.id, commentId), eq(communityComment.userId, user.id)));

  revalidatePath("/community");
  revalidatePath(`/community/${comment.postId}`);
  return { success: true };
}

export async function createPollAction(
  postId: string,
  question: string,
  options: string[],
  endsAt?: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  const cleanQuestion = question.trim();
  const cleanOptions = options.map((option) => option.trim()).filter(Boolean).slice(0, 6);

  if (cleanQuestion.length < 4) return { success: false, error: "Question is too short." };
  if (cleanOptions.length < 2) return { success: false, error: "At least 2 options are required." };

  const post = await db.query.communityPost.findFirst({
    where: eq(communityPost.id, postId),
    columns: { id: true, userId: true },
  });
  if (!post) return { success: false, error: "Post not found." };
  if (post.userId !== user.id) return { success: false, error: "Only the post owner can create a poll." };

  const existing = await db.query.communityPoll.findFirst({
    where: eq(communityPoll.postId, postId),
    columns: { id: true },
  });
  if (existing) return { success: false, error: "Poll already exists for this post." };

  await db.transaction(async (tx) => {
    const pollId = crypto.randomUUID();
    await tx.insert(communityPoll).values({
      id: pollId,
      postId,
      question: cleanQuestion,
      endsAt: endsAt ? new Date(endsAt) : null,
    });

    await tx.insert(communityPollOption).values(
      cleanOptions.map((option, index) => ({
        id: crypto.randomUUID(),
        pollId,
        label: option,
        order: index,
      })),
    );

    await tx.update(communityPost).set({ isPoll: true }).where(eq(communityPost.id, postId));
  });

  revalidatePath("/community");
  revalidatePath(`/community/${postId}`);
  return { success: true };
}

export async function votePollAction(
  pollId: string,
  optionId: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();

  const option = await db.query.communityPollOption.findFirst({
    where: and(eq(communityPollOption.id, optionId), eq(communityPollOption.pollId, pollId)),
    columns: { id: true },
  });
  if (!option) return { success: false, error: "Poll option not found." };

  const existingVote = await db.query.communityPollVote.findFirst({
    where: and(eq(communityPollVote.pollId, pollId), eq(communityPollVote.userId, user.id)),
    columns: { id: true },
  });

  if (existingVote) {
    await db
      .update(communityPollVote)
      .set({ optionId })
      .where(eq(communityPollVote.id, existingVote.id));
  } else {
    await db.insert(communityPollVote).values({
      id: crypto.randomUUID(),
      pollId,
      optionId,
      userId: user.id,
    });
  }

  const poll = await db.query.communityPoll.findFirst({
    where: eq(communityPoll.id, pollId),
    columns: { postId: true },
  });

  revalidatePath("/community");
  if (poll?.postId) revalidatePath(`/community/${poll.postId}`);
  return { success: true };
}

export async function followUserAction(
  targetUserId: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  if (targetUserId === user.id) return { success: false, error: "You cannot follow yourself." };

  const existing = await db.query.userFollow.findFirst({
    where: and(eq(userFollow.followerId, user.id), eq(userFollow.followingId, targetUserId)),
    columns: { id: true },
  });
  if (existing) return { success: true };

  await db.insert(userFollow).values({
    id: crypto.randomUUID(),
    followerId: user.id,
    followingId: targetUserId,
  });

  revalidatePath("/community");
  return { success: true };
}

export async function unfollowUserAction(
  targetUserId: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  await db
    .delete(userFollow)
    .where(and(eq(userFollow.followerId, user.id), eq(userFollow.followingId, targetUserId)));

  revalidatePath("/community");
  return { success: true };
}

export async function pinPostAction(
  postId: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase());
  if (!adminEmails.includes(user.email.toLowerCase())) {
    return { success: false, error: "Unauthorized." };
  }

  await db
    .update(communityPost)
    .set({ pinnedAt: new Date() })
    .where(eq(communityPost.id, postId));

  revalidatePath("/community");
  revalidatePath(`/community/${postId}`);
  return { success: true };
}

export async function adminDeletePostAction(
  postId: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase());
  if (!adminEmails.includes(user.email.toLowerCase())) {
    return { success: false, error: "Unauthorized." };
  }

  await db.delete(communityPost).where(eq(communityPost.id, postId));
  revalidatePath("/community");
  revalidatePath(`/community/${postId}`);
  return { success: true };
}
