import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "~/lib/auth/session";
import { getPostsByUser, getUserSummary, isFollowing } from "~/lib/community";
import { FollowButton } from "~/components/community/follow-button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  const summary = await getUserSummary(userId);
  if (!summary) return {};
  return {
    title: `${summary.name ?? summary.email.split("@")[0]} — Community Profile`,
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const viewer = await getCurrentUser();

  const [summary, posts, viewerFollows] = await Promise.all([
    getUserSummary(userId),
    getPostsByUser(userId, 30, viewer?.id),
    viewer && viewer.id !== userId ? isFollowing(viewer.id, userId) : Promise.resolve(false),
  ]);

  if (!summary) notFound();

  const displayName = summary.name ?? summary.email.split("@")[0];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/community" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to Community
      </Link>

      <section className="rounded-xl border p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">{displayName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{summary.email}</p>
            {summary.currentRole && (
              <p className="mt-2 text-sm text-muted-foreground">Current role: {summary.currentRole}</p>
            )}
            {summary.goal && (
              <p className="text-sm text-muted-foreground">Target track: {summary.goal}</p>
            )}
          </div>
          {viewer && viewer.id !== userId && (
            <FollowButton targetUserId={userId} initialFollowing={viewerFollows} />
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-xs">
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Followers</p>
            <p className="text-lg font-semibold tabular-nums">{summary.followers}</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Following</p>
            <p className="text-lg font-semibold tabular-nums">{summary.following}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border p-6">
        <h2 className="mb-4 text-sm font-semibold">Recent posts</h2>
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No posts yet.</p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/community/${post.id}`}
                className="block rounded-lg border p-3 transition-colors hover:bg-muted/30"
              >
                <p className="text-sm font-medium line-clamp-1">{post.title ?? post.body}</p>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{post.body}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

