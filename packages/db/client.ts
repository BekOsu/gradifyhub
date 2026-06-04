import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

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

const pool = new Pool({
  connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL!),
  max: 5,
});

export const db = drizzle(pool, { schema });