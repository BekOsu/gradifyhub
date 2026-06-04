"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createResumeFromIntake } from "~/actions/resume";

const inputClass =
  "rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring w-full";

export function ResumeIntakeForm({ hasExistingResume = false }: { hasExistingResume?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const result = await createResumeFromIntake(form);

    if (!result.success) {
      setError(result.error ?? "Could not create resume.");
      setLoading(false);
      return;
    }

    router.push("/resume");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-xl border border-border bg-card p-5">
      <div>
        <h2 className="text-lg font-semibold">{hasExistingResume ? "Re-import your resume" : "Start your resume"}</h2>
        <p className="text-sm text-muted-foreground">
          Optional: upload your current CV and add LinkedIn. We will pre-fill your resume.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="cvUpload" className="text-sm font-medium text-foreground">
          Upload current CV (optional)
        </label>
        <input
          id="cvUpload"
          name="cvUpload"
          type="file"
          accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,text/plain,.txt,text/markdown,.md,.markdown"
          className={inputClass}
        />
        <p className="text-xs text-muted-foreground">
          Accepted formats: PDF, DOCX, TXT, MD (legacy .doc is not supported).
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="linkedinUrl" className="text-sm font-medium text-foreground">
          LinkedIn URL (optional)
        </label>
        <input
          id="linkedinUrl"
          name="linkedinUrl"
          type="url"
          placeholder="https://linkedin.com/in/your-name"
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="cvText" className="text-sm font-medium text-foreground">
          CV text (optional)
        </label>
        <textarea
          id="cvText"
          name="cvText"
          rows={4}
          placeholder="Paste resume text here if you prefer"
          className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring w-full resize-none"
        />
      </div>

      {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Creating..." : hasExistingResume ? "Recreate from CV" : "Create resume"}
        </button>
        <button
          type="button"
          onClick={() => router.push(hasExistingResume ? "/resume" : "/dashboard")}
          className="rounded-lg border px-4 py-2.5 text-sm font-semibold hover:bg-muted"
        >
          Back
        </button>
      </div>
    </form>
  );
}

