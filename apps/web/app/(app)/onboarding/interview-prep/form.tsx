"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { startInterviewPrep } from "~/actions/interview-prep";
import { YEARS_OF_EXPERIENCE } from "@repo/contracts/profile";

const labelClass = "text-sm font-medium text-foreground";
const inputClass =
  "rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring w-full";

function minInterviewDate(): string {
  const d = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const [iso] = d.toISOString().split("T");
  return iso ?? "";
}

export function InterviewPrepForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cvText, setCvText] = useState("");
  const [cvUploadHint, setCvUploadHint] = useState<string | null>(null);

  async function handleCvUpload(file: File | null) {
    if (!file) {
      setCvUploadHint(null);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setCvUploadHint("File is too large. Please upload a file under 2MB.");
      return;
    }

    const lowerName = file.name.toLowerCase();
    const isTextFile = lowerName.endsWith(".txt") || lowerName.endsWith(".md") || lowerName.endsWith(".markdown");

    if (!isTextFile) {
      setCvUploadHint("File uploaded. We will extract text server-side when you start prep.");
      return;
    }

    try {
      const text = await file.text();
      setCvText(text.trim());
      setCvUploadHint(`Loaded ${file.name} into CV text.`);
    } catch {
      setCvUploadHint("Could not read this file. Please paste CV text below.");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const result = await startInterviewPrep(form);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    const sessionId = result.sessionId;
    if (!sessionId) {
      setError("Could not start interview prep. Please try again.");
      setLoading(false);
      return;
    }

    const params = new URLSearchParams({ session: sessionId });
    if (result.cvExtractionSource) {
      params.set("cv", result.cvExtractionSource);
    }
    router.push(`/onboarding/interview-prep/processing?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => router.push("/onboarding/step-1")}
            className="hover:text-foreground"
          >
            ← Back
          </button>
          <span className="font-medium text-foreground">Interview Prep</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Land this role.</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Share the job and your background. Our agents will research the company,
          find your gaps, and build a targeted prep plan — in minutes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="currentRole" className={labelClass}>
              Your current role
            </label>
            <input
              id="currentRole"
              name="currentRole"
              type="text"
              required
              maxLength={80}
              placeholder="e.g. Backend Dev, Student"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="yearsOfExperience" className={labelClass}>
              Years in tech
            </label>
            <select
              id="yearsOfExperience"
              name="yearsOfExperience"
              required
              defaultValue=""
              className={inputClass}
            >
              <option value="" disabled>Select…</option>
              {YEARS_OF_EXPERIENCE.map((v) => (
                <option key={v} value={v}>{v} years</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="interviewDate" className={labelClass}>
            Interview date
          </label>
          <input
            id="interviewDate"
            name="interviewDate"
            type="date"
            required
            min={minInterviewDate()}
            className={inputClass}
          />
          <p className="text-xs text-muted-foreground px-1">
            We&apos;ll build a day-by-day plan counting down to this date.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="jobDescription" className={labelClass}>
            Job description
          </label>
          <textarea
            id="jobDescription"
            name="jobDescription"
            required
            minLength={50}
            rows={7}
            placeholder="Paste the full job description here — requirements, responsibilities, tech stack…"
            className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring w-full resize-none"
          />
          <p className="text-xs text-muted-foreground px-1">
            The more detail, the sharper your prep plan. Include requirements and tech stack.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="linkedinUrl" className={labelClass}>
              LinkedIn URL{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              id="linkedinUrl"
              name="linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/in/…"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="cvUpload" className={labelClass}>
              Upload CV{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              id="cvUpload"
              name="cvUpload"
              type="file"
              accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,text/plain,.txt,text/markdown,.md,.markdown"
              className={inputClass}
              onChange={(e) => {
                const file = e.currentTarget.files?.[0] ?? null;
                void handleCvUpload(file);
              }}
            />
            <p className="text-xs text-muted-foreground px-1">
              Upload PDF, DOCX, TXT, or MD. TXT/MD can preview here; PDF/DOCX are extracted on the server.
            </p>

            <label htmlFor="cvText" className={labelClass}>
              CV text{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="cvText"
              name="cvText"
              rows={4}
              value={cvText}
              onChange={(e) => setCvText(e.currentTarget.value)}
              placeholder="Paste CV text — skills, experience, past roles…"
              className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring w-full resize-none"
            />
            {cvUploadHint && (
              <p className="text-xs px-1 text-muted-foreground">{cvUploadHint}</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 px-4 py-4">
          <p className="mb-2.5 text-xs font-medium text-foreground">What happens next</p>
          <ol className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            <li>① Read the job description — extract company, role, requirements</li>
            <li>② Parse your CV + research the company — runs in parallel</li>
            <li>③ Identify skill gaps — your profile vs job requirements</li>
            <li>④ Build your prep plan + generate mock questions — runs in parallel</li>
          </ol>
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Starting…" : "Start my prep →"}
        </button>
      </form>
    </div>
  );
}
