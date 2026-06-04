"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminCreateTrack, adminUpdateTrack } from "~/actions/admin";

const ICON_OPTIONS = [
  { value: "brain",        label: "Brain (AI/ML)" },
  { value: "server",       label: "Server (Backend)" },
  { value: "monitor",      label: "Monitor (Frontend)" },
  { value: "layers",       label: "Layers (Full-Stack)" },
  { value: "smartphone",   label: "Smartphone (Mobile)" },
  { value: "cloud",        label: "Cloud (DevOps)" },
  { value: "bar-chart",    label: "Bar Chart (Data)" },
  { value: "shield-check", label: "Shield (QA)" },
  { value: "code",         label: "Code (Generic)" },
] as const;

type Dimension = { key: string; label: string };

interface TrackFormProps {
  mode: "create" | "edit";
  initial?: {
    id: string;
    value: string;
    label: string;
    description: string;
    icon: string;
    recommended: boolean;
    order: number;
    languages: string[];
    dimensions: Dimension[];
  };
}

export function TrackForm({ mode, initial }: TrackFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [value, setValue] = useState(initial?.value ?? "");
  const [label, setLabel] = useState(initial?.label ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "code");
  const [recommended, setRecommended] = useState(initial?.recommended ?? false);
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [languages, setLanguages] = useState((initial?.languages ?? []).join(", "));
  const [dimensions, setDimensions] = useState<Dimension[]>(initial?.dimensions ?? [{ key: "", label: "" }]);

  function addDimension() {
    setDimensions((prev) => [...prev, { key: "", label: "" }]);
  }

  function removeDimension(i: number) {
    setDimensions((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateDimension(i: number, field: keyof Dimension, val: string) {
    setDimensions((prev) => prev.map((d, idx) => (idx === i ? { ...d, [field]: val } : d)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const langs = languages
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const dims = dimensions.filter((d) => d.key.trim() && d.label.trim());

    startTransition(async () => {
      let result: { success: boolean; error?: string };

      if (mode === "create") {
        result = await adminCreateTrack({
          value: value.trim(),
          label: label.trim(),
          description: description.trim(),
          icon,
          recommended,
          order,
          languages: langs,
          dimensions: dims,
        });
      } else {
        result = await adminUpdateTrack(initial!.id, {
          label: label.trim(),
          description: description.trim(),
          icon,
          recommended,
          order,
          languages: langs,
          dimensions: dims,
        });
      }

      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
      } else {
        router.push("/admin/tracks");
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

      {/* Value slug — readonly on edit */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Value (slug)</label>
        {mode === "create" ? (
          <input
            required
            value={value}
            onChange={(e) => setValue(e.target.value.toLowerCase().replace(/[^a-z_]/g, ""))}
            placeholder="e.g. backend_engineer"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        ) : (
          <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground font-mono">
            {value}
          </div>
        )}
        <p className="text-xs text-muted-foreground">Lowercase letters and underscores only. Cannot be changed after creation.</p>
      </div>

      {/* Label */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Label</label>
        <input
          required
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Backend Engineer"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Description</label>
        <input
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="One sentence shown in the track picker"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Icon */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Icon</label>
        <select
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {ICON_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Order + Recommended */}
      <div className="flex gap-4">
        <div className="flex-1 space-y-1.5">
          <label className="text-sm font-medium">Display order</label>
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
              checked={recommended}
              onChange={(e) => setRecommended(e.target.checked)}
              className="h-4 w-4 rounded border accent-green-600"
            />
            Recommended track
          </label>
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Languages</label>
        <input
          value={languages}
          onChange={(e) => setLanguages(e.target.value)}
          placeholder="TypeScript, Python, Go"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground">Comma-separated list.</p>
      </div>

      {/* Dimensions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Dimensions</label>
          <button
            type="button"
            onClick={addDimension}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            + Add dimension
          </button>
        </div>
        <div className="space-y-2">
          {dimensions.map((dim, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={dim.key}
                onChange={(e) => updateDimension(i, "key", e.target.value.toLowerCase().replace(/[^a-z_]/g, ""))}
                placeholder="key (e.g. core_language)"
                className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                value={dim.label}
                onChange={(e) => updateDimension(i, "label", e.target.value)}
                placeholder="Label (e.g. Core Language)"
                className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => removeDimension(i)}
                className="px-2 text-muted-foreground hover:text-destructive"
                aria-label="Remove dimension"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-foreground px-5 py-2 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Saving…" : mode === "create" ? "Create track" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/tracks")}
          className="rounded-lg border px-5 py-2 text-sm font-semibold hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
