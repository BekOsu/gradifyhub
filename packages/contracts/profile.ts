import { z } from "zod";

export const ProfileGoal = z.enum([
  "full_stack_engineer",
  "mobile_engineer",
  "ai_ml_engineer",
  "ml_engineer",
  "data_analyst",
  "frontend_engineer",
  "backend_engineer",
  "qa_engineer",
  "devops_engineer",
  // Legacy values kept so existing users can still submit onboarding safely.
  "land_first_ai_role",
  "ml_research_to_production",
  "software_to_ai",
  "freelance_ai_engineer",
]);
export type ProfileGoal = z.infer<typeof ProfileGoal>;

export const TARGET_TIMELINES = [
  "2 weeks",
  "4 weeks",
  "6 weeks",
  "2 months",
  "3 months",
  "4 months",
  "6 months",
  "9 months",
  "12 months",
  "18 months",
] as const;

export const HOURS_PER_DAY = ["1", "2", "3", "4", "5", "6", "7", "8+"] as const;
export const DAYS_PER_WEEK = ["1", "2", "3", "4", "5", "6", "7"] as const;
export const YEARS_OF_EXPERIENCE = ["<1", "1-3", "3-5", "5-10", "10+"] as const;

export const ProfileStep1Input = z.object({
  currentRole: z.string().min(1).max(80),
  yearsOfExperience: z.enum(YEARS_OF_EXPERIENCE),
  targetTimeline: z.enum(TARGET_TIMELINES),
  hoursPerDay: z.enum(HOURS_PER_DAY),
  daysPerWeek: z.enum(DAYS_PER_WEEK),
});
export type ProfileStep1Input = z.infer<typeof ProfileStep1Input>;

export const KnownStackSchema = z.object({
  languages: z.array(z.string()),
  frameworks: z.array(z.string()),
  custom: z.string().max(200).optional(),
});
export type KnownStack = z.infer<typeof KnownStackSchema>;

export const AiCalibrationSchema = z.object({
  calledLlmApi: z.boolean(),
  builtRag: z.boolean(),
  builtAgents: z.boolean(),
  shippedToProduction: z.boolean(),
  intent: z.enum(["get_hired", "freelance", "build_product", "upskill"]),
  painPoint: z.enum([
    "dont_know_where_to_start",
    "too_theoretical",
    "need_portfolio",
    "stuck_on_agents",
  ]),
});
export type AiCalibration = z.infer<typeof AiCalibrationSchema>;

export const ProfileStep2Input = z.object({
  goal: ProfileGoal,
  knownStack: KnownStackSchema.optional(),
  aiCalibration: AiCalibrationSchema.optional(),
});
export type ProfileStep2Input = z.infer<typeof ProfileStep2Input>;
