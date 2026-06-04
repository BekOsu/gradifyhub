import type { ResumeSectionKey } from "./layout";

export type ResumeContent = {
  meta?: {
    intakeSource?: "pdf" | "docx" | "text" | "manual" | "linkedin";
    hasLinkedin?: boolean;
    template?: "modern" | "classic" | "compact";
    sectionOrder?: ResumeSectionKey[];
  };
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    website: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
  }>;
  skills: string[];
  projects: Array<{
    id: string;
    name: string;
    description: string;
    url: string;
  }>;
};

