import { createOpenAI } from "@ai-sdk/openai";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://gradifyhub.com";

export function createOpenRouterProvider(apiKey: string) {
  return createOpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    headers: {
      "HTTP-Referer": APP_URL,
      "X-Title": "Gradifyhub",
    },
  });
}

// Free BYOK users — cost-conscious; :free tier has no charge but is rate-limited
export const BYOK_MODELS = {
  fast: "meta-llama/llama-3.3-70b-instruct:free",
  primary: "meta-llama/llama-3.3-70b-instruct",
} as const;

// Platform key (pro/career) — quality-first defaults
export const PLATFORM_MODELS = {
  fast: "anthropic/claude-haiku-4-5",
  primary: "anthropic/claude-sonnet-4-5",
} as const;

// Allowlist of models pro/career users can override to (platform pays, so we cap choices).
// Override at runtime via OPENROUTER_PRO_ALLOWLIST="model1,model2,..." in env.
const DEFAULT_PRO_ALLOWLIST = [
  "meta-llama/llama-3.3-70b-instruct",
  "anthropic/claude-haiku-4-5",
  "google/gemini-flash-1.5",
  "openai/gpt-4o-mini",
  "anthropic/claude-3.5-sonnet",
  "anthropic/claude-sonnet-4-5",
  "google/gemini-pro-1.5",
  "openai/gpt-4o",
];

export function getProAllowlist(): string[] {
  const raw = process.env.OPENROUTER_PRO_ALLOWLIST?.trim();
  if (!raw) return DEFAULT_PRO_ALLOWLIST;
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export function isModelAllowedForPro(modelId: string): boolean {
  return getProAllowlist().includes(modelId);
}

// Pricing in micro-USD per 1M tokens (approximate, not fetched live)
// Cost formula: tokens * pricePerM / 1_000_000
const MODEL_PRICING: Record<string, { inputPerM: number; outputPerM: number }> = {
  "meta-llama/llama-3.3-70b-instruct:free": { inputPerM: 0, outputPerM: 0 },
  "meta-llama/llama-3.3-70b-instruct": { inputPerM: 120_000, outputPerM: 300_000 },
  "anthropic/claude-3.5-haiku": { inputPerM: 250_000, outputPerM: 1_250_000 },
  "anthropic/claude-haiku-4-5": { inputPerM: 250_000, outputPerM: 1_250_000 },
  "anthropic/claude-3.5-sonnet": { inputPerM: 3_000_000, outputPerM: 15_000_000 },
  "anthropic/claude-sonnet-4-5": { inputPerM: 3_000_000, outputPerM: 15_000_000 },
};

export function estimateCostMicroUsd(
  modelId: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const pricing = MODEL_PRICING[modelId];
  if (!pricing) return 0;
  return Math.round(
    (inputTokens * pricing.inputPerM + outputTokens * pricing.outputPerM) / 1_000_000,
  );
}
