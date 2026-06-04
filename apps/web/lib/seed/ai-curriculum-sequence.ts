// AI Engineer curriculum — global sequence indices (1..34).
// Maps each lesson slug to its 32-week-path position so the roadmap can gate
// "unlock after previous" without enforcing per-dimension order alone.
// Source of truth: local-only/tasks/ai-learning-path/CURRICULUM.md (week-by-week)
// and local-only/tasks/curriculum-alignment/howitworks.md (mapping table).

export const AI_CURRICULUM_SEQUENCE: Record<string, number> = {
  // Phase 1 — Foundations (Weeks 1–6)
  "python-patterns-every-ai-engineer-needs": 1,
  "how-language-models-work": 2,
  "calling-llm-apis": 3,
  "prompt-patterns-that-actually-work": 4,
  "getting-structured-output-from-llms-reliably": 5,
  "setting-up-a-proper-ai-dev-environment": 6,

  // Phase 2 — Core Skills (Weeks 7–16)
  "embeddings-explained-for-engineers": 7,
  "vector-databases-when-why-and-how": 8,
  "build-a-rag-pipeline-from-scratch": 9,
  "production-rag-beyond-the-tutorial": 10,
  "context-engineering-the-skill-that-replaced-prompt-engineering": 11,
  "tool-use-and-mcp-giving-ai-hands": 12,
  "building-your-first-ai-agent": 13,
  "langgraph-stateful-agent-workflows": 14,
  "multi-agent-systems": 15,
  "multi-channel-agent-deployment": 16,
  "debugging-ai-systems-with-observability-tools": 17,
  "debugging-a-containment-rate-drop": 18,

  // Phase 3 — Production (Weeks 17–26)
  "evals-how-engineers-know-their-ai-is-working": 19,
  "llm-as-judge-and-eval-pipelines-in-ci": 20,
  "designing-production-ai-services": 21,
  "ai-cost-optimization": 22,
  "multimodal-ai-building-with-vision-and-audio": 23,
  "building-a-voice-pipeline": 24,
  "real-time-voice-barge-in-and-vad": 25,
  "voice-ai-at-scale": 26,
  "ai-product-decisions-when-ai-helps-and-when-it-hurts": 27,
  "technical-discovery-with-clients": 28,
  "delivering-ai-projects-end-to-end": 29,
  "enterprise-ai-deployment": 30,

  // Phase 4 — Senior & Specialist (Weeks 27–32)
  "ai-observability-at-scale": 31,
  "mlops-for-llm-applications": 32,
  "high-performance-python-for-ai-pipelines": 33,
  "testing-ai-code": 34,
};

export function sequenceFor(slug: string): number {
  return AI_CURRICULUM_SEQUENCE[slug] ?? 0;
}
