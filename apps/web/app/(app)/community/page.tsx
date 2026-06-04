import type { Metadata } from "next";
import Link from "next/link";
import { Users, TrendingUp, Sparkles } from "lucide-react";
import { getCurrentUser } from "~/lib/auth/session";
import { getFeed, getTrendingFeed, getTrendingTopics, getFollowingIds } from "~/lib/community";
import { PostForm } from "~/components/community/post-form";
import { PostCard } from "~/components/community/post-card";

export const metadata: Metadata = {
  title: "Community — GradifyHub",
  description: "Share wins, ask questions, and learn alongside other developers.",
};

export const dynamic = "force-dynamic";

function getInitials(name: string | null, email: string): string {
  if (name) return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return email[0]?.toUpperCase() ?? "?";
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const [user, { tab }] = await Promise.all([getCurrentUser(), searchParams]);
  const activeTab = tab === "trending" ? "trending" : "all";

  const [posts, trending, followingIds] = await Promise.all([
    activeTab === "trending" ? getTrendingFeed(60, user?.id) : getFeed(60, user?.id),
    getTrendingTopics(8),
    user ? getFollowingIds(user.id) : Promise.resolve([]),
  ]);

  const userInitials = user ? getInitials(user.name ?? null, user.email) : "";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-green" />
            <h1 className="text-xl font-bold tracking-tight">Community</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Share wins, ask questions, and connect with other developers.
          </p>
        </div>
        <Link
          href="/community/inspire"
          className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-600 ring-1 ring-amber-200 hover:bg-amber-100"
        >
          <Sparkles className="h-3.5 w-3.5" /> Inspire
        </Link>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 rounded-xl border p-1 bg-muted/30">
        {(["all", "trending"] as const).map((t) => (
          <Link
            key={t}
            href={t === "all" ? "/community" : `/community?tab=${t}`}
            className={`flex-1 rounded-lg px-4 py-2 text-center text-sm font-medium transition-all ${
              activeTab === t
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "all" ? "All Posts" : "Trending"}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
        <div className="space-y-4 min-w-0">
          {/* Post form */}
          {user ? (
            <PostForm userInitials={userInitials} />
          ) : (
            <div className="rounded-xl border bg-muted/20 px-6 py-5 text-center">
              <p className="text-sm text-muted-foreground">
                <a
                  href="/sign-in?next=/community"
                  className="font-semibold text-brand-green hover:underline underline-offset-4"
                >
                  Sign in
                </a>{" "}
                to post in the community.
              </p>
            </div>
          )}

          {/* Feed */}
          {posts.length === 0 ? (
            <div className="rounded-xl border bg-muted/20 px-6 py-12 text-center">
              <p className="text-2xl">👋</p>
              <p className="mt-2 text-sm font-medium">No posts yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">Be the first to share a win or ask a question.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id}
                  isFollowingAuthor={followingIds.includes(post.userId)}
                  userInitials={userInitials}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block space-y-4">
          {trending.length > 0 && (
            <div className="rounded-xl border p-4">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-green" />
                <h2 className="text-sm font-semibold">Trending Topics</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {trending.map(({ tag, count }) => (
                  <Link
                    key={tag}
                    href={`/community/topics/${tag}`}
                    className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/80"
                  >
                    #{tag}
                    <span className="ml-1 tabular-nums text-[10px] opacity-60">{count}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-gradient-to-br from-brand-green/5 to-background p-4">
            <p className="text-xs font-semibold">🌟 Inspire section</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Daily inspiration, coding challenges, and project ideas.
            </p>
            <Link
              href="/community/inspire"
              className="mt-3 inline-flex rounded-full bg-brand-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-green/90"
            >
              Explore
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
