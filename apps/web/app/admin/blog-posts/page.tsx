import Link from "next/link";
import { getAllBlogPosts } from "@repo/db/queries/blog-posts";
import { BlogPostPublishToggle } from "~/components/admin/blog-post-publish-toggle";
import { BlogPostDeleteButton } from "~/components/admin/blog-post-delete-button";

export default async function AdminBlogPostsPage() {
  const posts = await getAllBlogPosts();
  const publishedCount = posts.filter((p) => p.isPublished).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog Posts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Draft posts are hidden from the public /blog page until published.
          </p>
        </div>
        <Link
          href="/admin/blog-posts/new"
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
        >
          + New post
        </Link>
      </div>

      <div className="rounded-xl border">
        <div className="border-b bg-muted/30 px-5 py-3">
          <p className="text-sm font-semibold">
            {publishedCount} of {posts.length} posts published
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            No posts yet.{" "}
            <Link href="/admin/blog-posts/new" className="underline hover:text-foreground">
              Create the first one
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-semibold truncate ${post.isPublished ? "text-foreground" : "text-muted-foreground"}`}>
                      {post.title}
                    </p>
                    {post.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 2 && (
                          <span className="text-xs text-muted-foreground">+{post.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">{post.description}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground/60 font-mono">
                    {post.slug} · {post.createdAt.toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <BlogPostPublishToggle postId={post.id} isPublished={post.isPublished} />
                  <Link
                    href={`/admin/blog-posts/${post.id}/edit`}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                  >
                    Edit
                  </Link>
                  <BlogPostDeleteButton postId={post.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
