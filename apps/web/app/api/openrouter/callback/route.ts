import { type NextRequest } from "next/server";
import { db } from "@repo/db/client";
import { verification } from "@repo/db/schema";
import { eq, and, gte } from "@repo/db/drizzle";
import { getCurrentUser } from "~/lib/auth/session";
import { saveIntegration } from "~/lib/openrouter/token";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function settingsUrl(params: Record<string, string>): string {
  const u = new URL("/settings/openrouter", APP_URL);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return u.toString();
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.redirect(new URL("/sign-in?from=/settings/openrouter", APP_URL));
  }

  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return Response.redirect(settingsUrl({ error: "no_code" }));
  }

  const identifier = `openrouter:pkce:${user.id}`;
  const pkceRow = await db.query.verification.findFirst({
    where: and(
      eq(verification.identifier, identifier),
      gte(verification.expiresAt, new Date()),
    ),
  });

  if (!pkceRow) {
    return Response.redirect(settingsUrl({ error: "expired" }));
  }

  let apiKey: string;
  try {
    const resp = await fetch("https://openrouter.ai/api/v1/auth/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, code_verifier: pkceRow.value }),
    });

    if (!resp.ok) {
      return Response.redirect(settingsUrl({ error: "exchange_failed" }));
    }

    const json = (await resp.json()) as { key?: string };
    if (!json.key) {
      return Response.redirect(settingsUrl({ error: "exchange_failed" }));
    }
    apiKey = json.key;
  } catch {
    return Response.redirect(settingsUrl({ error: "exchange_failed" }));
  }

  await saveIntegration(user.id, apiKey);
  await db.delete(verification).where(eq(verification.id, pkceRow.id));

  return Response.redirect(settingsUrl({ connected: "true" }));
}
