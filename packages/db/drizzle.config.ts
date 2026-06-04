import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: "../../apps/web/.env.local" });

function normalizeDatabaseUrl(databaseUrl: string): string {
  const url = new URL(databaseUrl);
  const sslMode = url.searchParams.get("sslmode");
  const usesCompat = url.searchParams.get("uselibpqcompat");

  if (
    sslMode &&
    ["prefer", "require", "verify-ca"].includes(sslMode) &&
    usesCompat !== "true"
  ) {
    url.searchParams.set("uselibpqcompat", "true");
  }

  return url.toString();
}

export default defineConfig({
  schema: "./schema.ts",
  out: "../../apps/web/drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: normalizeDatabaseUrl(process.env.DATABASE_URL!),
  },
});