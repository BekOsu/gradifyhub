export type ResumeSectionKey = "summary" | "experience" | "education" | "skills" | "projects";

export const DEFAULT_SECTION_ORDER: ResumeSectionKey[] = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
];

export function normalizeSectionOrder(input?: unknown): ResumeSectionKey[] {
  if (!Array.isArray(input)) return DEFAULT_SECTION_ORDER;

  const valid = input.filter(
    (item): item is ResumeSectionKey =>
      item === "summary" ||
      item === "experience" ||
      item === "education" ||
      item === "skills" ||
      item === "projects",
  );

  const unique = Array.from(new Set(valid));
  const missing = DEFAULT_SECTION_ORDER.filter((k) => !unique.includes(k));
  return [...unique, ...missing];
}

