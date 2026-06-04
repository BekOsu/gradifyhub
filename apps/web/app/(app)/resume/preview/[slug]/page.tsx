import { notFound } from "next/navigation";
import { and, eq } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { resume } from "@repo/db/schema";
import type { ResumeContent } from "~/lib/resume/types";
import { DEFAULT_SECTION_ORDER } from "~/lib/resume/layout";
import type { ResumeSectionKey } from "~/lib/resume/layout";
import { PrintButton } from "./print-button";

type Props = {
  params: Promise<{ slug: string }>;
};

function intakeSourceLabel(source?: "pdf" | "docx" | "text" | "manual" | "linkedin"): string | null {
  if (source === "pdf") return "Imported from PDF";
  if (source === "docx") return "Imported from DOCX";
  if (source === "text") return "Imported from text file";
  if (source === "manual") return "Imported from pasted CV";
  if (source === "linkedin") return "Imported from LinkedIn";
  return null;
}

export default async function PublicResumePage({ params }: Props) {
  const { slug } = await params;

  const row = await db.query.resume.findFirst({
    where: and(eq(resume.publicSlug, slug), eq(resume.isPublic, true)),
  });

  if (!row) notFound();

  const content = row.content as ResumeContent;
  const { personalInfo, summary, experience, education, skills, projects } = content;
  const template = content.meta?.template ?? "modern";
  const order = (() => {
    const current = content.meta?.sectionOrder;
    if (!current || current.length === 0) return DEFAULT_SECTION_ORDER;
    const unique = Array.from(new Set(current));
    const missing = DEFAULT_SECTION_ORDER.filter((k) => !unique.includes(k));
    return [...unique, ...missing] as ResumeSectionKey[];
  })();
  const intakeLabel = intakeSourceLabel(content.meta?.intakeSource);

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
                  <span className="font-semibold">{exp.role}</span>
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
                  <span className="font-semibold">{edu.institution}</span>
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
                <div className="font-semibold">{proj.name}</div>
                {proj.description && <p className="text-gray-700">{proj.description}</p>}
                {proj.url && (
                  <a
                    href={proj.url}
                    className="text-xs text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
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

  return (
    <main className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-2xl mx-auto mb-4 flex justify-end" data-print-hide>
        <PrintButton />
      </div>
      <div
        data-print-resume
        className={`bg-white text-black rounded-lg shadow-lg leading-relaxed max-w-2xl mx-auto ${
          template === "compact" ? "p-6 text-[13px]" : "p-8 text-sm"
        }`}
      >
        {/* Header */}
        <div className="mb-5 border-b pb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{personalInfo.name}</h1>
            {intakeLabel && (
              <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                {intakeLabel}
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
            {personalInfo.github && <span>{personalInfo.github}</span>}
            {personalInfo.website && (
              <a href={personalInfo.website} className="hover:underline" target="_blank" rel="noopener noreferrer">
                {personalInfo.website}
              </a>
            )}
          </div>
        </div>

        {template === "modern" ? (
          <div className="grid grid-cols-3 gap-6">
            <aside className="col-span-1 space-y-5">
              {order
                .filter((k) => k === "skills" || k === "education")
                .map((key) => {
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
                              <p className="text-xs font-semibold">{edu.institution}</p>
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
              {order
                .filter((k) => k !== "skills" && k !== "education")
                .map((key) => renderSection(key))}
            </section>
          </div>
        ) : (
          <>{order.map((key) => renderSection(key))}</>
        )}
      </div>
    </main>
  );
}
