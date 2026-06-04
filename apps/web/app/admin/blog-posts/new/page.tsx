import Link from "next/link";
import { BlogPostForm } from "~/components/admin/blog-post-form";

export default function NewBlogPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/blog-posts" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to posts
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Create a new post</h1>
      </div>
      <BlogPostForm mode="create" />
    </div>
  );
}
