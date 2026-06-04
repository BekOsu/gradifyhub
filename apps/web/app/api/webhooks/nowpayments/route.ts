import crypto from "crypto";
import { db } from "@repo/db/client";
import { subscription } from "@repo/db/schema";
import { eq } from "@repo/db/drizzle";

export async function POST(request: Request) {
  let body: string;
  try {
    body = await request.text();
  } catch {
    return Response.json({ error: "Failed to read request body" }, { status: 400 });
  }

  // Verify HMAC-SHA512 signature over alphabetically sorted JSON keys
  const sig = request.headers.get("x-nowpayments-sig") ?? "";

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(body);
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sorted = JSON.stringify(parsed, Object.keys(parsed).sort());
  const hmac = crypto.createHmac("sha512", process.env.NOWPAYMENTS_IPN_SECRET!);
  hmac.update(sorted);
  const digest = hmac.digest("hex");

  if (digest !== sig) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    if (parsed.payment_status !== "finished") {
      // Only act on completed payments
      return Response.json({ received: true }, { status: 200 });
    }

    // order_description format: "gradifyhub-{userId}-{plan}"
    const orderDescription = typeof parsed.order_description === "string"
      ? parsed.order_description
      : "";
    const match = orderDescription.match(/^gradifyhub-(.+)-(pro)$/);
    if (!match) {
      console.warn("[nowpayments webhook] unrecognised order_description:", orderDescription);
      return Response.json({ received: true }, { status: 200 });
    }

    const userId = match[1]!;
    const plan = match[2] as "pro";
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const existing = await db.query.subscription.findFirst({
      where: eq(subscription.userId, userId),
    });

    if (existing) {
      await db
        .update(subscription)
        .set({
          plan,
          status: "active",
          lsSubscriptionId: null,
          currentPeriodEnd: periodEnd,
          updatedAt: new Date(),
        })
        .where(eq(subscription.userId, userId));
    } else {
      await db.insert(subscription).values({
        id: crypto.randomUUID(),
        userId,
        plan,
        status: "active",
        lsSubscriptionId: null,
        currentPeriodEnd: periodEnd,
      });
    }

    return Response.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("[nowpayments webhook]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
