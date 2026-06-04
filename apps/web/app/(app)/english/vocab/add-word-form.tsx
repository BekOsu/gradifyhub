"use client";

import { addWordAction } from "~/actions/english/vocab";
import { useState } from "react";

export function AddWordForm() {
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await addWordAction(formData);

    if (!result.success) {
      setError(result.error || "Failed to add word");
      setIsSubmitting(false);
    } else {
      e.currentTarget.reset();
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          type="text"
          name="phrase"
          placeholder="e.g. break even"
          required
          disabled={isSubmitting}
          className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 disabled:opacity-50"
        />

        <input
          type="text"
          name="meaning"
          placeholder="e.g. to reach the point where costs equal revenue"
          required
          disabled={isSubmitting}
          className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 disabled:opacity-50"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <select
          name="category"
          defaultValue="Daily Life"
          disabled={isSubmitting}
          className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 disabled:opacity-50"
        >
          <option value="Daily Life">Daily Life</option>
          <option value="Work">Work</option>
          <option value="Technical">Technical</option>
          <option value="Opinion">Opinion</option>
          <option value="Social">Social</option>
        </select>

        <select
          name="difficulty"
          defaultValue="beginner"
          disabled={isSubmitting}
          className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 disabled:opacity-50"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <input
        type="text"
        name="example"
        placeholder="e.g. We need 6 months to break even on this project"
        disabled={isSubmitting}
        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 disabled:opacity-50"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-brand-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-brand-green/90 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Adding..." : "Add Word"}
      </button>
    </form>
  );
}
