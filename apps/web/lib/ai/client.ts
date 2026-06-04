import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, generateText, streamText } from "ai";
import type { z } from "zod";
import { insertUsageLog } from "@repo/db/queries/openrouter";
import {
  createOpenRouterProvider,
  BYOK_MODELS,
  PLATFORM_MODELS,
  estimateCostMicroUsd,
} from "~/lib/openrouter/router";
import { enforceBudget } from "~/lib/openrouter/budget";

function pickKey(primary?: string, fallback?: string): string {
  const first = primary?.trim();
  const second = fallback?.trim();
  if (first) return first;
  if (second) return second;
  return "";
}

type PlanTier = "free" | "pro";
type ModelSpeed = "fast" | "primary";

function normalizePlan(plan?: string): PlanTier {
  if (plan === "pro") return plan;
  return "free";
}

const anthropicApiKey = pickKey(process.env.AGENT_ANTHROPIC_API_KEY, process.env.ANTHROPIC_API_KEY);
const openAiApiKey = pickKey(process.env.AGENT_OPENAI_API_KEY, process.env.OPENAI_API_KEY);

const groqApiKey = process.env.GROQ_API_KEY?.trim() ?? "";
const deepseekApiKey = process.env.DEEPSEEK_API_KEY?.trim() ?? "";
const togetherApiKey = process.env.TOGETHER_API_KEY?.trim() ?? "";
const fireworksApiKey = process.env.FIREWORKS_API_KEY?.trim() ?? "";
const huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY?.trim() ?? "";
const cohereApiKey = process.env.COHERE_API_KEY?.trim() ?? "";
const googleApiKey = process.env.GOOGLE_API_KEY?.trim() ?? "";
const platformOpenRouterKey = process.env.OPENROUTER_API_KEY?.trim() ?? "";

const anthropic = anthropicApiKey ? createAnthropic({ apiKey: anthropicApiKey }) : null;
const openai = openAiApiKey ? createOpenAI({ apiKey: openAiApiKey }) : null;

const groq = groqApiKey
  ? createOpenAI({ apiKey: groqApiKey, baseURL: "https://api.groq.com/openai/v1" })
  : null;

const deepseek = deepseekApiKey
  ? createOpenAI({
      apiKey: deepseekApiKey,
      baseURL: process.env.DEEPSEEK_BASE_URL?.trim() || "https://api.deepseek.com",
    })
  : null;

const together = togetherApiKey
  ? createOpenAI({
      apiKey: togetherApiKey,
      baseURL: process.env.TOGETHER_BASE_URL?.trim() || "https://api.together.xyz/v1",
    })
  : null;

const fireworks = fireworksApiKey
  ? createOpenAI({
      apiKey: fireworksApiKey,
      baseURL: process.env.FIREWORKS_BASE_URL?.trim() || "https://api.fireworks.ai/inference/v1",
    })
  : null;

// HuggingFace — OpenAI-compatible inference endpoint
const huggingface = huggingfaceApiKey
  ? createOpenAI({ apiKey: huggingfaceApiKey, baseURL: "https://api-inference.huggingface.co/v1" })
  : null;

// Cohere — OpenAI-compatible endpoint
const cohere = cohereApiKey
  ? createOpenAI({ apiKey: cohereApiKey, baseURL: "https://api.cohere.com/compatibility/v1" })
  : null;

// Google Gemini — OpenAI-compatible endpoint
const gemini = googleApiKey
  ? createOpenAI({
      apiKey: googleApiKey,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    })
  : null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function compactModels(models: Array<any | null>): any[] {
  return models.filter(Boolean);
}

// Free-provider models — ordered by reliability/speed
// Groq → DeepSeek → Gemini Flash → HuggingFace → Cohere → Together → Fireworks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const freeFastModels: any[] = compactModels([
  groq ? groq(process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile") : null,
  deepseek ? deepseek(process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat") : null,
  gemini && process.env.GEMINI_MODEL ? gemini(process.env.GEMINI_MODEL) : null,
  huggingface && process.env.HUGGINGFACE_MODEL ? huggingface(process.env.HUGGINGFACE_MODEL) : null,
  cohere && process.env.COHERE_MODEL ? cohere(process.env.COHERE_MODEL) : null,
  together && process.env.TOGETHER_MODEL ? together(process.env.TOGETHER_MODEL) : null,
  fireworks && process.env.FIREWORKS_MODEL ? fireworks(process.env.FIREWORKS_MODEL) : null,
]);

// Primary free chain adds Gemini Pro as a quality option ahead of the fast chain
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const freePrimaryModels: any[] = compactModels([
  groq ? groq(process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile") : null,
  deepseek ? deepseek(process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat") : null,
  gemini && process.env.GEMINI_PRO_MODEL ? gemini(process.env.GEMINI_PRO_MODEL) : null,
  gemini && process.env.GEMINI_MODEL ? gemini(process.env.GEMINI_MODEL) : null,
  huggingface && process.env.HUGGINGFACE_MODEL ? huggingface(process.env.HUGGINGFACE_MODEL) : null,
  cohere && process.env.COHERE_MODEL ? cohere(process.env.COHERE_MODEL) : null,
  together && process.env.TOGETHER_MODEL ? together(process.env.TOGETHER_MODEL) : null,
  fireworks && process.env.FIREWORKS_MODEL ? fireworks(process.env.FIREWORKS_MODEL) : null,
]);

// Paid-provider models
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const paidPrimaryModels: any[] = compactModels([
  anthropic ? anthropic("claude-sonnet-4-6") : null,
  openai ? openai("gpt-4o-mini") : null,
]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const paidFastModels: any[] = compactModels([
  anthropic ? anthropic("claude-haiku-4-5-20251001") : null,
  openai ? openai("gpt-4o-mini") : null,
]);

// Backward-compatible exports
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const primaryModel: any = paidPrimaryModels[0] ?? freePrimaryModels[0];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fastModel: any = paidFastModels[0] ?? freeFastModels[0];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fallbackModel: any = paidPrimaryModels[1] ?? freePrimaryModels[1] ?? freePrimaryModels[0];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function modelsFor(plan: string | undefined, speed: ModelSpeed): any[] {
  const tier = normalizePlan(plan);

  if (tier === "free") {
    const freeModels = speed === "fast" ? freeFastModels : freePrimaryModels;
    const paidFallback = speed === "fast" ? paidFastModels : paidPrimaryModels;
    return [...freeModels, ...paidFallback];
  }

  const paidModels = speed === "fast" ? paidFastModels : paidPrimaryModels;
  const freeFallback = speed === "fast" ? freeFastModels : freePrimaryModels;
  return [...paidModels, ...freeFallback];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ensureModels(models: any[]): void {
  if (models.length > 0) return;
  throw new Error(
    "No LLM models configured. Set AGENT_ANTHROPIC_API_KEY/AGENT_OPENAI_API_KEY and/or free-provider keys (GROQ_API_KEY, DEEPSEEK_API_KEY, TOGETHER_API_KEY, FIREWORKS_API_KEY).",
  );
}

// Resolve an OpenRouter model + provider for a call, or null if OR is not in play
function resolveOpenRouterModel(
  openRouterKey: string | undefined,
  plan: string | undefined,
  speed: ModelSpeed,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): { model: any; modelId: string; source: "byok" | "platform" } | null {
  if (openRouterKey) {
    const provider = createOpenRouterProvider(openRouterKey);
    const modelId = speed === "fast" ? BYOK_MODELS.fast : BYOK_MODELS.primary;
    return { model: provider(modelId), modelId, source: "byok" };
  }

  const tier = normalizePlan(plan);
  if (tier === "pro" && platformOpenRouterKey) {
    const provider = createOpenRouterProvider(platformOpenRouterKey);
    const modelId = speed === "fast" ? PLATFORM_MODELS.fast : PLATFORM_MODELS.primary;
    return { model: provider(modelId), modelId, source: "platform" };
  }

  return null;
}

async function logUsage(params: {
  userId: string | undefined;
  feature: string | undefined;
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  source: "byok" | "platform";
}): Promise<void> {
  if (!params.userId || !params.feature) return;
  const costMicroUsd = estimateCostMicroUsd(params.modelId, params.inputTokens, params.outputTokens);
  insertUsageLog({
    userId: params.userId,
    feature: params.feature,
    model: params.modelId,
    inputTokens: params.inputTokens,
    outputTokens: params.outputTokens,
    costMicroUsd,
    cached: false,
    source: params.source,
  }).catch((err: unknown) => console.error("[usage] log failed:", err));
}

function usageTokens(usage: unknown): { inputTokens: number; outputTokens: number } {
  const u = usage as {
    inputTokens?: number;
    outputTokens?: number;
    promptTokens?: number;
    completionTokens?: number;
  } | null;

  return {
    inputTokens: u?.inputTokens ?? u?.promptTokens ?? 0,
    outputTokens: u?.outputTokens ?? u?.completionTokens ?? 0,
  };
}

export async function aiGenerateObject<T extends z.ZodType>({
  model,
  plan,
  speed = "primary",
  prompt,
  system,
  schema,
  openRouterKey,
  userId,
  feature,
}: {
  // any is justified: Vercel AI SDK model type isn't directly importable without @ai-sdk/provider
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model?: any;
  plan?: string;
  speed?: ModelSpeed;
  prompt: string;
  system?: string;
  schema: T;
  openRouterKey?: string;
  userId?: string;
  feature?: string;
}): Promise<z.infer<T>> {
  // Explicit model override bypasses all routing
  if (model) {
    const result = await generateObject({ model, prompt, system, schema });
    return result.object as z.infer<T>;
  }

  const orResolved = resolveOpenRouterModel(openRouterKey, plan, speed);

  if (orResolved) {
    if (orResolved.source === "byok" && userId) {
      await enforceBudget(userId);
    }
    const result = await generateObject({ model: orResolved.model, prompt, system, schema });
    const tokens = usageTokens(result.usage);
    logUsage({
      userId,
      feature,
      modelId: orResolved.modelId,
      inputTokens: tokens.inputTokens,
      outputTokens: tokens.outputTokens,
      source: orResolved.source,
    });
    return result.object as z.infer<T>;
  }

  const modelChain = modelsFor(plan, speed);
  ensureModels(modelChain);

  let lastError: unknown;
  for (const candidate of modelChain) {
    try {
      const result = await generateObject({ model: candidate, prompt, system, schema });
      return result.object as z.infer<T>;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("All model fallbacks failed.");
}

export async function aiGenerateText({
  model,
  plan,
  speed = "primary",
  prompt,
  system,
  openRouterKey,
  userId,
  feature,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model?: any;
  plan?: string;
  speed?: ModelSpeed;
  prompt: string;
  system?: string;
  openRouterKey?: string;
  userId?: string;
  feature?: string;
}): Promise<string> {
  if (model) {
    const result = await generateText({ model, prompt, system });
    return result.text;
  }

  const orResolved = resolveOpenRouterModel(openRouterKey, plan, speed);

  if (orResolved) {
    if (orResolved.source === "byok" && userId) {
      await enforceBudget(userId);
    }
    const result = await generateText({ model: orResolved.model, prompt, system });
    const tokens = usageTokens(result.usage);
    logUsage({
      userId,
      feature,
      modelId: orResolved.modelId,
      inputTokens: tokens.inputTokens,
      outputTokens: tokens.outputTokens,
      source: orResolved.source,
    });
    return result.text;
  }

  const modelChain = modelsFor(plan, speed);
  ensureModels(modelChain);

  let lastError: unknown;
  for (const candidate of modelChain) {
    try {
      const result = await generateText({ model: candidate, prompt, system });
      return result.text;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("All model fallbacks failed.");
}

export { streamText };
