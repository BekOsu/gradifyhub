import { z } from "zod";

export const Dimension = z.enum([
  "python",
  "llm_fundamentals_evals",
  "context_engineering",
  "rag_retrieval",
  "agentic_systems",
  "voice_multimodal",
  "system_design",
  "tooling_observability",
  "soft_skills",
]);
export type Dimension = z.infer<typeof Dimension>;

export const SubmitResponseInput = z.object({
  attemptId: z.string().min(1),
  itemId: z.string().min(1),
  choiceId: z.string().min(1),
  timeMs: z.number().int().nonnegative().optional(),
});
export type SubmitResponseInput = z.infer<typeof SubmitResponseInput>;

export const SaveAnswerInput = z.object({
  attemptId: z.string().min(1),
  itemId: z.string().min(1),
  choiceId: z.string().min(1),
  skipped: z.boolean().optional(),
  timeMs: z.number().int().nonnegative(),
});
export type SaveAnswerInput = z.infer<typeof SaveAnswerInput>;

export const SaveAnswerOutput = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});
export type SaveAnswerOutput = z.infer<typeof SaveAnswerOutput>;

export const SkipQuestionInput = z.object({
  attemptId: z.string().min(1),
  itemId: z.string().min(1),
});
export type SkipQuestionInput = z.infer<typeof SkipQuestionInput>;

export const SkipQuestionOutput = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});
export type SkipQuestionOutput = z.infer<typeof SkipQuestionOutput>;

export const PauseAttemptInput = z.object({
  attemptId: z.string().min(1),
  currentIndex: z.number().int().nonnegative(),
  elapsedMs: z.number().int().nonnegative(),
});
export type PauseAttemptInput = z.infer<typeof PauseAttemptInput>;

export const PauseAttemptOutput = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});
export type PauseAttemptOutput = z.infer<typeof PauseAttemptOutput>;

export const ResumeAttemptInput = z.object({
  attemptId: z.string().min(1),
  pauseDurationMs: z.number().int().nonnegative(),
});
export type ResumeAttemptInput = z.infer<typeof ResumeAttemptInput>;

export const ResumeAttemptOutput = z.object({
  success: z.boolean(),
  currentIndex: z.number().int().nonnegative().optional(),
  error: z.string().optional(),
});
export type ResumeAttemptOutput = z.infer<typeof ResumeAttemptOutput>;

export const AbandonAttemptInput = z.object({
  attemptId: z.string().min(1),
});
export type AbandonAttemptInput = z.infer<typeof AbandonAttemptInput>;

export const AbandonAttemptOutput = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});
export type AbandonAttemptOutput = z.infer<typeof AbandonAttemptOutput>;

export const ItemChoice = z.object({
  id: z.string(),
  label: z.string(),
  correct: z.boolean(),
});
export type ItemChoice = z.infer<typeof ItemChoice>;