"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { saveResume, optimizeResume, togglePublic } from "~/actions/resume";
import type { ResumeContent } from "~/lib/resume/types";
import { DEFAULT_SECTION_ORDER } from "~/lib/resume/layout";
import type { ResumeSectionKey } from "~/lib/resume/layout";

type ResumeEditorProps = {
  resume: {
    id: string;
    title: string;
    content: ResumeContent;
    isPublic: boolean;
    publicSlug: string | null;
  };
};

type DragSection = "experience" | "education" | "projects";

const SECTION_LABELS: Record<ResumeSectionKey, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
};

export function ResumeEditor({ resume }: ResumeEditorProps) {
  const [content, setContent] = useState<ResumeContent>(resume.content);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(resume.isPublic);
  const [publicSlug, setPublicSlug] = useState<string | null>(resume.publicSlug);
  const [togglingShare, setTogglingShare] = useState(false);
  const [dragState, setDragState] = useState<{ section: DragSection; from: number } | null>(null);
  const [sectionDragFrom, setSectionDragFrom] = useState<number | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const triggerSave = useCallback(
    (nextContent: ResumeContent) => {
      setSaved(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setSaving(true);
        await saveResume(resume.id, nextContent);
        setSaving(false);
        setSaved(true);
      }, 1500);
    },
    [resume.id]
  );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    triggerSave(content);
  }, [content, triggerSave]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function updatePersonalInfo(field: keyof ResumeContent["personalInfo"], value: string) {
    setContent((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  }

  function updateSummary(value: string) {
    setContent((prev) => ({ ...prev, summary: value }));
  }

  function updateTemplate(template: "modern" | "classic" | "compact") {
    setContent((prev) => ({
      ...prev,
      meta: {
        ...(prev.meta ?? {}),
        template,
        sectionOrder: prev.meta?.sectionOrder ?? DEFAULT_SECTION_ORDER,
      },
    }));
  }

  function sectionOrder(): ResumeSectionKey[] {
    const current = content.meta?.sectionOrder;
    if (!current || current.length === 0) return DEFAULT_SECTION_ORDER;
    const normalized = Array.from(new Set(current));
    const missing = DEFAULT_SECTION_ORDER.filter((key) => !normalized.includes(key));
    return [...normalized, ...missing];
  }

  function updateSectionOrder(next: ResumeSectionKey[]) {
    setContent((prev) => ({
      ...prev,
      meta: {
        ...(prev.meta ?? {}),
        sectionOrder: next,
      },
    }));
  }

  function updateSkills(value: string) {
    setContent((prev) => ({
      ...prev,
      skills: value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    }));
  }

  // Experience

  function addExperience() {
    setContent((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { id: crypto.randomUUID(), company: "", role: "", startDate: "", endDate: "", description: "" },
      ],
    }));
  }

  function updateExperience(index: number, field: keyof ResumeContent["experience"][number], value: string) {
    setContent((prev) => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: value } as ResumeContent["experience"][number];
      return { ...prev, experience: updated };
    });
  }

  function removeExperience(index: number) {
    setContent((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  }

  // Education

  function addEducation() {
    setContent((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { id: crypto.randomUUID(), institution: "", degree: "", field: "", startDate: "", endDate: "" },
      ],
    }));
  }

  function updateEducation(index: number, field: keyof ResumeContent["education"][number], value: string) {
    setContent((prev) => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value } as ResumeContent["education"][number];
      return { ...prev, education: updated };
    });
  }

  function removeEducation(index: number) {
    setContent((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  }

  // Projects

  function addProject() {
    setContent((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        { id: crypto.randomUUID(), name: "", description: "", url: "" },
      ],
    }));
  }

  function updateProject(index: number, field: keyof ResumeContent["projects"][number], value: string) {
    setContent((prev) => {
      const updated = [...prev.projects];
      updated[index] = { ...updated[index], [field]: value } as ResumeContent["projects"][number];
      return { ...prev, projects: updated };
    });
  }

  function removeProject(index: number) {
    setContent((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  }

  function moveItem<T>(items: T[], from: number, to: number): T[] {
    if (from === to) return items;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    if (!moved) return items;
    next.splice(to, 0, moved);
    return next;
  }

  function onDragStart(section: DragSection, index: number) {
    setDragState({ section, from: index });
  }

  function onDrop(section: DragSection, to: number) {
    if (!dragState || dragState.section !== section) return;

    setContent((prev) => {
      if (section === "experience") {
        return { ...prev, experience: moveItem(prev.experience, dragState.from, to) };
      }
      if (section === "education") {
        return { ...prev, education: moveItem(prev.education, dragState.from, to) };
      }
      return { ...prev, projects: moveItem(prev.projects, dragState.from, to) };
    });

    setDragState(null);
  }

  function onSectionDrop(to: number) {
    if (sectionDragFrom === null) return;
    updateSectionOrder(moveItem(sectionOrder(), sectionDragFrom, to));
    setSectionDragFrom(null);
  }

  function moveSectionBy(index: number, delta: -1 | 1) {
    const nextIndex = index + delta;
    const current = sectionOrder();
    if (nextIndex < 0 || nextIndex >= current.length) return;
    updateSectionOrder(moveItem(current, index, nextIndex));
  }

  function moveListItemBy(section: DragSection, index: number, delta: -1 | 1) {
    const nextIndex = index + delta;

    setContent((prev) => {
      if (section === "experience") {
        if (nextIndex < 0 || nextIndex >= prev.experience.length) return prev;
        return { ...prev, experience: moveItem(prev.experience, index, nextIndex) };
      }

      if (section === "education") {
        if (nextIndex < 0 || nextIndex >= prev.education.length) return prev;
        return { ...prev, education: moveItem(prev.education, index, nextIndex) };
      }

      if (nextIndex < 0 || nextIndex >= prev.projects.length) return prev;
      return { ...prev, projects: moveItem(prev.projects, index, nextIndex) };
    });
  }

  async function handleOptimize() {
    setOptimizing(true);
    const result = await optimizeResume(resume.id);
    setOptimizing(false);
    if (result.success) {
      if (result.summary) {
        setContent((prev) => ({ ...prev, summary: result.summary }));
      }
      setSuggestions(result.suggestions);
    }
  }

  async function handleToggleShare() {
    setTogglingShare(true);
    const result = await togglePublic(resume.id);
    setTogglingShare(false);
    if (result.success) {
      setIsPublic(result.isPublic);
      setPublicSlug(result.publicSlug);
    }
  }

  const inputClass = "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  const textareaClass = "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none";
  const labelClass = "block text-xs font-medium text-muted-foreground mb-1";
  const sectionHeadingClass = "text-base font-semibold mb-3";

  // Completeness meter (0–100%, purely derived from form values)
  const completenessScore = (() => {
    let score = 0;
    const pi = content.personalInfo;
    if (pi.name?.trim()) score += 10;
    if (pi.email?.trim()) score += 10;
    if (pi.phone?.trim()) score += 5;
    if (pi.location?.trim()) score += 5;
    if (pi.linkedin?.trim()) score += 5;
    if (content.summary?.trim()) score += 15;
    if (content.experience.length > 0) score += 20;
    if (content.education.length > 0) score += 15;
    if (content.skills.length > 0) score += 10;
    if (content.projects.length > 0) score += 5;
    return score;
  })();

  const intakeSource = content.meta?.intakeSource;
  const intakeLabel =
    intakeSource === "pdf"
      ? "Imported from PDF"
      : intakeSource === "docx"
        ? "Imported from DOCX"
        : intakeSource === "text"
          ? "Imported from text file"
          : intakeSource === "manual"
            ? "Imported from pasted CV"
            : intakeSource === "linkedin"
              ? "Imported from LinkedIn"
              : null;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-3" data-print-hide>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">{resume.title}</h1>
          {intakeLabel && (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
              {intakeLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">          <button
            type="button"
            onClick={() => (window.location.href = "/dashboard")}
            className="inline-flex rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-muted"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => (window.location.href = "/resume?mode=intake")}
            className="inline-flex rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-muted"
          >
            Re-import CV
          </button>
          <select
            className="rounded-lg border bg-background px-2 py-1.5 text-xs md:hidden"
            value={content.meta?.template ?? "modern"}
            onChange={(e) => updateTemplate(e.target.value as "modern" | "classic" | "compact")}
          >
            <option value="modern">Modern</option>
            <option value="classic">Classic</option>
            <option value="compact">Compact</option>
          </select>

          <div className="hidden items-center gap-2 md:flex">
            {(["modern", "classic", "compact"] as const).map((template) => {
              const active = (content.meta?.template ?? "modern") === template;
              return (
                <button
                  key={template}
                  type="button"
                  onClick={() => updateTemplate(template)}
                  className={`rounded-lg border px-2 py-1.5 text-left transition ${
                    active ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                  }`}
                  aria-pressed={active}
                >
                  <div className="mb-1 text-[11px] font-medium capitalize">{template}</div>
                  <div className="h-6 w-16 rounded border border-border bg-background p-1">
                    {template === "modern" ? (
                      <div className="grid h-full grid-cols-3 gap-1">
                        <span className="rounded bg-muted" />
                        <span className="col-span-2 rounded bg-muted/70" />
                      </div>
                    ) : template === "classic" ? (
                      <div className="flex h-full flex-col gap-1">
                        <span className="h-1 rounded bg-muted" />
                        <span className="h-1 rounded bg-muted/70" />
                        <span className="h-1 rounded bg-muted/50" />
                      </div>
                    ) : (
                      <div className="flex h-full flex-col gap-0.5">
                        <span className="h-0.5 rounded bg-muted" />
                        <span className="h-0.5 rounded bg-muted/80" />
                        <span className="h-0.5 rounded bg-muted/60" />
                        <span className="h-0.5 rounded bg-muted/40" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <span className="text-xs text-muted-foreground">
            {saving ? "Saving…" : saved ? "Saved" : "Unsaved"}
          </span>
          <button
            onClick={() => window.print()}
            className="inline-flex rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            Download PDF
          </button>
          <button
            onClick={handleOptimize}
            disabled={optimizing}
            className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {optimizing ? "Optimizing…" : "AI Optimize"}
          </button>
          <button
            onClick={handleToggleShare}
            disabled={togglingShare}
            className="inline-flex rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50"
          >
            {togglingShare ? "…" : isPublic ? "Make Private" : "Share"}
          </button>
        </div>
      </div>

      {/* Completeness meter */}
      <div className="border-b bg-muted/30 px-6 py-2.5" data-print-hide>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground w-28 shrink-0">
            Resume completeness
          </span>
          <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                completenessScore >= 80
                  ? "bg-green-500"
                  : completenessScore >= 50
                  ? "bg-amber-400"
                  : "bg-primary"
              }`}
              style={{ width: `${completenessScore}%` }}
            />
          </div>
          <span className={`text-xs font-semibold tabular-nums w-8 text-right ${
            completenessScore >= 80
              ? "text-green-600"
              : completenessScore >= 50
              ? "text-amber-600"
              : "text-muted-foreground"
          }`}>
            {completenessScore}%
          </span>
        </div>
      </div>

      {/* Share link */}
      {isPublic && publicSlug && (
        <div className="border-b bg-muted/40 px-6 py-2 text-sm" data-print-hide>
          Public link:{" "}
          <a
            href={`/resume/preview/${publicSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2"
          >
            gradifyhub.com/resume/preview/{publicSlug}
          </a>
        </div>
      )}

      {/* AI suggestions */}
      {suggestions.length > 0 && (
        <div className="border-b bg-amber-50 px-6 py-3 dark:bg-amber-950/20" data-print-hide>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold mb-1">AI Suggestions</p>
              <ul className="list-disc pl-4 space-y-1">
                {suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setSuggestions([])}
              className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Left: Editor */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 lg:max-w-xl xl:max-w-2xl" data-print-hide>

          {/* Section Order */}
          <section>
            <h2 className={sectionHeadingClass}>Layout Order</h2>
            <p className="mb-2 text-xs text-muted-foreground">Drag sections or use Up/Down buttons to reorder preview/export.</p>
            <div className="space-y-2">
              {sectionOrder().map((key, idx) => (
                <div
                  key={key}
                  draggable
                  onDragStart={() => setSectionDragFrom(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onSectionDrop(idx)}
                  className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <span>{SECTION_LABELS[key]}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveSectionBy(idx, -1)}
                      disabled={idx === 0}
                      className="rounded border px-2 py-0.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Move ${SECTION_LABELS[key]} up`}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSectionBy(idx, 1)}
                      disabled={idx === sectionOrder().length - 1}
                      className="rounded border px-2 py-0.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Move ${SECTION_LABELS[key]} down`}
                    >
                      Down
                    </button>
                    <span className="ml-1 text-xs text-muted-foreground">Drag</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Personal Info */}
          <section>
            <h2 className={sectionHeadingClass}>Personal Info</h2>
            <div className="grid grid-cols-2 gap-3">
              {(["name", "email", "phone", "location", "linkedin", "github", "website"] as const).map((field) => (
                <div key={field} className={field === "website" || field === "linkedin" ? "col-span-2" : ""}>
                  <label className={labelClass}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={content.personalInfo[field]}
                    onChange={(e) => updatePersonalInfo(field, e.target.value)}
                    placeholder={field}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Summary */}
          <section>
            <h2 className={sectionHeadingClass}>Summary</h2>
            <textarea
              className={textareaClass}
              rows={4}
              value={content.summary}
              onChange={(e) => updateSummary(e.target.value)}
              placeholder="A brief professional summary…"
            />
          </section>

          {/* Experience */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className={sectionHeadingClass.replace(" mb-3", "")}>Experience</h2>
              <button
                onClick={addExperience}
                className="text-sm font-medium text-primary hover:underline"
              >
                + Add
              </button>
            </div>
            <div className="space-y-5">
              {content.experience.map((exp, i) => (
                <div
                  key={exp.id}
                  className="rounded-xl border p-4 space-y-3"
                  draggable
                  onDragStart={() => onDragStart("experience", i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop("experience", i)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Entry {i + 1} · Drag to reorder
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveListItemBy("experience", i, -1)}
                        disabled={i === 0}
                        className="rounded border px-2 py-0.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Move experience entry ${i + 1} up`}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveListItemBy("experience", i, 1)}
                        disabled={i === content.experience.length - 1}
                        className="rounded border px-2 py-0.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Move experience entry ${i + 1} down`}
                      >
                        Down
                      </button>
                      <button
                        onClick={() => removeExperience(i)}
                        className="text-xs text-destructive hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(["company", "role", "startDate", "endDate"] as const).map((f) => (
                      <div key={f}>
                        <label className={labelClass}>{f === "startDate" ? "Start" : f === "endDate" ? "End" : f.charAt(0).toUpperCase() + f.slice(1)}</label>
                        <input
                          type="text"
                          className={inputClass}
                          value={exp[f]}
                          onChange={(e) => updateExperience(i, f, e.target.value)}
                          placeholder={f === "startDate" || f === "endDate" ? "2023-01" : ""}
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                      className={textareaClass}
                      rows={3}
                      value={exp.description}
                      onChange={(e) => updateExperience(i, "description", e.target.value)}
                      placeholder="What you built, shipped, or improved…"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className={sectionHeadingClass.replace(" mb-3", "")}>Education</h2>
              <button
                onClick={addEducation}
                className="text-sm font-medium text-primary hover:underline"
              >
                + Add
              </button>
            </div>
            <div className="space-y-5">
              {content.education.map((edu, i) => (
                <div
                  key={edu.id}
                  className="rounded-xl border p-4 space-y-3"
                  draggable
                  onDragStart={() => onDragStart("education", i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop("education", i)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Entry {i + 1} · Drag to reorder
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveListItemBy("education", i, -1)}
                        disabled={i === 0}
                        className="rounded border px-2 py-0.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Move education entry ${i + 1} up`}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveListItemBy("education", i, 1)}
                        disabled={i === content.education.length - 1}
                        className="rounded border px-2 py-0.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Move education entry ${i + 1} down`}
                      >
                        Down
                      </button>
                      <button
                        onClick={() => removeEducation(i)}
                        className="text-xs text-destructive hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(["institution", "degree", "field", "startDate", "endDate"] as const).map((f) => (
                      <div key={f} className={f === "institution" ? "col-span-2" : ""}>
                        <label className={labelClass}>
                          {f === "startDate" ? "Start" : f === "endDate" ? "End" : f.charAt(0).toUpperCase() + f.slice(1)}
                        </label>
                        <input
                          type="text"
                          className={inputClass}
                          value={edu[f]}
                          onChange={(e) => updateEducation(i, f, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Skills */}
          <section>
            <h2 className={sectionHeadingClass}>Skills</h2>
            <div>
              <label className={labelClass}>Comma-separated list</label>
              <input
                type="text"
                className={inputClass}
                value={content.skills.join(", ")}
                onChange={(e) => updateSkills(e.target.value)}
                placeholder="Python, PyTorch, LangChain, React…"
              />
            </div>
          </section>

          {/* Projects */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className={sectionHeadingClass.replace(" mb-3", "")}>Projects</h2>
              <button
                onClick={addProject}
                className="text-sm font-medium text-primary hover:underline"
              >
                + Add
              </button>
            </div>
            <div className="space-y-5">
              {content.projects.map((proj, i) => (
                <div
                  key={proj.id}
                  className="rounded-xl border p-4 space-y-3"
                  draggable
                  onDragStart={() => onDragStart("projects", i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop("projects", i)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Project {i + 1} · Drag to reorder
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveListItemBy("projects", i, -1)}
                        disabled={i === 0}
                        className="rounded border px-2 py-0.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Move project entry ${i + 1} up`}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveListItemBy("projects", i, 1)}
                        disabled={i === content.projects.length - 1}
                        className="rounded border px-2 py-0.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Move project entry ${i + 1} down`}
                      >
                        Down
                      </button>
                      <button
                        onClick={() => removeProject(i)}
                        className="text-xs text-destructive hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Name</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={proj.name}
                      onChange={(e) => updateProject(i, "name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                      className={textareaClass}
                      rows={2}
                      value={proj.description}
                      onChange={(e) => updateProject(i, "description", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>URL</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={proj.url}
                      onChange={(e) => updateProject(i, "url", e.target.value)}
                      placeholder="https://github.com/…"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Preview */}
        <div className="flex-1 overflow-y-auto border-t lg:border-l lg:border-t-0 bg-muted/30 px-6 py-6" data-print-resume>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">Preview</p>
          <ResumePreview content={content} />
        </div>
      </div>
    </div>
  );
}

function ResumePreview({ content }: { content: ResumeContent }) {
  const { personalInfo, summary, experience, education, skills, projects } = content;
  const template = content.meta?.template ?? "modern";
  const order = (() => {
    const current = content.meta?.sectionOrder;
    if (!current || current.length === 0) return DEFAULT_SECTION_ORDER;
    const unique = Array.from(new Set(current));
    const missing = DEFAULT_SECTION_ORDER.filter((k) => !unique.includes(k));
    return [...unique, ...missing] as ResumeSectionKey[];
  })();

  const shellClass =
    template === "compact"
      ? "bg-white text-black p-6 rounded-lg shadow-lg text-[13px] leading-relaxed max-w-2xl mx-auto"
      : "bg-white text-black p-8 rounded-lg shadow-lg text-sm leading-relaxed max-w-2xl mx-auto";

  function renderSection(key: ResumeSectionKey): React.ReactNode {
    if (key === "summary" && summary) {
      return (
        <div key="summary" className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Summary</h2>
          <p className="text-gray-800">{summary}</p>
        </div>
      );
    }

    if (key === "experience" && experience.length > 0) {
      return (
        <div key="experience" className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Experience</h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold">{exp.role || "Role"}</span>
                  <span className="text-xs text-gray-500">
                    {exp.startDate}
                    {exp.startDate && exp.endDate ? " – " : ""}
                    {exp.endDate}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mb-1">{exp.company}</div>
                {exp.description && <p className="text-gray-700 whitespace-pre-line">{exp.description}</p>}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (key === "education" && education.length > 0) {
      return (
        <div key="education" className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Education</h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold">{edu.institution || "Institution"}</span>
                  <span className="text-xs text-gray-500">
                    {edu.startDate}
                    {edu.startDate && edu.endDate ? " – " : ""}
                    {edu.endDate}
                  </span>
                </div>
                {(edu.degree || edu.field) && (
                  <div className="text-xs text-gray-600">
                    {edu.degree}
                    {edu.degree && edu.field ? ", " : ""}
                    {edu.field}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (key === "skills" && skills.length > 0) {
      return (
        <div key="skills" className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Skills</h2>
          <p className="text-gray-800">{skills.join(" · ")}</p>
        </div>
      );
    }

    if (key === "projects" && projects.length > 0) {
      return (
        <div key="projects" className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Projects</h2>
          <div className="space-y-3">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="font-semibold">{proj.name || "Project"}</div>
                {proj.description && <p className="text-gray-700">{proj.description}</p>}
                {proj.url && (
                  <a href={proj.url} className="text-xs text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    {proj.url}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  }

  if (template === "modern") {
    const sideKeys = order.filter((k) => k === "skills" || k === "education");
    const mainKeys = order.filter((k) => k !== "skills" && k !== "education");

    return (
      <div className={shellClass}>
        <div className="mb-5 border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight">{personalInfo.name || "Your Name"}</h1>
          <p className="mt-1 text-xs text-gray-600">Professional resume</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <aside className="col-span-1 space-y-5">
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">Contact</h2>
              <div className="space-y-1 text-xs text-gray-700">
                {personalInfo.email && <p>{personalInfo.email}</p>}
                {personalInfo.phone && <p>{personalInfo.phone}</p>}
                {personalInfo.location && <p>{personalInfo.location}</p>}
                {personalInfo.linkedin && <p>{personalInfo.linkedin}</p>}
                {personalInfo.github && <p>{personalInfo.github}</p>}
                {personalInfo.website && <p>{personalInfo.website}</p>}
              </div>
            </div>

            {sideKeys.map((key) => {
              if (key === "skills" && skills.length > 0) {
                return (
                  <div key="skills-modern">
                    <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">Skills</h2>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((skill) => (
                        <span key={skill} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              }

              if (key === "education" && education.length > 0) {
                return (
                  <div key="education-modern">
                    <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">Education</h2>
                    <div className="space-y-2">
                      {education.map((edu) => (
                        <div key={edu.id}>
                          <p className="text-xs font-semibold">{edu.institution || "Institution"}</p>
                          {(edu.degree || edu.field) && (
                            <p className="text-[11px] text-gray-600">
                              {edu.degree}
                              {edu.degree && edu.field ? ", " : ""}
                              {edu.field}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </aside>

          <section className="col-span-2 space-y-5">
            {mainKeys.map((key) => renderSection(key))}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <div className="mb-5 border-b pb-4">
        <h1 className="text-2xl font-bold">{personalInfo.name || "Your Name"}</h1>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
          {personalInfo.github && <span>{personalInfo.github}</span>}
          {personalInfo.website && <span>{personalInfo.website}</span>}
        </div>
      </div>

      {order.map((key) => renderSection(key))}
    </div>
  );
}
