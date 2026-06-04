import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "~/lib/auth/session";
import { getPostById, getPostComments, getPollResult, getFollowingIds } from "~/lib/community";
import { PostCard } from "~/components/community/post-card";
import { PollCard } from "~/components/community/poll-card";
import { CommunityCommentThread } from "~/components/community/comment-thread";

export const dynamic = "force-dynamic";

function getInitials(name: string | null, email: string): string {
  if (name) return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return email[0]?.toUpperCase() ?? "?";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ postId: string }>;
}): Promise<Metadata> {
  const { postId } = await params;
  const post = await getPostById(postId);
  if (!post) return {};
  return {
    title: `${post.user.name ?? "Community"}: ${post.body.slice(0, 60)}… — GradifyHub`,
  };
}

export default async function CommunityPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const user = await getCurrentUser();
  const post = await getPostById(postId, user?.id);

  if (!post) notFound();

  const [comments, poll, followingIds] = await Promise.all([
    getPostComments(postId),
    post.isPoll ? getPollResult(postId, user?.id) : Promise.resolve(null),
    user ? getFollowingIds(user.id) : Promise.resolve([]),
  ]);

  const userInitials = user ? getInitials(user.name ?? null, user.email) : "";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/community"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Community
        </Link>
      </div>

      <PostCard
        post={post}
        currentUserId={user?.id}
        isFollowingAuthor={followingIds.includes(post.userId)}
        userInitials={userInitials}
        showComments
        pollCard={
          poll ? (
            <PollCard poll={poll} postId={postId} isLoggedIn={!!user} />
          ) : undefined
        }
      />

      {/* Full comment thread */}
      <section className="rounded-xl border p-4">
        <h2 className="mb-4 text-sm font-semibold">
          {comments.length > 0
            ? `${comments.length} comment${comments.length !== 1 ? "s" : ""}`
            : "Comments"}
        </h2>
        <CommunityCommentThread
          comments={comments}
          postId={postId}
          currentUserId={user?.id}
          userInitials={userInitials}
          showInput
        />
        {!user && (
          <p className="mt-4 text-sm text-muted-foreground">
            <a
              href={`/sign-in?next=/community/${postId}`}
              className="font-semibold text-brand-green hover:underline"
            >
              Sign in
            </a>{" "}
            to join the conversation.
          </p>
        )}
      </section>
    </div>
  );
}

