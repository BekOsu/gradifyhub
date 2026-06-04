import { getIntegration } from "./token";
import { getMonthlySpendMicroUsd } from "@repo/db/queries/openrouter";

export async function enforceBudget(userId: string): Promise<void> {
  const integration = await getIntegration(userId);
  if (!integration?.connected || !integration.monthlyBudgetCents) return;

  const spentMicroUsd = await getMonthlySpendMicroUsd(userId);
  const budgetMicroUsd = integration.monthlyBudgetCents * 10_000;

  if (spentMicroUsd >= budgetMicroUsd) {
    const spent = (spentMicroUsd / 1_000_000).toFixed(4);
    const cap = (integration.monthlyBudgetCents / 100).toFixed(2);
    throw new Error(
      `Monthly AI budget of $${cap} exceeded (spent $${spent}). Increase your cap in Settings → AI Usage.`,
    );
  }
}
