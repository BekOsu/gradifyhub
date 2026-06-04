import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import { z } from "zod";
import { aiGenerateObject } from "./client";
import { MOCK_ITEMS } from "~/lib/assessment/mock";
import type { DimensionScore } from "./assessment";

// ── Output schemas ────────────────────────────────────────────────────────

const TechnicalInsightsSchema = z.object({
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  strengths: z.array(z.string()).min(1).max(2),
  gaps: z.array(z.string()).min(1).max(3),
  verdict: z.string().max(150),
});

const CommunicationAnalysisSchema = z.object({
  cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  justification: z.string().max(120),
  professionalClarity: z.enum(["developing", "adequate", "strong"]),
});

const SoftSkillsAnalysisSchema = z.object({
  workStyle: z.string().max(60),
  traits: z.array(z.string()).min(2).max(3),
  conflictApproach: z.enum(["avoidant", "assertive", "diplomatic", "collaborative"]),
  teamReadiness: z.number().int().min(0).max(100),
});

export const EnrichedSummarySchema = z.object({
  headline: z.string().max(120),
  overallLevel: z.enum(["beginner", "intermediate", "advanced"]),
  strengths: z.array(z.string()).min(2).max(3),
  gaps: z.array(z.string()).min(2).max(3),
  nextStep: z.string().max(150),
  cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  cefrJustification: z.string().max(120),
  workStyle: z.string().max(60),
  workStyleTraits: z.array(z.string()).min(2).max(3),
  jobReadinessScore: z.number().int().min(0).max(100),
  jobReadinessLabel: z.enum(["Build foundation", "Interview-track", "Job-ready", "High-confidence candidate"]),
  roadmapHint: z.string().max(200),
});

export type EnrichedSummary = z.infer<typeof EnrichedSummarySchema>;

type StoredResponse = { itemId: string; choiceId: string };

export type CandidateProfile = {
  currentRole?: string | null;
  yearsOfExperience?: string | null;
  knownStack?: { languages?: string[]; frameworks?: string[]; custom?: string } | null;
  targetTimeline?: string | null;
  goal?: string | null;
};

// ── Graph state ───────────────────────────────────────────────────────────

const GraphState = Annotation.Root({
  scores: Annotation<DimensionScore[]>({
    default: () => [],
    reducer: (_prev, next) => next,
  }),
  responses: Annotation<StoredResponse[]>({
    default: () => [],
    reducer: (_prev, next) => next,
  }),
  profile: Annotation<CandidateProfile | null>({
    default: () => null,
    reducer: (_prev, next) => next ?? _prev,
  }),
  technicalInsights: Annotation<z.infer<typeof TechnicalInsightsSchema> | null>({
    default: () => null,
    reducer: (prev, next) => next ?? prev,
  }),
  communicationAnalysis: Annotation<z.infer<typeof CommunicationAnalysisSchema> | null>({
    default: () => null,
    reducer: (prev, next) => next ?? prev,
  }),
  softSkillsAnalysis: Annotation<z.infer<typeof SoftSkillsAnalysisSchema> | null>({
    default: () => null,
    reducer: (prev, next) => next ?? prev,
  }),
  summary: Annotation<EnrichedSummary | null>({
    default: () => null,
    reducer: (prev, next) => next ?? prev,
  }),
});

type State = typeof GraphState.State;

// ── Profile context builder ───────────────────────────────────────────────

function buildProfileContext(profile: CandidateProfile | null): string {
  if (!profile) return "";

  const knownTech = [
    ...(profile.knownStack?.languages ?? []),
    ...(profile.knownStack?.frameworks ?? []),
    ...(profile.knownStack?.custom?.split(",").map((s) => s.trim()).filter(Boolean) ?? []),
  ].filter(Boolean);

  const roleStr = profile.currentRole ?? "";
  const roleParts = roleStr.split(" – ").map((s) => s.trim());

  const hasPython = knownTech.some((t) => /python/i.test(t));
  const hasMLFrameworks = knownTech.some((t) =>
    /pytorch|tensorflow|sklearn|scikit|huggingface|keras|jax|langchain|llamaindex/i.test(t)
  );

  // Check student status first so "Engineering" field doesn't trip isDeveloper
  const isStudent = /^student/i.test(roleStr);
  const isRecentGrad = isStudent && /just graduated/i.test(roleStr);
  const isCSStudent = isStudent && /computer science|engineering/i.test(roleStr);
  const isDataStudent = isStudent && /math|physics|data/i.test(roleStr);

  // Only evaluate professional background for non-students
  const isITBackground = !isStudent && /admin|sysadmin|devops|ops|infrastructure|network|support|helpdesk/i.test(roleStr);
  const isDeveloper = !isStudent && /dev|engineer|programmer|software|full.?stack|backend|frontend/i.test(roleStr);
  const isDataBackground = !isStudent && /data analyst|data scientist|analyst|bi |tableau|sql/i.test(roleStr);
  const isResearcher = !isStudent && /^researcher/i.test(roleStr);
  const isBusinessBackground = !isStudent && /^business professional/i.test(roleStr);
  const isJobHunting = /looking for work/i.test(roleStr);

  const priors: string[] = [];

  // ── Python priors ──
  if (isStudent && isCSStudent && !hasPython) {
    priors.push(
      "Python for AI: expected baseline 25–45% (CS/Engineering student — likely has introductory Python from coursework)"
    );
  } else if (isStudent && isDataStudent && !hasPython) {
    priors.push(
      "Python for AI: expected baseline 20–35% (Math/Data student — statistical background helps but Python may be limited)"
    );
  } else if (isStudent && !hasPython) {
    priors.push(
      "Python for AI: expected baseline 5–20% (non-CS student — Python is likely a new skill)"
    );
  } else if (!hasPython && isITBackground) {
    priors.push(
      "Python for AI: expected baseline 10–30% (no prior Python, IT background) — scores above 30% are a genuine strength worth naming"
    );
  } else if (hasPython && isDeveloper) {
    priors.push(
      "Python for AI: expected baseline 50–70% (Python developer) — scores below 40% indicate a real gap despite stated background"
    );
  } else if (!hasPython) {
    priors.push(
      "Python for AI: expected baseline 20–40% (no Python stated) — frame as a starting point, not a failure"
    );
  }

  // ── AI/ML priors ──
  if (isStudent && isCSStudent) {
    priors.push(
      "AI/ML Concepts: expected baseline 15–35% (CS student — may have introductory ML from coursework but limited practical experience)"
    );
  } else if (!hasMLFrameworks && isITBackground) {
    priors.push(
      "AI/ML Concepts, LLM API & Prompting, RAG & Retrieval, Agentic Patterns: expected baseline 0–25% (no ML background) — any score here is above-baseline learning progress"
    );
  } else if (!hasMLFrameworks && isDeveloper) {
    priors.push(
      "AI/ML Concepts, LLM API & Prompting, RAG & Retrieval: expected baseline 15–35% (developer without ML experience) — scores at 40%+ indicate fast learning"
    );
  } else if (!hasMLFrameworks && isDataBackground) {
    priors.push(
      "AI/ML Concepts: expected baseline 30–50% (data background transfers to ML concepts); LLM API & RAG: expected baseline 10–25% (hands-on LLM skills are likely new)"
    );
  } else if (hasMLFrameworks) {
    priors.push(
      "AI/ML Concepts, LLM API & Prompting, RAG & Retrieval: expected baseline 45–65% (ML practitioner) — scores below 40% in these dimensions are priority gaps"
    );
  }

  // ── Researcher / Academia priors ──
  if (isResearcher && !hasPython) {
    priors.push(
      "Python for AI: expected baseline 30–50% (researcher — likely has Python or R experience from data analysis work)"
    );
  }
  if (isResearcher && !hasMLFrameworks) {
    priors.push(
      "AI/ML Concepts: expected baseline 25–45% (researcher — strong statistical thinking transfers, but hands-on ML engineering is likely new)"
    );
  }

  // ── Business / Finance priors ──
  if (isBusinessBackground) {
    if (!hasPython) {
      priors.push(
        "Python for AI: expected baseline 5–20% (business background — coding is likely a new skill)"
      );
    }
    if (!hasMLFrameworks) {
      priors.push(
        "AI/ML Concepts, LLM API & Prompting, Agentic Patterns: expected baseline 5–20% (business background — no technical baseline assumed; frame progress as building from scratch, not catching up)"
      );
    }
  }

  // ── System Design priors ──
  if (isITBackground) {
    priors.push(
      "System Design: expected baseline 35–55% (ops/infrastructure background transfers partially to distributed systems thinking)"
    );
  }

  // ── Motivation signal ──
  if (isJobHunting) {
    priors.push(
      "Candidate is actively job-hunting — prioritise job-ready dimensions (LLM API, Agentic Patterns, System Design) over theoretical gaps"
    );
  }
  if (isRecentGrad) {
    priors.push(
      "Candidate recently graduated — treat scores comparably to an entry-level professional, not a senior developer baseline"
    );
  }

  const bgLines = [
    `<candidate_background>`,
    `  Current role: ${roleParts[0] ?? "not stated"}${roleParts.length > 1 ? ` (${roleParts.slice(1).join(", ")})` : ""}`,
    `  Years of experience: ${profile.yearsOfExperience ?? "not stated"}`,
    `  Target goal: ${profile.goal ?? "not stated"}`,
    `  Target timeline: ${profile.targetTimeline ?? "not stated"}`,
    `  Known technologies: ${knownTech.length > 0 ? knownTech.join(", ") : "none stated"}`,
    `</candidate_background>`,
  ];

  if (priors.length > 0) {
    bgLines.push(
      ``,
      `<scoring_priors>`,
      `Evaluate all gaps relative to this candidate's background, not a generic developer baseline.`,
      ...priors.map((p) => `- ${p}`),
      `</scoring_priors>`
    );
  }

  return bgLines.join("\n") + "\n\n";
}

// ── Dimension prerequisite map ────────────────────────────────────────────

const PREREQUISITE_HINT = `Important prerequisite ordering for the roadmap hint:
- LLM API & Prompting requires Python for AI as a foundation
- RAG & Retrieval requires LLM API fluency
- Agentic Patterns requires RAG & Retrieval
- System Design for AI requires Agentic Patterns
If the candidate has a gap in a prerequisite dimension, the roadmap must address that prerequisite before the dependent dimension — regardless of the dependent dimension's score.`;

// ── Specialist nodes (run in parallel) ───────────────────────────────────

const TECHNICAL_DIMS = ["python", "llm_fundamentals_evals", "context_engineering", "rag_retrieval", "agentic_systems", "voice_multimodal", "system_design", "tooling_observability"];

async function technicalAnalystNode(state: State): Promise<Partial<State>> {
  const techScores = state.scores.filter((s) => TECHNICAL_DIMS.includes(s.dimension));
  const scoresText = techScores.map((s) => `${s.label}: ${s.score}%`).join(", ");
  const profileContext = buildProfileContext(state.profile);

  const insights = await aiGenerateObject({
    speed: "fast",
    schema: TechnicalInsightsSchema,
    system:
      "You are a senior AI engineering hiring manager. Assess a candidate's practical readiness for AI engineer roles (LLM integration, RAG systems, agentic workflows). Be direct and specific. When a candidate's background is provided, interpret scores relative to that background — not against a generic developer baseline.",
    prompt: `${profileContext}AI engineer diagnostic signals: ${scoresText}.
Dimensions: Python for AI, LLM Fundamentals & Evals, Context Engineering, RAG & Retrieval, Agentic Systems, Voice & Multimodal, System Design, Tooling & Observability.
Determine their overall level (beginner/intermediate/advanced/expert), their 1-2 strongest areas, and 1-3 critical hiring gaps for AI engineer roles.
If scoring_priors are provided above, use them to calibrate what counts as a gap vs. an above-baseline result for this specific candidate.`,
  });

  return { technicalInsights: insights };
}

async function communicationAnalystNode(state: State): Promise<Partial<State>> {
  // Professional skills items cover both soft skills and communication quality
  const profItems = MOCK_ITEMS.filter((i) => i.dimension === "soft_skills");
  const profScore = state.scores.find((s) => s.dimension === "soft_skills");
  const profileContext = buildProfileContext(state.profile);

  const responseDetails = state.responses
    .filter((r) => profItems.some((i) => i.id === r.itemId))
    .map((r) => {
      const item = profItems.find((i) => i.id === r.itemId);
      const correctChoice = item?.choices.find((c) => c.correct);
      const chosenChoice = item?.choices.find((c) => c.id === r.choiceId);
      const isCorrect = correctChoice?.id === r.choiceId;
      return `• "${item?.stem.slice(0, 70)}…" → chose "${chosenChoice?.label}" (${isCorrect ? "correct" : "incorrect"})`;
    })
    .join("\n");

  const analysis = await aiGenerateObject({
    speed: "fast",
    schema: CommunicationAnalysisSchema,
    system:
      "You are a CEFR-certified English language assessor for tech professionals. Map response patterns to a CEFR level (A1–C2). Only use the evidence provided — do not guess. Consider the candidate's background when interpreting communication patterns.",
    prompt: `${profileContext}Professional communication assessment:
Overall professional skills score: ${profScore?.score ?? 50}%
Question-level responses:
${responseDetails || "No professional skills responses available."}

Assign a CEFR equivalent level based on communication quality shown in responses, provide a one-sentence justification, and rate professional clarity.`,
  });

  return { communicationAnalysis: analysis };
}

async function softSkillsAnalystNode(state: State): Promise<Partial<State>> {
  const sjtItems = MOCK_ITEMS.filter((i) => i.dimension === "soft_skills");
  const softScore = state.scores.find((s) => s.dimension === "soft_skills");
  const profileContext = buildProfileContext(state.profile);

  const responseDetails = state.responses
    .filter((r) => sjtItems.some((i) => i.id === r.itemId))
    .map((r) => {
      const item = sjtItems.find((i) => i.id === r.itemId);
      const correctChoice = item?.choices.find((c) => c.correct);
      const chosenChoice = item?.choices.find((c) => c.id === r.choiceId);
      const quality = correctChoice?.id === r.choiceId ? "best-practice response" : "suboptimal response";
      return `Scenario: "${item?.stem.slice(0, 90)}…"\nResponse: "${chosenChoice?.label}" — ${quality}`;
    })
    .join("\n\n");

  const analysis = await aiGenerateObject({
    speed: "fast",
    schema: SoftSkillsAnalysisSchema,
    system:
      "You are an organisational psychologist specialising in tech team dynamics. Assess professional behaviour patterns from situational judgment test responses. Be evidence-based and specific. Use candidate background context to personalise trait labels.",
    prompt: `${profileContext}Soft skills / situational judgment results:
Overall score: ${softScore?.score ?? 50}%
Scenario responses:
${responseDetails || "No SJT responses available."}

Identify work style, 2–3 key behavioural traits, conflict approach, and team readiness score (0–100).`,
  });

  return { softSkillsAnalysis: analysis };
}

// ── Synthesiser node (runs after all three analysts complete) ─────────────

async function synthesizerNode(state: State): Promise<Partial<State>> {
  const { scores, technicalInsights, communicationAnalysis, softSkillsAnalysis, profile } = state;
  const scoresText = scores.map((s) => `${s.label}: ${s.score}%`).join(", ");
  const profileContext = buildProfileContext(profile);

  const summary = await aiGenerateObject({
    speed: "primary",
    schema: EnrichedSummarySchema,
    system: `You are a world-class career coach for AI engineers (LLM integration, RAG, agentic systems). Synthesise multi-dimensional diagnostic data into a clear, actionable job-readiness profile.
Rules:
- Be direct and specific. No filler phrases like "great job" or "strong foundation in".
- When candidate background is provided, the headline and verdict must name that context explicitly (e.g. "As someone coming from IT operations..." or "Given your Python development background...").
- jobReadinessScore must be evidence-based — combine technical level across LLM/RAG/agents, CEFR, and team readiness, calibrated against the candidate's background if provided.
- roadmapHint must be one concrete sentence directing what the personalised AI engineer roadmap should prioritise first.
- ${PREREQUISITE_HINT}`,
    prompt: `${profileContext}Synthesise this full AI engineer diagnostic into a complete candidate profile:

TECHNICAL SCORES: ${scoresText}
TECHNICAL LEVEL: ${technicalInsights?.level ?? "unknown"}
TECHNICAL VERDICT: ${technicalInsights?.verdict ?? ""}
TECHNICAL STRENGTHS: ${technicalInsights?.strengths.join(", ") ?? ""}
TECHNICAL GAPS: ${technicalInsights?.gaps.join(", ") ?? ""}

CEFR LEVEL: ${communicationAnalysis?.cefrLevel ?? "B1"}
CEFR JUSTIFICATION: ${communicationAnalysis?.justification ?? ""}
PROFESSIONAL CLARITY: ${communicationAnalysis?.professionalClarity ?? "adequate"}

WORK STYLE: ${softSkillsAnalysis?.workStyle ?? "unknown"}
BEHAVIOURAL TRAITS: ${softSkillsAnalysis?.traits?.join(", ") ?? ""}
CONFLICT APPROACH: ${softSkillsAnalysis?.conflictApproach ?? "unknown"}
TEAM READINESS: ${softSkillsAnalysis?.teamReadiness ?? 50}/100

Generate a complete enriched summary with all fields populated.`,
  });

  return { summary };
}

// ── Compiled graph ────────────────────────────────────────────────────────

const assessmentGraph = new StateGraph(GraphState)
  .addNode("technical_analyst", technicalAnalystNode)
  .addNode("communication_analyst", communicationAnalystNode)
  .addNode("soft_skills_analyst", softSkillsAnalystNode)
  .addNode("synthesizer", synthesizerNode)
  .addEdge(START, "technical_analyst")
  .addEdge(START, "communication_analyst")
  .addEdge(START, "soft_skills_analyst")
  .addEdge("technical_analyst", "synthesizer")
  .addEdge("communication_analyst", "synthesizer")
  .addEdge("soft_skills_analyst", "synthesizer")
  .addEdge("synthesizer", END)
  .compile();

// ── Public API ────────────────────────────────────────────────────────────

export async function runAssessmentPipeline(
  scores: DimensionScore[],
  responses: StoredResponse[],
  profile: CandidateProfile | null = null
): Promise<EnrichedSummary> {
  const result = await assessmentGraph.invoke({ scores, responses, profile });
  if (!result.summary) throw new Error("Assessment pipeline produced no summary");
  return result.summary;
}
