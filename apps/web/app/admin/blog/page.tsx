import { db } from "@repo/db/client";
import { blogComment, user } from "@repo/db/schema";
import { eq, desc } from "@repo/db/drizzle";
import { AdminBlogComments } from "~/components/admin/blog-comments";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const comments = await db
    .select({
      id: blogComment.id,
      slug: blogComment.slug,
      body: blogComment.body,
      createdAt: blogComment.createdAt,
      userName: user.name,
      userEmail: user.email,
    })
    .from(blogComment)
    .leftJoin(user, eq(user.id, blogComment.userId))
    .orderBy(desc(blogComment.createdAt))
    .limit(500);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Blog comments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {comments.length} total · delete any that violate community standards
        </p>
      </div>
      <AdminBlogComments comments={comments} />
    </div>
  );
}
