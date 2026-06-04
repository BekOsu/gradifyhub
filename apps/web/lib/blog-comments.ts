import { db } from "@repo/db/client";
import { blogComment, blogLike, blogReaction, blogBookmark } from "@repo/db/schema";
import { eq, desc, and, count } from "@repo/db/drizzle";

export interface CommentWithUser {
  id: string;
  slug: string;
  userId: string;
  body: string;
  parentId: string | null;
  createdAt: Date;
  user: { id: string; name: string | null; email: string; image: string | null };
  replies?: CommentWithUser[];
}

export interface BlogEngagement {
  likeCount: number;
  liked: boolean;
  bookmarked: boolean;
  reactions: { emoji: string; count: number }[];
  myReaction: string | null;
}

export async function getComments(slug: string): Promise<CommentWithUser[]> {
  const rows = await db.query.blogComment.findMany({
    where: eq(blogComment.slug, slug),
    orderBy: [desc(blogComment.createdAt)],
    with: { user: true },
    limit: 500,
  });

  // Build nested tree: top-level first, replies nested
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

export async function getBlogEngagement(
  slug: string,
  userId?: string,
): Promise<BlogEngagement> {
  const [likesResult, reactionsResult, userLike, userReaction, userBookmark] =
    await Promise.all([
      db.select({ count: count() }).from(blogLike).where(eq(blogLike.slug, slug)),
      db.select({ emoji: blogReaction.emoji, count: count() })
        .from(blogReaction)
        .where(eq(blogReaction.slug, slug))
        .groupBy(blogReaction.emoji),
      userId
        ? db.query.blogLike.findFirst({
            where: and(eq(blogLike.slug, slug), eq(blogLike.userId, userId)),
            columns: { id: true },
          })
        : Promise.resolve(null),
      userId
        ? db.query.blogReaction.findFirst({
            where: and(eq(blogReaction.slug, slug), eq(blogReaction.userId, userId)),
            columns: { emoji: true },
          })
        : Promise.resolve(null),
      userId
        ? db.query.blogBookmark.findFirst({
            where: and(eq(blogBookmark.slug, slug), eq(blogBookmark.userId, userId)),
            columns: { id: true },
          })
        : Promise.resolve(null),
    ]);

  return {
    likeCount: likesResult[0]?.count ?? 0,
    liked: !!userLike,
    bookmarked: !!userBookmark,
    reactions: reactionsResult.map((r) => ({ emoji: r.emoji, count: r.count })),
    myReaction: userReaction?.emoji ?? null,
  };
}
