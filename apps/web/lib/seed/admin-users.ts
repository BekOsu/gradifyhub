import { eq } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { user } from "@repo/db/schema";

function getEmailsFromEnv(envKey: string): string[] {
  const envValue = process.env[envKey];
  if (!envValue) return [];

  return envValue
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

export async function seedAdminUsers(): Promise<void> {
  const adminEmails = getEmailsFromEnv("ADMIN_EMAILS");
  const superadminEmails = getEmailsFromEnv("SUPERADMIN_EMAILS");

  if (adminEmails.length === 0 && superadminEmails.length === 0) return;

  for (const email of adminEmails) {
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (existingUser) {
      if (existingUser.role !== "admin" && existingUser.role !== "superadmin") {
        await db
          .update(user)
          .set({ role: "admin" })
          .where(eq(user.id, existingUser.id));
      }
    }
  }

  for (const email of superadminEmails) {
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (existingUser) {
      if (existingUser.role !== "superadmin") {
        await db
          .update(user)
          .set({ role: "superadmin" })
          .where(eq(user.id, existingUser.id));
      }
    }
  }
}