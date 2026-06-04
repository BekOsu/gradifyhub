import { db } from "@repo/db/client";
import {
  communityComment,
  communityPost,
  communityReaction,
  communityPoll,
  communityPollVote,
  profile,
  user,
  userFollow,
} from "@repo/db/schema";
import { desc, eq, and, count, inArray } from "@repo/db/drizzle";

// ── Types ───────────────────────────────────────────────────────────────────

export interface PostUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export interface PostWithUser {
  id: string;
  title: string | null;
  body: string;
  category: string;
  mediaUrl: string | null;
  tags: unknown;
  isPoll: boolean;
  pinnedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: PostUser;
  reactionCounts: { emoji: string; count: number }[];
  commentCount: number;
  myReaction?: string | null;
}

export interface CommentWithUser {
  id: string;
  postId: string;
  userId: string;
  body: string;
  parentId: string | null;
  createdAt: Date;
  user: PostUser;
  replies?: CommentWithUser[];
}

export interface PollResult {
  id: string;
  question: string;
  endsAt: Date | null;
  options: { id: string; label: string; order: number; votes: number }[];
  totalVotes: number;
  myVoteOptionId: string | null;
}

// ── Feed ─────────────────────────────────────────────────────────────────────

export async function getFeed(
  limit = 50,
  currentUserId?: string,
): Promise<PostWithUser[]> {
  const posts = await db.query.communityPost.findMany({
    orderBy: [desc(communityPost.pinnedAt), desc(communityPost.createdAt)],
    with: { user: true },
    limit,
  });

  return enrichPosts(posts as unknown as PostWithUser[], currentUserId);
}

export async function getFollowingFeed(
  userId: string,
  limit = 50,
): Promise<PostWithUser[]> {
  // Get IDs of users this person follows
  const follows = await db.query.userFollow.findMany({
    where: eq(userFollow.followerId, userId),
    columns: { followingId: true },
  });
  const followingIds = follows.map((f) => f.followingId);

  if (followingIds.length === 0) return [];

  const posts = await db.query.communityPost.findMany({
    where: inArray(communityPost.userId, followingIds),
    orderBy: [desc(communityPost.createdAt)],
    with: { user: true },
    limit,
  });

  return enrichPosts(posts as unknown as PostWithUser[], userId);
}

export async function getTrendingFeed(
  limit = 50,
  currentUserId?: string,
): Promise<PostWithUser[]> {
  const candidates = await getFeed(Math.max(limit * 2, 80), currentUserId);
  return candidates
    .map((post) => ({
      post,
      score:
        post.commentCount +
        post.reactionCounts.reduce((sum, r) => sum + r.count, 0) * 2,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post);
}

export async function getPostById(
  postId: string,
  currentUserId?: string,
): Promise<PostWithUser | null> {
  const post = await db.query.communityPost.findFirst({
    where: eq(communityPost.id, postId),
    with: { user: true },
  });
  if (!post) return null;
  const [enriched] = await enrichPosts([post as unknown as PostWithUser], currentUserId);
  return enriched ?? null;
}

// ── Comments ──────────────────────────────────────────────────────────────────

export async function getPostComments(postId: string): Promise<CommentWithUser[]> {
  const rows = await db.query.communityComment.findMany({
    where: eq(communityComment.postId, postId),
    orderBy: [desc(communityComment.createdAt)],
    with: { user: true },
    limit: 500,
  });

  // Build nested tree
  const map = new Map<string, CommentWithUser>();
  const roots: CommentWithUser[] = [];

  for (const row of rows as CommentWithUser[]) {
    map.set(row.id, { ...row, replies: [] });
  }
  for (const row of map.values()) {
    if (row.parentId && map.has(row.parentId)) {
      map.get(row.parentId)!.replies!.push(row);
    } else {
      roots.push(row);
    }
  }

  return roots;
}

// ── Poll ──────────────────────────────────────────────────────────────────────

export async function getPollResult(
  postId: string,
  userId?: string,
): Promise<PollResult | null> {
  const poll = await db.query.communityPoll.findFirst({
    where: eq(communityPoll.postId, postId),
    with: { options: { orderBy: (o, { asc }) => [asc(o.order)], with: { votes: true } } },
  });
  if (!poll) return null;

  const totalVotes = poll.options.reduce((n, o) => n + o.votes.length, 0);
  const myVoteOptionId = userId
    ? (
        await db.query.communityPollVote.findFirst({
          where: and(
            eq(communityPollVote.pollId, poll.id),
            eq(communityPollVote.userId, userId),
          ),
          columns: { optionId: true },
        })
      )?.optionId ?? null
    : null;

  return {
    id: poll.id,
    question: poll.question,
    endsAt: poll.endsAt,
    options: poll.options.map((o) => ({
      id: o.id,
      label: o.label,
      order: o.order,
      votes: o.votes.length,
    })),
    totalVotes,
    myVoteOptionId,
  };
}

// ── Trending topics ───────────────────────────────────────────────────────────

export async function getTrendingTopics(limit = 10): Promise<{ tag: string; count: number }[]> {
  const recent = await db.query.communityPost.findMany({
    columns: { tags: true },
    orderBy: [desc(communityPost.createdAt)],
    limit: 200,
  });

  const freq = new Map<string, number>();
  for (const post of recent) {
    const tags = Array.isArray(post.tags) ? (post.tags as string[]) : [];
    for (const tag of tags) {
      freq.set(tag, (freq.get(tag) ?? 0) + 1);
    }
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}

// ── Follow helpers ────────────────────────────────────────────────────────────

export async function isFollowing(
  followerId: string,
  followingId: string,
): Promise<boolean> {
  const row = await db.query.userFollow.findFirst({
    where: and(
      eq(userFollow.followerId, followerId),
      eq(userFollow.followingId, followingId),
    ),
    columns: { id: true },
  });
  return !!row;
}

export async function getFollowCounts(userId: string) {
  const [followersResult, followingResult] = await Promise.all([
    db.select({ count: count() }).from(userFollow).where(eq(userFollow.followingId, userId)),
    db.select({ count: count() }).from(userFollow).where(eq(userFollow.followerId, userId)),
  ]);
  return {
    followers: followersResult[0]?.count ?? 0,
    following: followingResult[0]?.count ?? 0,
  };
}

export async function getFollowingIds(userId: string): Promise<string[]> {
  const rows = await db.query.userFollow.findMany({
    where: eq(userFollow.followerId, userId),
    columns: { followingId: true },
  });
  return rows.map((r) => r.followingId);
}

export async function getPostsByUser(
  userId: string,
  limit = 30,
  currentUserId?: string,
): Promise<PostWithUser[]> {
  const posts = await db.query.communityPost.findMany({
    where: eq(communityPost.userId, userId),
    orderBy: [desc(communityPost.createdAt)],
    with: { user: true },
    limit,
  });
  return enrichPosts(posts as unknown as PostWithUser[], currentUserId);
}

export async function getUserSummary(userId: string) {
  const [baseUser, userProfile, followCounts] = await Promise.all([
    db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: { id: true, name: true, email: true, image: true, createdAt: true },
    }),
    db.query.profile.findFirst({
      where: eq(profile.userId, userId),
      columns: { currentRole: true, goal: true },
    }),
    getFollowCounts(userId),
  ]);

  if (!baseUser) return null;
  return {
    ...baseUser,
    currentRole: userProfile?.currentRole ?? null,
    goal: userProfile?.goal ?? null,
    followers: followCounts.followers,
    following: followCounts.following,
  };
}

// ── Internal enrichment ───────────────────────────────────────────────────────

async function enrichPosts(
  posts: PostWithUser[],
  currentUserId?: string,
): Promise<PostWithUser[]> {
  if (posts.length === 0) return [];

  const postIds = posts.map((p) => p.id);

  // Reaction counts per post
  const reactions = await db
    .select({
      postId: communityReaction.postId,
      emoji: communityReaction.emoji,
      cnt: count(),
    })
    .from(communityReaction)
    .where(inArray(communityReaction.postId, postIds))
    .groupBy(communityReaction.postId, communityReaction.emoji);

  // Comment counts per post
  const comments = await db
    .select({ postId: communityComment.postId, cnt: count() })
    .from(communityComment)
    .where(inArray(communityComment.postId, postIds))
    .groupBy(communityComment.postId);

  // My reactions
  const myReactions =
    currentUserId
      ? await db.query.communityReaction.findMany({
          where: and(
            eq(communityReaction.userId, currentUserId),
            inArray(communityReaction.postId, postIds),
          ),
          columns: { postId: true, emoji: true },
        })
      : [];

  const reactionMap = new Map<string, { emoji: string; count: number }[]>();
  for (const r of reactions) {
    const arr = reactionMap.get(r.postId) ?? [];
    arr.push({ emoji: r.emoji, count: r.cnt });
    reactionMap.set(r.postId, arr);
  }

  const commentMap = new Map<string, number>();
  for (const c of comments) commentMap.set(c.postId, c.cnt);

  const myReactionMap = new Map<string, string>();
  for (const r of myReactions) myReactionMap.set(r.postId, r.emoji);

  return posts.map((p) => ({
    ...p,
    reactionCounts: reactionMap.get(p.id) ?? [],
    commentCount: commentMap.get(p.id) ?? 0,
    myReaction: myReactionMap.get(p.id) ?? null,
  }));
}
