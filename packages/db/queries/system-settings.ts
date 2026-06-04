import { eq } from "drizzle-orm";
import { db } from "../client";
import { systemSetting } from "../schema";

export async function getSystemSetting(key: string): Promise<string | null> {
  const row = await db.query.systemSetting.findFirst({ where: eq(systemSetting.key, key) });
  return row?.value ?? null;
}

export async function setSystemSetting(key: string, value: string): Promise<void> {
  await db
    .insert(systemSetting)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: systemSetting.key, set: { value, updatedAt: new Date() } });
}

const ALL_TRACKS = [
  "ai_ml_engineer",
  "ml_engineer",
  "backend_engineer",
  "frontend_engineer",
  "full_stack_engineer",
  "mobile_engineer",
  "devops_engineer",
  "data_analyst",
  "qa_engineer",
];

// Tracks enabled out-of-the-box before any admin configuration
const DEFAULT_ENABLED = new Set(["ai_ml_engineer"]);

export async function getDisabledTracks(): Promise<string[]> {
  const raw = await getSystemSetting("disabled_tracks");
  if (raw === null) {
    // No admin config yet — everything except the founding track is coming soon
    return ALL_TRACKS.filter((t) => !DEFAULT_ENABLED.has(t));
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}