export interface ORModel {
  id: string;
  name: string;
  context_length: number;
  pricing: { prompt: string; completion: string };
}

// Per-task recommended models — quality tasks get sonnet, balanced tasks get llama
export const TASK_DEFAULTS: Record<string, string> = {
  assessment: "anthropic/claude-sonnet-4-5",
  roadmap: "anthropic/claude-sonnet-4-5",
  interview_prep: "anthropic/claude-sonnet-4-5",
  lesson: "meta-llama/llama-3.3-70b-instruct",
  resume: "meta-llama/llama-3.3-70b-instruct",
};

export const TASK_LABELS: Record<string, string> = {
  assessment: "Assessment",
  lesson: "Lesson AI",
  roadmap: "Roadmap generation",
  resume: "Resume builder",
  interview_prep: "Interview prep",
};

// In-memory cache — keyed by a single slot since catalog is global
let cachedModels: ORModel[] | null = null;
let cacheExpiresAt = 0;

export async function fetchORModels(): Promise<ORModel[]> {
  const now = Date.now();
  if (cachedModels && now < cacheExpiresAt) return cachedModels;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return Object.values(TASK_DEFAULTS)
        .filter((v, i, a) => a.indexOf(v) === i)
        .map((id) => ({
          id,
          name: id.split("/")[1] ?? id,
          context_length: 8192,
          pricing: { prompt: "0", completion: "0" },
        }));
    }
    const json = (await res.json()) as { data: ORModel[] };
    cachedModels = json.data ?? [];
    cacheExpiresAt = now + 60 * 60 * 1000; // 1 hour
    return cachedModels;
  } catch {
    // Return a minimal fallback list so the UI never breaks
    return Object.values(TASK_DEFAULTS)
      .filter((v, i, a) => a.indexOf(v) === i)
      .map((id) => ({
        id,
        name: id.split("/")[1] ?? id,
        context_length: 8192,
        pricing: { prompt: "0", completion: "0" },
      }));
  }
}

