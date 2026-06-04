import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { db } from "@repo/db/client";
import { openrouterIntegration } from "@repo/db/schema";
import { eq } from "@repo/db/drizzle";

function getEncryptionKey(): Buffer {
  const raw = process.env.OPENROUTER_ENCRYPTION_KEY;
  if (!raw) throw new Error("OPENROUTER_ENCRYPTION_KEY is not set");
  const buf = Buffer.from(raw, "base64");
  if (buf.length !== 32) throw new Error("OPENROUTER_ENCRYPTION_KEY must decode to exactly 32 bytes");
  return buf;
}

// Format: {iv_base64url}.{authTag_base64url}.{ciphertext_base64url}
export function encryptApiKey(apiKey: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12); // 96-bit IV for AES-256-GCM
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(apiKey, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${authTag.toString("base64url")}.${ciphertext.toString("base64url")}`;
}

export function decryptApiKey(encrypted: string): string {
  const key = getEncryptionKey();
  const parts = encrypted.split(".");
  if (parts.length !== 3) throw new Error("Invalid encrypted key format");
  const [ivB64, tagB64, ctB64] = parts as [string, string, string];
  const iv = Buffer.from(ivB64, "base64url");
  const authTag = Buffer.from(tagB64, "base64url");
  const ciphertext = Buffer.from(ctB64, "base64url");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

export async function getIntegration(userId: string) {
  return db.query.openrouterIntegration.findFirst({
    where: eq(openrouterIntegration.userId, userId),
  });
}

export async function saveIntegration(
  userId: string,
  apiKey: string,
  monthlyBudgetCents?: number,
): Promise<void> {
  const encryptedKey = encryptApiKey(apiKey);
  await db
    .insert(openrouterIntegration)
    .values({
      id: crypto.randomUUID(),
      userId,
      encryptedKey,
      connected: true,
      monthlyBudgetCents: monthlyBudgetCents ?? null,
    })
    .onConflictDoUpdate({
      target: openrouterIntegration.userId,
      set: { encryptedKey, connected: true, updatedAt: new Date() },
    });
}

export async function removeIntegration(userId: string): Promise<void> {
  await db.delete(openrouterIntegration).where(eq(openrouterIntegration.userId, userId));
}

export async function updateBudget(userId: string, monthlyBudgetCents: number | null): Promise<void> {
  await db
    .update(openrouterIntegration)
    .set({ monthlyBudgetCents, updatedAt: new Date() })
    .where(eq(openrouterIntegration.userId, userId));
}

export async function getDecryptedApiKey(userId: string): Promise<string | null> {
  const row = await getIntegration(userId);
  if (!row?.connected) return null;
  return decryptApiKey(row.encryptedKey);
}
