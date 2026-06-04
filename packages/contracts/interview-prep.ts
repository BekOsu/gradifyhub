import { z } from "zod";

export const JdInfoSchema = z.object({
  company: z.string(),
  role: z.string(),
  techStack: z.array(z.string()),
  requirements: z.array(z.string()),
  niceToHave: z.array(z.string()),
});
export type JdInfo = z.infer<typeof JdInfoSchema>;

export const ParsedCvSchema = z.object({
  skills: z.array(z.string()),
  experience: z.string(),
  tech: z.array(z.string()),
  summary: z.string(),
});
export type ParsedCv = z.infer<typeof ParsedCvSchema>;

export const CompanyResearchSchema = z.object({
  techStack: z.array(z.string()),
  culture: z.string(),
  interviewStyle: z.string(),
  tips: z.array(z.string()).min(3).max(6),
});
export type CompanyResearch = z.infer<typeof CompanyResearchSchema>;

export const GapSchema = z.object({
  skill: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  estimatedHours: z.number().int().min(1).max(40),
  reason: z.string(),
});

export const GapAnalysisSchema = z.object({
  gaps: z.array(GapSchema).min(1).max(10),
  strengths: z.array(z.string()).min(1).max(5),
  priorities: z.array(z.string()).min(1).max(3),
});
export type GapAnalysis = z.infer<typeof GapAnalysisSchema>;

export const PrepDaySchema = z.object({
  date: z.string(),
  focus: z.string(),
  tasks: z.array(z.string()).min(1).max(5),
});

export const PrepPlanSchema = z.object({
  days: z.array(PrepDaySchema).min(1).max(30),
  totalStudyHours: z.number(),
});
export type PrepPlan = z.infer<typeof PrepPlanSchema>;

export const MockQuestionSchema = z.object({
  question: z.string(),
  type: z.enum(["technical", "behavioral", "system-design", "coding"]),
  hint: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
});
export const MockQuestionsSchema = z.array(MockQuestionSchema).min(10).max(30);
export type MockQuestion = z.infer<typeof MockQuestionSchema>;
