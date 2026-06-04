"use server";

import { requireAuth } from "~/lib/auth/session";
import {
  getMonthlySpendMicroUsd,
  getMonthlyRequestCount,
  getMonthlySpendByFeature,
  getRecentUsageLogs,
} from "@repo/db/queries/openrouter";

export async function getUsageSummaryAction() {
  const user = await requireAuth();

  const [totalMicroUsd, totalRequests, byFeature, recent] = await Promise.all([
    getMonthlySpendMicroUsd(user.id),
    getMonthlyRequestCount(user.id),
    getMonthlySpendByFeature(user.id),
    getRecentUsageLogs(user.id, 20),
  ]);

  return { totalMicroUsd, totalRequests, byFeature, recent };
}

export async function getUsageByFeatureAction() {
  const user = await requireAuth();
  return getMonthlySpendByFeature(user.id);
}
