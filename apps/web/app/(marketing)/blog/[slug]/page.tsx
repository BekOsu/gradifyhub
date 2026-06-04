import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { getAllPosts, getPost } from "~/lib/blog";
import { getComments, getBlogEngagement } from "~/lib/blog-comments";
import { getCurrentUser } from "~/lib/auth/session";
import { MdxProse } from "~/components/ui/mdx-prose";
import { HeroCta } from "~/components/marketing/hero-cta";
import { CommentSection } from "~/components/blog/comment-section";
import { ReactionBar } from "~/components/blog/reaction-bar";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: `${post.frontmatter.title} — GradifyHub Blog`,
    description: post.frontmatter.description,
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, comments, user] = await Promise.all([
    getPost(slug),
    getComments(slug),
    getCurrentUser(),
  ]);
  if (!post) notFound();

  const engagement = await getBlogEngagement(slug, user?.id);

  const { content, frontmatter } = post;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-10 flex items-center justify-between">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All posts
        </Link>
        {comments.length > 0 && (
          <a
            href="#comments"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {comments.length} comment{comments.length === 1 ? "" : "s"}
          </a>
        )}
      </div>

      <header className="mb-10">
        <div className="mb-4 flex flex-wrap gap-2">
          {frontmatter.tags.map((tag: string) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {frontmatter.title}
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          {frontmatter.description}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          {formatDate(frontmatter.date)} · {frontmatter.readingTime} ·{" "}
          {frontmatter.author}
        </p>
      </header>

      <MdxProse>{content}</MdxProse>

      {/* Reaction / engagement bar */}
      <div className="mt-10 rounded-xl border p-4">
        <ReactionBar
          slug={slug}
          initialLikeCount={engagement.likeCount}
          initialLiked={engagement.liked}
          initialBookmarked={engagement.bookmarked}
          initialReactions={engagement.reactions}
          initialMyReaction={engagement.myReaction}
          isLoggedIn={!!user}
        />
      </div>

      <div className="mt-16 rounded-xl border bg-gradient-to-br from-brand-green/5 to-background p-8 text-center">
        <p className="text-sm font-semibold">Ready to put this into practice?</p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Take a free assessment, get a personalised roadmap, and build the
          skills that get you hired.
        </p>
        <div className="mt-6">
          <HeroCta label="Start free assessment" initialIsLoggedIn={!!user} />
        </div>
      </div>

      <div id="comments">
        <Suspense
          fallback={
            <div className="mt-16 border-t pt-10">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            </div>
          }
        >
          <CommentSection slug={slug} />
        </Suspense>
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/blog"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to all posts
        </Link>
      </div>
    </div>
  );
}
