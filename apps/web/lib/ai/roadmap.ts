import { z } from "zod";
import { aiGenerateObject } from "./client";
import type { DimensionScore } from "./assessment";
import { getGoalLabel } from "~/lib/journey/goals";
import { buildRoadmapContext } from "~/lib/journey/engineering-knowledge";

const RoadmapSkillSchema = z.object({
  name: z.string(),
  estimatedHours: z.number().int().min(1).max(40),
  marketBadge: z.string().nullable(),
});

const RoadmapPhaseSchema = z.object({
  name: z.string(),
  weeks: z.number().int().min(1).max(12),
  skills: z.array(RoadmapSkillSchema).min(3).max(8),
});

const GeneratedRoadmapSchema = z.object({
  title: z.string(),
  totalWeeks: z.number().int(),
  phases: z.array(RoadmapPhaseSchema).min(3).max(6),
});

export type GeneratedRoadmap = z.infer<typeof GeneratedRoadmapSchema>;

export type HumanSignals = {
  technicalLevel?: string;
  cefrLevel?: string;
  workStyle?: string;
  roadmapHint?: string;
};

export type FoundationSignals = {
  foundationCheckScore?: number; // 0-5: how many basic topics user knows
  foundationPathCompleted?: boolean; // did they do the prep lessons?
};

export type UserContext = {
  currentRole?: string | null;
  yearsOfExperience?: string | null;
  knownStack?: {
    languages?: string[];
    frameworks?: string[];
    custom?: string;
  } | null;
};

export async function generateRoadmap({
  scores,
  plan,
  goal,
  targetTimeline,
  hoursPerDay,
  daysPerWeek,
  humanSignals,
  userContext,
  earnedLevels,
  foundationSignals,
}: {
  scores: DimensionScore[];
  plan?: string;
  goal: string;
  targetTimeline: string;
  hoursPerDay: string;
  daysPerWeek: string;
  humanSignals?: HumanSignals;
  userContext?: UserContext;
  earnedLevels?: Record<string, number> | null;
  foundationSignals?: FoundationSignals;
}): Promise<GeneratedRoadmap> {
  const scoresText = scores.map((s) => `${s.label}: ${s.score}%`).join(", ");
  const hoursPerWeek =
    hoursPerDay === "8+"
      ? 40
      : parseInt(hoursPerDay) * parseInt(daysPerWeek === "7" ? "7" : daysPerWeek);

  const goalDescription = getGoalLabel(goal);

  const trackContext = buildRoadmapContext(
    goal,
    scores.map((s) => ({ dimension: s.dimension, score: s.score })),
    earnedLevels,
  );

  const humanSignalsText = humanSignals
    ? `\nUser-confirmed profile signals (treat as ground truth over raw scores):
- Technical level: ${humanSignals.technicalLevel ?? "not confirmed"}
- English / CEFR level: ${humanSignals.cefrLevel ?? "not confirmed"}
- Work style: ${humanSignals.workStyle ?? "not confirmed"}
- Roadmap focus hint: ${humanSignals.roadmapHint ?? "none"}`
    : "";

  let userContextText = "";
  if (userContext) {
    const knownTech: string[] = [
      ...(userContext.knownStack?.languages ?? []),
      ...(userContext.knownStack?.frameworks ?? []),
      ...(userContext.knownStack?.custom
        ? userContext.knownStack.custom.split(",").map((s) => s.trim()).filter(Boolean)
        : []),
    ];
    userContextText = `\nUser background:
- Current role: ${userContext.currentRole ?? "not provided"}
- Years of experience: ${userContext.yearsOfExperience ?? "not provided"}${knownTech.length > 0 ? `\n- Already knows: ${knownTech.join(", ")} — skip beginner coverage of these, go straight to advanced/production use` : ""}`;
  }

  let foundationText = "";
  if (foundationSignals) {
    foundationText = `\nFoundation readiness:
- Foundation-check score: ${foundationSignals.foundationCheckScore ?? "not taken"}/5 (basics knowledge baseline)
- Foundation lessons completed: ${foundationSignals.foundationPathCompleted ? "yes" : "not yet"} (indicates user did prep work)`;
  }

  return aiGenerateObject({
    plan,
    speed: "primary",
    schema: GeneratedRoadmapSchema,
    system: `You are a senior technical curriculum designer. Create practical, job-market-aligned learning roadmaps across software and data roles.
Rules:
- Focus heavily on gaps (low scores or low readiness baseline). Strengths need less coverage.
- Each phase builds on the previous.
- marketBadge should be like "Required in 78% of job postings" for high-demand skills, null for foundational ones.
- Skills should be concrete and learnable (e.g. "Postgres index strategy" not "Databases").
- Total weeks must fit within the user's timeline.
- Never include beginner-level skills the user already knows from their tech stack — start from intermediate or advanced application.
- If user-confirmed profile signals are provided, they override AI inferences.
- Use the skill ladder context to calibrate the depth of each phase — phases should target the next level up from where the user currently is, not repeat what they already know.`,
    prompt: `Create a personalised technical roadmap for a user who wants to become a ${goalDescription}.

Assessment scores: ${scoresText}
Target timeline: ${targetTimeline}
Available study time: ${hoursPerDay} hours/day, ${daysPerWeek} days/week (~${hoursPerWeek} hrs/week)${userContextText}${foundationText}${humanSignalsText}

${trackContext}

Generate a roadmap with phases ordered by priority. Start with the biggest gaps. Include 3-6 phases totalling no more than the timeline allows.${foundationSignals ? "\n\nCalibration: Since this user completed foundation prep, you can assume they have baseline knowledge. Adjust difficulty curve: start at intermediate-friendly (not too easy, not overwhelming) and progress to advanced." : ""}`,
  });
}
