import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost } from "@repo/db/queries/blog-posts";
import { BlogPostForm } from "~/components/admin/blog-post-form";

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = await params;
  const post = await getBlogPost(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/blog-posts" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to posts
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Edit: {post.title}</h1>
      </div>
      <BlogPostForm
        mode="edit"
        initial={{
          id: post.id,
          slug: post.slug,
          title: post.title,
          description: post.description,
          author: post.author,
          content: post.content,
          tags: post.tags,
        }}
      />
    </div>
  );
}
