import { eq, asc, desc } from "drizzle-orm";
import { db } from "../client";
import { blogPost } from "../schema";

export type BlogPost = typeof blogPost.$inferSelect;

export async function getPublishedPosts() {
  return db.query.blogPost.findMany({
    where: eq(blogPost.isPublished, true),
    orderBy: (b, { desc }) => [desc(b.createdAt)],
  });
}

export async function getAllBlogPosts() {
  return db.query.blogPost.findMany({
    orderBy: (b, { desc }) => [desc(b.createdAt)],
  });
}

export async function getBlogPost(slug: string) {
  return db.query.blogPost.findFirst({
    where: eq(blogPost.slug, slug),
  });
}

export async function createBlogPost(data: {
  slug: string;
  title: string;
  description: string;
  author: string;
  content: string;
  tags: string[];
  readingTime: number;
  isPublished?: boolean;
}) {
  const id = crypto.randomUUID();
  await db.insert(blogPost).values({
    id,
    slug: data.slug,
    title: data.title,
    description: data.description,
    author: data.author,
    content: data.content,
    tags: data.tags,
    readingTime: data.readingTime,
    isPublished: data.isPublished ?? false,
    publishedAt: data.isPublished ? new Date() : null,
    updatedAt: new Date(),
  });
  return id;
}

export async function updateBlogPost(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    author: string;
    content: string;
    tags: string[];
    readingTime: number;
    isPublished: boolean;
    publishedAt: Date | null;
  }>,
) {
  await db
    .update(blogPost)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(blogPost.id, id));
}

export async function deleteBlogPost(id: string) {
  await db.delete(blogPost).where(eq(blogPost.id, id));
}
