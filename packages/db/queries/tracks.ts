import { eq, sql } from "drizzle-orm";
import { db } from "../client";
import { track, profile, item, lesson } from "../schema";
import type { TrackMarketData, LiveJobData } from "../schema";

export type Track = typeof track.$inferSelect;
export type TrackDimension = { key: string; label: string };
export type { TrackMarketData, LiveJobData };

export async function getTracks() {
  return db.query.track.findMany({
    orderBy: (t, { asc }) => [asc(t.order), asc(t.label)],
  });
}

export async function getEnabledTracks() {
  return db.query.track.findMany({
    where: eq(track.enabled, true),
    orderBy: (t, { asc }) => [asc(t.order), asc(t.label)],
  });
}

export async function getTrackByValue(value: string) {
  return db.query.track.findFirst({ where: eq(track.value, value) });
}

export async function createTrack(data: {
  value: string;
  label: string;
  description: string;
  icon?: string;
  enabled?: boolean;
  recommended?: boolean;
  order?: number;
  languages?: string[];
  dimensions?: TrackDimension[];
  marketData?: TrackMarketData | null;
  liveJobData?: LiveJobData | null;
}) {
  const id = crypto.randomUUID();
  await db.insert(track).values({
    id,
    value: data.value,
    label: data.label,
    description: data.description,
    icon: data.icon ?? "code",
    enabled: data.enabled ?? false,
    recommended: data.recommended ?? false,
    order: data.order ?? 0,
    languages: data.languages ?? [],
    dimensions: data.dimensions ?? [],
    marketData: data.marketData ?? null,
    liveJobData: data.liveJobData ?? null,
    updatedAt: new Date(),
  });
  return id;
}

export async function updateTrack(
  id: string,
  data: Partial<{
    label: string;
    description: string;
    icon: string;
    enabled: boolean;
    recommended: boolean;
    order: number;
    languages: string[];
    dimensions: TrackDimension[];
    marketData: TrackMarketData | null;
    liveJobData: LiveJobData | null;
  }>,
) {
  await db
    .update(track)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(track.id, id));
}

export async function deleteTrack(id: string): Promise<{ ok: boolean; reason?: string }> {
  const row = await db.query.track.findFirst({ where: eq(track.id, id) });
  if (!row) return { ok: false, reason: "Track not found" };

  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(profile)
    .where(eq(profile.goal, row.value));

  const userCount = Number(result[0]?.count ?? 0);
  if (userCount > 0) {
    return {
      ok: false,
      reason: `${userCount} user${userCount === 1 ? "" : "s"} currently on this track`,
    };
  }

  await db.delete(track).where(eq(track.id, id));
  return { ok: true };
}

export async function getDimensionUsage(dimensionKey: string) {
  const [itemResult, lessonResult] = await Promise.all([
    db.select({ count: sql<number>`COUNT(*)` }).from(item).where(eq(item.dimension, dimensionKey)),
    db.select({ count: sql<number>`COUNT(*)` }).from(lesson).where(eq(lesson.dimension, dimensionKey)),
  ]);
  const itemCount = Number(itemResult[0]?.count ?? 0);
  const lessonCount = Number(lessonResult[0]?.count ?? 0);
  return { itemCount, lessonCount, total: itemCount + lessonCount };
}