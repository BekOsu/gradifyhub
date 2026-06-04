import { MOCK_ITEMS } from "~/lib/assessment/mock";
import { runAssessmentPipeline } from "./assessment-graph";

export type { EnrichedSummary as AssessmentSummary, CandidateProfile } from "./assessment-graph";

export type DimensionScore = {
  dimension: string;
  label: string;
  score: number;
};

export const DIMENSION_LABELS: Record<string, string> = {
  python:                  "Python for AI",
  llm_fundamentals_evals:  "LLM Fundamentals & Evals",
  context_engineering:     "Context Engineering",
  rag_retrieval:           "RAG & Retrieval",
  agentic_systems:         "Agentic Systems",
  voice_multimodal:        "Voice & Multimodal",
  system_design:           "System Design",
  tooling_observability:   "Tooling & Observability",
  soft_skills:             "Professional Skills",
};

export const DIMENSION_SIGNAL_LENS: Record<string, string> = {
  python:                 "Predicts Python proficiency for AI work: async patterns, type safety, and library usage",
  llm_fundamentals_evals: "Predicts LLM fundamentals depth: tokenisation, evaluation metrics, and model selection reasoning",
  context_engineering:    "Predicts prompt design quality: structured output, CoT, few-shot, and context window management",
  rag_retrieval:          "Predicts RAG system quality: retrieval precision, hybrid search, reranking, and grounding",
  agentic_systems:        "Predicts agentic system quality: tool design, multi-step orchestration, and failure handling",
  voice_multimodal:       "Predicts voice AI readiness: STT/TTS pipeline design, latency optimisation, and barge-in handling",
  system_design:          "Predicts AI system architecture decisions under production constraints and scale",
  tooling_observability:  "Predicts development environment proficiency and observability practices for AI systems",
  soft_skills:            "Predicts professional effectiveness: communication clarity, stakeholder management, and team dynamics",
};

const DIMENSION_GROUPS: Record<string, "technical" | "professional"> = {
  python:                 "technical",
  llm_fundamentals_evals: "technical",
  context_engineering:    "technical",
  rag_retrieval:          "technical",
  agentic_systems:        "technical",
  voice_multimodal:       "technical",
  system_design:          "technical",
  tooling_observability:  "technical",
  soft_skills:            "professional",
};

export const GROUP_METHOD_DIMENSION_KEYS: Record<
  "technical" | "professional",
  Array<keyof typeof DIMENSION_LABELS>
> = {
  technical: [
    "python",
    "llm_fundamentals_evals",
    "context_engineering",
    "rag_retrieval",
    "agentic_systems",
    "voice_multimodal",
    "system_design",
    "tooling_observability",
  ],
  professional: ["soft_skills"],
};

export const GROUP_METHOD_DIMENSIONS: Record<"technical" | "professional", string[]> = {
  technical:    GROUP_METHOD_DIMENSION_KEYS.technical.map((key) => DIMENSION_LABELS[key]!),
  professional: GROUP_METHOD_DIMENSION_KEYS.professional.map((key) => DIMENSION_LABELS[key]!),
};

const ALL_DIMENSIONS = Object.keys(DIMENSION_LABELS);

type StoredResponse = {
  itemId: string;
  choiceId: string;
};

type DbItem = {
  id: string;
  dimension: string;
  choices: unknown;
};

// Scores responses using DB items instead of MOCK_ITEMS.
// Used in real assessment mode for non-AI tracks where MOCK_ITEMS is not applicable.
export function scoreResponsesFromItems(
  responses: StoredResponse[],
  dbItems: DbItem[],
  trackDimensions: Array<{ key: string; label: string }>,
): DimensionScore[] {
  const correct: Record<string, number> = {};
  const total: Record<string, number> = {};

  for (const r of responses) {
    const dbItem = dbItems.find((i) => i.id === r.itemId);
    if (!dbItem) continue;
    const dim = dbItem.dimension;
    total[dim] = (total[dim] ?? 0) + 1;
    const choices = Array.isArray(dbItem.choices)
      ? (dbItem.choices as Array<{ id: string; correct?: boolean }>)
      : [];
    const choice = choices.find((c) => c.id === r.choiceId);
    if (choice?.correct) {
      correct[dim] = (correct[dim] ?? 0) + 1;
    }
  }

  return trackDimensions.map((dim) => ({
    dimension: dim.key,
    label: dim.label,
    score: total[dim.key] ? Math.round(((correct[dim.key] ?? 0) / total[dim.key]!) * 100) : 50,
  }));
}

export function scoreResponses(responses: StoredResponse[]): DimensionScore[] {
  const correct: Record<string, number> = {};
  const total: Record<string, number> = {};

  for (const r of responses) {
    const item = MOCK_ITEMS.find((i) => i.id === r.itemId);
    if (!item) continue;

    const dim = item.dimension;
    total[dim] = (total[dim] ?? 0) + 1;

    const choice = item.choices.find((c) => c.id === r.choiceId);
    if (choice?.correct) {
      correct[dim] = (correct[dim] ?? 0) + 1;
    }
  }

  return ALL_DIMENSIONS.map((dim) => ({
    dimension: dim,
    label: DIMENSION_LABELS[dim]!,
    // Dimensions with no questions default to 50 (neutral signal)
    score: total[dim] ? Math.round(((correct[dim] ?? 0) / total[dim]) * 100) : 50,
  }));
}

export async function generateAssessmentSummary(
  scores: DimensionScore[],
  responses: StoredResponse[],
  profile?: {
    currentRole?: string | null;
    yearsOfExperience?: string | null;
    knownStack?: unknown;
    targetTimeline?: string | null;
    goal?: string | null;
  } | null
) {
  const candidateProfile = profile
    ? {
        currentRole: profile.currentRole,
        yearsOfExperience: profile.yearsOfExperience,
        knownStack: profile.knownStack as { languages?: string[]; frameworks?: string[]; custom?: string } | null,
        targetTimeline: profile.targetTimeline,
        goal: profile.goal,
      }
    : null;
  return runAssessmentPipeline(scores, responses, candidateProfile);
}

export function buildGroupedReadiness(scores: DimensionScore[]) {
  // Deterministic grouped readiness (score-only): no LLM blending here.
  const groups: Record<"technical" | "professional", { total: number; count: number }> = {
    technical:    { total: 0, count: 0 },
    professional: { total: 0, count: 0 },
  };

  for (const score of scores) {
    const group = DIMENSION_GROUPS[score.dimension];
    if (!group) continue;
    groups[group].total += score.score;
    groups[group].count += 1;
  }

  return {
    technical:    groups.technical.count    ? Math.round(groups.technical.total    / groups.technical.count)    : 0,
    professional: groups.professional.count ? Math.round(groups.professional.total / groups.professional.count) : 0,
  };
}

