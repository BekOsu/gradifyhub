import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { getAllPosts } from "~/lib/blog";
import { db } from "@repo/db/client";
import { blogComment } from "@repo/db/schema";
import { count } from "@repo/db/drizzle";

export const metadata: Metadata = {
  title: "Blog — GradifyHub",
  description:
    "Insights on AI engineering, job search strategy, resume writing, and career growth for developers.",
};

export const dynamic = "force-dynamic";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

async function getCommentCounts(): Promise<Record<string, number>> {
  const rows = await db
    .select({ slug: blogComment.slug, count: count() })
    .from(blogComment)
    .groupBy(blogComment.slug);
  return Object.fromEntries(rows.map((r) => [r.slug, r.count]));
}

export default async function BlogPage() {
  const [posts, commentCounts] = await Promise.all([
    getAllPosts(),
    getCommentCounts(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">

      {/* Page header */}
      <div className="mb-12 border-b pb-10">
        <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Practical guides on AI engineering, job search strategy, and getting hired.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No posts yet — check back soon.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2">
          {posts.map((post, i) => {
            const commentCount = commentCounts[post.slug] ?? 0;
            const isFeatured = i === 0;

            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className={`group flex flex-col gap-3 rounded-xl border bg-card p-6 transition-all hover:border-foreground/20 hover:shadow-sm ${
                  isFeatured ? "sm:col-span-2" : ""
                }`}
              >
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title + description */}
                <div>
                  <h2
                    className={`font-semibold tracking-tight leading-snug group-hover:text-foreground/80 transition-colors ${
                      isFeatured ? "text-xl" : "text-base"
                    }`}
                  >
                    {post.title}
                  </h2>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {post.description}
                  </p>
                </div>

                {/* Meta row */}
                <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground pt-1">
                  <span>{formatDate(post.date)}</span>
                  <span>·</span>
                  <span>{post.readingTime}</span>
                  {commentCount > 0 && (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {commentCount}
                      </span>
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
