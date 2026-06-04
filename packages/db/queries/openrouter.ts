import { and, eq, gte } from "drizzle-orm";
import { db } from "../client";
import { usageLog, aiModelPreference } from "../schema";

function startOfCurrentMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getMonthlySpendMicroUsd(userId: string): Promise<number> {
  const rows = await db.query.usageLog.findMany({
    where: and(eq(usageLog.userId, userId), gte(usageLog.createdAt, startOfCurrentMonth())),
    columns: { costMicroUsd: true },
  });
  return rows.reduce((sum, r) => sum + r.costMicroUsd, 0);
}

export async function getMonthlyRequestCount(userId: string): Promise<number> {
  const rows = await db.query.usageLog.findMany({
    where: and(eq(usageLog.userId, userId), gte(usageLog.createdAt, startOfCurrentMonth())),
    columns: { id: true },
  });
  return rows.length;
}

export async function getMonthlySpendByFeature(
  userId: string,
): Promise<Array<{ feature: string; costMicroUsd: number; requests: number }>> {
  const rows = await db.query.usageLog.findMany({
    where: and(eq(usageLog.userId, userId), gte(usageLog.createdAt, startOfCurrentMonth())),
    columns: { feature: true, costMicroUsd: true },
  });

  const map = new Map<string, { costMicroUsd: number; requests: number }>();
  for (const row of rows) {
    const existing = map.get(row.feature) ?? { costMicroUsd: 0, requests: 0 };
    map.set(row.feature, {
      costMicroUsd: existing.costMicroUsd + row.costMicroUsd,
      requests: existing.requests + 1,
    });
  }

  return Array.from(map.entries())
    .map(([feature, data]) => ({ feature, ...data }))
    .sort((a, b) => b.costMicroUsd - a.costMicroUsd);
}

export async function getRecentUsageLogs(userId: string, limit = 20) {
  return db.query.usageLog.findMany({
    where: eq(usageLog.userId, userId),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    limit,
  });
}

export async function insertUsageLog(entry: {
  userId: string;
  feature: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costMicroUsd: number;
  cached: boolean;
  source: "platform" | "byok";
}): Promise<void> {
  await db.insert(usageLog).values({
    id: crypto.randomUUID(),
    ...entry,
  });
}

export async function getModelPreference(userId: string, feature: string): Promise<string | null> {
  const row = await db.query.aiModelPreference.findFirst({
    where: and(eq(aiModelPreference.userId, userId), eq(aiModelPreference.feature, feature)),
    columns: { modelId: true },
  });
  return row?.modelId ?? null;
}

export async function upsertModelPreference(
  userId: string,
  feature: string,
  modelId: string,
): Promise<void> {
  await db
    .insert(aiModelPreference)
    .values({ id: crypto.randomUUID(), userId, feature, modelId })
    .onConflictDoUpdate({
      target: [aiModelPreference.userId, aiModelPreference.feature],
      set: { modelId, updatedAt: new Date() },
    });
}

