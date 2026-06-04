import { db } from "@repo/db/client";
import { verification } from "@repo/db/schema";
import { eq, and, lte } from "@repo/db/drizzle";
import { getCurrentUser } from "~/lib/auth/session";
import { generateCodeVerifier, generateCodeChallenge, buildOpenRouterAuthUrl } from "~/lib/openrouter/pkce";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.redirect(new URL("/sign-in?from=/settings/openrouter", APP_URL));
  }

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const identifier = `openrouter:pkce:${user.id}`;

  // Remove any stale PKCE entries for this user before inserting a fresh one
  await db.delete(verification).where(
    and(
      eq(verification.identifier, identifier),
      lte(verification.expiresAt, new Date()),
    ),
  );
  await db.delete(verification).where(eq(verification.identifier, identifier));

  await db.insert(verification).values({
    id: crypto.randomUUID(),
    identifier,
    value: codeVerifier,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
  });

  const callbackUrl = new URL("/api/openrouter/callback", APP_URL).toString();
  const authUrl = buildOpenRouterAuthUrl(callbackUrl, codeChallenge);

  return Response.redirect(authUrl);
}
