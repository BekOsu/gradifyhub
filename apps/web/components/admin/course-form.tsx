"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminCreateCourse, adminUpdateCourse } from "~/actions/admin";

const LEVEL_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

const CATEGORY_OPTIONS = [
  { value: "AI/ML", label: "AI/ML" },
  { value: "Web Dev", label: "Web Dev" },
  { value: "Backend", label: "Backend" },
  { value: "DevOps", label: "DevOps" },
  { value: "Data", label: "Data" },
  { value: "CS Fundamentals", label: "CS Fundamentals" },
] as const;

interface CourseFormProps {
  mode: "create" | "edit";
  initial?: {
    id: string;
    slug: string;
    title: string;
    description: string;
    provider: string;
    imageUrl: string | null;
    courseUrl: string;
    level: string;
    category: string;
    tags: string[];
    durationHours: number | null;
    studentCount: number | null;
    rating: number | null;
    isFree: boolean;
    order: number;
  };
}

export function CourseForm({ mode, initial }: CourseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [provider, setProvider] = useState(initial?.provider ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [courseUrl, setCourseUrl] = useState(initial?.courseUrl ?? "");
  const [level, setLevel] = useState(initial?.level ?? "beginner");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [durationHours, setDurationHours] = useState(initial?.durationHours?.toString() ?? "");
  const [studentCount, setStudentCount] = useState(initial?.studentCount?.toString() ?? "");
  const [rating, setRating] = useState(initial?.rating?.toString() ?? "");
  const [isFree, setIsFree] = useState(initial?.isFree ?? true);
  const [order, setOrder] = useState(initial?.order ?? 0);

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
        result = await adminCreateCourse({
          slug: slug.trim(),
          title: title.trim(),
          description: description.trim(),
          provider: provider.trim(),
          imageUrl: imageUrl.trim() || undefined,
          courseUrl: courseUrl.trim(),
          level,
          category,
          tags: tagsArray,
          durationHours: durationHours ? Number(durationHours) : undefined,
          studentCount: studentCount ? Number(studentCount) : undefined,
          rating: rating ? Number(rating) : undefined,
          isFree,
          order,
        });
      } else {
        result = await adminUpdateCourse(initial!.id, {
          title: title.trim(),
          description: description.trim(),
          provider: provider.trim(),
          imageUrl: imageUrl.trim() || null,
          courseUrl: courseUrl.trim(),
          level,
          category,
          tags: tagsArray,
          durationHours: durationHours ? Number(durationHours) : null,
          studentCount: studentCount ? Number(studentCount) : null,
          rating: rating ? Number(rating) : null,
          isFree,
          order,
        });
      }

      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
      } else {
        router.push("/admin/courses");
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
            placeholder="e.g. cs50-introduction"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        ) : (
          <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground font-mono">
            {slug}
          </div>
        )}
        <p className="text-xs text-muted-foreground">Lowercase alphanumeric and hyphens only. Cannot be changed after creation.</p>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. CS50's Introduction to Computer Science"
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
          placeholder="Brief description of the course"
          rows={3}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Provider */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Provider</label>
        <input
          required
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          placeholder="e.g. Harvard/edX, freeCodeCamp"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Course URL */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Course URL</label>
        <input
          required
          type="url"
          value={courseUrl}
          onChange={(e) => setCourseUrl(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Level + Category */}
      <div className="flex gap-4">
        <div className="flex-1 space-y-1.5">
          <label className="text-sm font-medium">Level</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {LEVEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 space-y-1.5">
          <label className="text-sm font-medium">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select category</option>
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Duration + Student Count + Rating */}
      <div className="flex gap-4">
        <div className="flex-1 space-y-1.5">
          <label className="text-sm font-medium">Duration (hours)</label>
          <input
            type="number"
            min={0}
            value={durationHours}
            onChange={(e) => setDurationHours(e.target.value)}
            placeholder="e.g. 12"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">Leave empty for self-paced.</p>
        </div>
        <div className="flex-1 space-y-1.5">
          <label className="text-sm font-medium">Student Count</label>
          <input
            type="number"
            min={0}
            value={studentCount}
            onChange={(e) => setStudentCount(e.target.value)}
            placeholder="e.g. 1000000"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex-1 space-y-1.5">
          <label className="text-sm font-medium">Rating (0-5)</label>
          <input
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="e.g. 4.8"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Image URL */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Image URL (optional)</label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://... (leave empty for provider gradient)"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Tags</label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Python, ML, Fundamentals"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground">Comma-separated list.</p>
      </div>

      {/* Order + Free checkbox */}
      <div className="flex gap-4">
        <div className="flex-1 space-y-1.5">
          <label className="text-sm font-medium">Display Order</label>
          <input
            type="number"
            min={0}
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              className="h-4 w-4 rounded border accent-green-600"
            />
            Free course
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-foreground px-5 py-2 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Saving…" : mode === "create" ? "Create course" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/courses")}
          className="rounded-lg border px-5 py-2 text-sm font-semibold hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
