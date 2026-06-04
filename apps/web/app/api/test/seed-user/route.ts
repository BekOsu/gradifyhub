import { NextRequest, NextResponse } from "next/server";

// Safety guard: this endpoint is ONLY active outside production.
// It creates a fully-verified user so Playwright e2e tests can sign in
// without needing a real email inbox.
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const { email, password, name } = (await req.json()) as {
    email: string;
    password: string;
    name?: string;
  };

  if (!email || !password) {
    return NextResponse.json({ error: "email and password required" }, { status: 400 });
  }

  const { db } = await import("@repo/db/client");
  const { user, account } = await import("@repo/db/schema");
  const { eq } = await import("@repo/db/drizzle");
  // Use Better Auth's public crypto export so the dev-only test seeding route
  // keeps working across package export changes.
  const mod = await import("better-auth/crypto");
  const hashPassword: (p: string) => Promise<string> = mod.hashPassword;

  const existing = await db.query.user.findFirst({
    where: eq(user.email, email),
    columns: { id: true },
  });
  if (existing) {
    return NextResponse.json({ ok: true, userId: existing.id, created: false });
  }

  const userId = crypto.randomUUID();
  const hash = await hashPassword(password);

  await db.insert(user).values({
    id: userId,
    name: name ?? email.split("@")[0]!,
    email,
    emailVerified: true, // bypass email verification for tests
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.insert(account).values({
    id: crypto.randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: hash,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return NextResponse.json({ ok: true, userId, created: true });
}
