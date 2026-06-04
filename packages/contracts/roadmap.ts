import { z } from "zod";

export const PhaseStatus = z.enum(["locked", "active", "done"]);
export type PhaseStatus = z.infer<typeof PhaseStatus>;

export const SkillStatus = z.enum(["locked", "in-progress", "completed"]);
export type SkillStatus = z.infer<typeof SkillStatus>;