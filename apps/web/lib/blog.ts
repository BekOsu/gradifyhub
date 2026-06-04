import { compileMDX } from "next-mdx-remote/rsc";
import { getPublishedPosts, getBlogPost } from "@repo/db/queries/blog-posts";

export interface PostFrontmatter {
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
}

export interface PostMeta extends PostFrontmatter {
  slug: string;
  readingTime: string;
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    title: post.title,
    description: post.description,
    date: post.createdAt.toISOString().split("T")[0] ?? "",
    author: post.author,
    tags: post.tags,
    slug: post.slug,
    readingTime: `${post.readingTime} min read`,
  }));
}

export async function getPost(slug: string) {
  const post = await getBlogPost(slug);
  if (!post) return null;

  const { content } = await compileMDX({
    source: post.content,
    options: { parseFrontmatter: false },
  });

  return {
    content,
    frontmatter: {
      title: post.title,
      description: post.description,
      date: post.createdAt.toISOString().split("T")[0] ?? "",
      author: post.author,
      tags: post.tags,
      slug: post.slug,
      readingTime: `${post.readingTime} min read`,
    } as PostMeta,
  };
}
