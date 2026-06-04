"use server";

import { db } from "@repo/db/client";
import { track } from "@repo/db/schema";
import { eq } from "@repo/db/drizzle";
import type { LiveJobData } from "@repo/db/queries/tracks";
import { requireAdmin } from "~/lib/auth/permissions";
import { fetchJobFeedForTrack } from "~/lib/jobs/fetch-job-feed";
import { researchMarketData } from "~/lib/ai/market-research";

export async function refreshAllJobFeeds(): Promise<{ ok: boolean; updated: number }> {
  await requireAdmin();

  const enabledTracks = await db.query.track.findMany({
    where: eq(track.enabled, true),
  });

  let updated = 0;

  for (const t of enabledTracks) {
    const liveJobData = await fetchJobFeedForTrack(t.value);
    if (liveJobData) {
      await db
        .update(track)
        .set({ liveJobData, updatedAt: new Date() })
        .where(eq(track.id, t.id));
      updated++;
    }
  }

  return { ok: true, updated };
}

export async function refreshAllMarketData(): Promise<{ ok: boolean; updated: number }> {
  await requireAdmin();

  const enabledTracks = await db.query.track.findMany({
    where: eq(track.enabled, true),
  });

  let updated = 0;

  for (const t of enabledTracks) {
    try {
      const [jobDataResult, marketDataResult] = await Promise.allSettled([
        fetchJobFeedForTrack(t.value),
        researchMarketData(t.value, t.label),
      ]).then((results) => results);

      if (jobDataResult.status === "rejected") {
        console.error(`Job fetch failed for track ${t.value}:`, jobDataResult.reason);
        continue;
      }

      const liveJobData = jobDataResult.value as LiveJobData;

      const mergedJobData: LiveJobData =
        marketDataResult.status === "fulfilled"
          ? {
              ...liveJobData,
              regionalSalary: marketDataResult.value.regionalSalary,
            }
          : liveJobData;

      const updatedMarketData =
        marketDataResult.status === "fulfilled" && t.marketData
          ? {
              ...t.marketData,
              salaryRange: marketDataResult.value.regionalSalary.US,
              hiringContext: marketDataResult.value.hiringContext,
            }
          : t.marketData ?? undefined;

      await db
        .update(track)
        .set({
          liveJobData: mergedJobData,
          ...(updatedMarketData ? { marketData: updatedMarketData } : {}),
          updatedAt: new Date(),
        })
        .where(eq(track.id, t.id));

      updated++;
    } catch (error) {
      console.error(`Error refreshing market data for track ${t.value}:`, error);
    }
  }

  return { ok: true, updated };
}
