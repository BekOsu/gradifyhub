"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminCreateBlogPost, adminUpdateBlogPost } from "~/actions/admin";

interface BlogPostFormProps {
  mode: "create" | "edit";
  initial?: {
    id: string;
    slug: string;
    title: string;
    description: string;
    author: string;
    content: string;
    tags: string[];
  };
}

export function BlogPostForm({ mode, initial }: BlogPostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [author, setAuthor] = useState(initial?.author ?? "GradifyHub");
  const [content, setContent] = useState(initial?.content ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const tagsArray = tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    startTransition(async () => {
      let result: { success: boolean; error?: string };

      if (mode === "create") {
        result = await adminCreateBlogPost({
          slug: slug.trim(),
          title: title.trim(),
          description: description.trim(),
          author: author.trim(),
          content,
          tags: tagsArray,
        });
      } else {
        result = await adminUpdateBlogPost(initial!.id, {
          title: title.trim(),
          description: description.trim(),
          author: author.trim(),
          content,
          tags: tagsArray,
        });
      }

      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
      } else {
        router.push("/admin/blog-posts");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Slug — readonly on edit */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Slug</label>
        {mode === "create" ? (
          <input
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            placeholder="e.g. how-to-get-hired-in-2025"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        ) : (
          <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground font-mono">
            {slug}
          </div>
        )}
        <p className="text-xs text-muted-foreground">URL-safe slug. Cannot be changed after creation.</p>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. How to Get Hired as an AI Engineer in 2025"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Description</label>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="One-line summary shown in the blog list"
          rows={2}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Author */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Author</label>
        <input
          required
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="e.g. GradifyHub"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Tags</label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="hiring, ai-engineering, career"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground">Comma-separated list.</p>
      </div>

      {/* Content (MDX) */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Content (MDX)</label>
        <textarea
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your blog post in markdown..."
          rows={15}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground">Markdown + JSX supported. No frontmatter needed.</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-foreground px-5 py-2 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Saving…" : mode === "create" ? "Create post" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/blog-posts")}
          className="rounded-lg border px-5 py-2 text-sm font-semibold hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
