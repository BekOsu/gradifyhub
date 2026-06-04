import { z } from "zod";

export const SelfAssessmentAnswer = z.enum(["yes", "partial", "no"]);
export type SelfAssessmentAnswer = z.infer<typeof SelfAssessmentAnswer>;

const LevelAnswers = z.array(SelfAssessmentAnswer).length(5);

export const DimensionSubmission = z.object({
  dimension: z.string().min(1),
  l1: LevelAnswers,
  l2: LevelAnswers,
  l3: LevelAnswers,
  l4: LevelAnswers,
});
export type DimensionSubmission = z.infer<typeof DimensionSubmission>;

export const SubmitSelfAssessmentInput = z.object({
  dimensions: z.array(DimensionSubmission).min(1),
});
export type SubmitSelfAssessmentInput = z.infer<typeof SubmitSelfAssessmentInput>;
