import { inArray } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { item } from "@repo/db/schema";
import {
  getTrackKnowledge,
  SOFT_SKILLS_TRACK_GOAL,
  ENGLISH_PROFICIENCY_TRACK_GOAL,
} from "~/lib/journey/engineering-knowledge";

type AiCalibration = {
  calledLlmApi?: boolean;
  builtRag?: boolean;
  builtAgents?: boolean;
  shippedToProduction?: boolean;
};

/** Maps a 0–5 foundation-check score to a difficulty band. */
function scoreToDifficultyBand(score: number): number[] {
  if (score <= 1) return [0];          // L1: basic only
  if (score <= 3) return [0, 0.5];     // L2: basic + intermediate
  return [0.5, 1];                     // L3: intermediate + advanced
}

export async function loadRealItemSequence(
  limit: number,
  goal: string | null | undefined,
  aiCalibration?: AiCalibration | null | unknown,
): Promise<string[]> {
  if (limit <= 0) {
    throw new Error("Assessment question limit must be > 0");
  }

  const track = getTrackKnowledge(goal);
  const dimKeys = track.dimensions.map((d) => d.key);

  if (dimKeys.length === 0) {
    throw new Error(`No dimensions found for track: ${track.trackLabel}`);
  }

  // Determine difficulty band based on track type and calibration signals.
  let difficultyFilter: number[] = [0, 0.5, 1]; // Default: all levels

  if (aiCalibration && typeof aiCalibration === "object") {
    const cal = aiCalibration as Record<string, unknown>;

    if (goal === SOFT_SKILLS_TRACK_GOAL) {
      // SS track: use ssFoundationCheckScore (0–5) for difficulty banding.
      // If score is missing (foundation not yet completed), default to L1 only.
      const score = typeof cal.ssFoundationCheckScore === "number"
        ? cal.ssFoundationCheckScore
        : null;
      difficultyFilter = score !== null ? scoreToDifficultyBand(score) : [0];
    } else if (goal === ENGLISH_PROFICIENCY_TRACK_GOAL) {
      // English track: use engFoundationCheckScore (0–5) for difficulty banding.
      // If score is missing, default to L1 only.
      const score = typeof cal.engFoundationCheckScore === "number"
        ? cal.engFoundationCheckScore
        : null;
      difficultyFilter = score !== null ? scoreToDifficultyBand(score) : [0];
    } else {
      // AI/tech tracks: use boolean experience flags for difficulty banding
      const flagCount = [
        cal.calledLlmApi === true,
        cal.builtRag === true,
        cal.builtAgents === true,
        cal.shippedToProduction === true,
      ].filter(Boolean).length;

      if (flagCount === 0) {
        difficultyFilter = [0]; // L1: basic only
      } else if (flagCount <= 2) {
        difficultyFilter = [0, 0.5]; // L2: basic + intermediate
      } else {
        difficultyFilter = [0.5, 1]; // L3: intermediate + advanced
      }
    }
  }

  // First try: fetch items matching track dimensions with difficulty filter
  const rows = await db
    .select({ id: item.id, dimension: item.dimension, difficultyB: item.difficultyB })
    .from(item)
    .where(inArray(item.dimension, dimKeys))
    .limit(limit * 3);

  if (rows.length === 0) {
    throw new Error(`Assessment item bank is empty for track: ${track.trackLabel}`);
  }

  // Filter by difficulty band, treating null as 0
  let filteredRows = rows.filter((r) => difficultyFilter.includes(r.difficultyB ?? 0));

  // Fallback: if no questions in target difficulty band, use all available questions
  if (filteredRows.length === 0) {
    console.warn(
      `[loadRealItemSequence] No questions in difficulty band [${difficultyFilter}] for track ${track.trackLabel}, falling back to all difficulties`,
    );
    filteredRows = rows;
  }

  // Fisher-Yates shuffle for even spread across dimensions and randomization
  for (let i = filteredRows.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filteredRows[i], filteredRows[j]] = [filteredRows[j]!, filteredRows[i]!];
  }

  return filteredRows.slice(0, Math.min(limit, filteredRows.length)).map((r) => r.id);
}
