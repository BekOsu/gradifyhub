"use server";

import { z } from "zod";
import { requireAuth } from "~/lib/auth/session";
import { getIntegration, removeIntegration, updateBudget, decryptApiKey } from "~/lib/openrouter/token";
import { getMonthlySpendMicroUsd, upsertModelPreference } from "@repo/db/queries/openrouter";

const UpdateBudgetInput = z.object({
  monthlyBudgetCents: z.number().int().min(0).nullable(),
});

const SetModelPreferenceInput = z.object({
  feature: z.string().min(1),
  modelId: z.string().min(1),
});

export async function getOpenRouterStatusAction(): Promise<{
  connected: boolean;
  keyPreview: string | null;
  monthlyBudgetCents: number | null;
  monthlySpendMicroUsd: number;
}> {
  const user = await requireAuth();
  const integration = await getIntegration(user.id);

  if (!integration?.connected) {
    return { connected: false, keyPreview: null, monthlyBudgetCents: null, monthlySpendMicroUsd: 0 };
  }

  const [decrypted, monthlySpendMicroUsd] = await Promise.all([
    decryptApiKey(user.id),
    getMonthlySpendMicroUsd(user.id),
  ]);

  // Show only the first 12 chars of the key, rest masked
  const keyPreview = decrypted ? `${decrypted.slice(0, 12)}...` : null;

  return {
    connected: true,
    keyPreview,
    monthlyBudgetCents: integration.monthlyBudgetCents ?? null,
    monthlySpendMicroUsd,
  };
}

export async function updateBudgetAction(input: unknown): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();

  const parsed = UpdateBudgetInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid budget value." };
  }

  await updateBudget(user.id, parsed.data.monthlyBudgetCents);
  return { success: true };
}

export async function disconnectOpenRouterAction(): Promise<{ success: boolean }> {
  const user = await requireAuth();
  await removeIntegration(user.id);
  return { success: true };
}

export async function setModelPreferenceAction(
  input: unknown,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  const parsed = SetModelPreferenceInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }
  await upsertModelPreference(user.id, parsed.data.feature, parsed.data.modelId);
  return { success: true };
}

