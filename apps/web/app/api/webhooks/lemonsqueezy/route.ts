import crypto from "crypto";
import { db } from "@repo/db/client";
import { subscription, user, coupon, couponRedemption } from "@repo/db/schema";
import { eq, and, sql } from "@repo/db/drizzle";
import { getPlanFromVariantId } from "~/lib/billing/lemonsqueezy";
import { sendPaymentSuccessEmail } from "~/lib/email/resend";

export async function POST(request: Request) {
  let body: string;
  try {
    body = await request.text();
  } catch {
    return Response.json({ error: "Failed to read request body" }, { status: 400 });
  }

  // Verify HMAC-SHA256 signature before processing
  const sig = request.headers.get("X-Signature") ?? "";
  const hmac = crypto.createHmac("sha256", process.env.LEMONSQUEEZY_WEBHOOK_SECRET!);
  hmac.update(body);
  const digest = hmac.digest("hex");

  let signatureValid = false;
  try {
    signatureValid = crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(sig));
  } catch {
    // Buffers of different length throw — treat as invalid
    signatureValid = false;
  }

  if (!signatureValid) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw webhook payload, shape verified below
    const payload = JSON.parse(body) as any;

    const eventName: string = payload?.meta?.event_name;
    const userId: string = payload?.meta?.custom_data?.user_id;
    const lsSubscriptionId: string = payload?.data?.id;
    const attributes = payload?.data?.attributes ?? {};

    if (!userId || typeof userId !== "string") {
      return Response.json({ error: "Missing user_id" }, { status: 400 });
    }

    switch (eventName) {
      case "subscription_created": {
        // Idempotency: skip if we already recorded this subscription ID
        const duplicate = await db.query.subscription.findFirst({
          where: eq(subscription.lsSubscriptionId, lsSubscriptionId),
        });
        if (duplicate) {
          return Response.json({ received: true }, { status: 200 });
        }

        const plan = getPlanFromVariantId(String(attributes.variant_id));
        const periodEnd = new Date(attributes.renews_at ?? attributes.ends_at);

        const existing = await db.query.subscription.findFirst({
          where: eq(subscription.userId, userId),
        });

        if (existing) {
          await db
            .update(subscription)
            .set({
              plan,
              status: "active",
              lsSubscriptionId,
              lsCustomerId: String(attributes.customer_id),
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
            lsSubscriptionId,
            lsCustomerId: String(attributes.customer_id),
            currentPeriodEnd: periodEnd,
          });
        }

        // Track coupon redemption if present
        const couponCode = payload?.meta?.custom_data?.coupon_code;
        if (couponCode && typeof couponCode === "string") {
          const couponRow = await db.query.coupon.findFirst({
            where: eq(coupon.code, couponCode.toUpperCase()),
          });

          if (couponRow) {
            // Check if this user already redeemed this coupon
            const alreadyRedeemed = await db.query.couponRedemption.findFirst({
              where: and(eq(couponRedemption.couponId, couponRow.id), eq(couponRedemption.userId, userId)),
            });

            if (!alreadyRedeemed) {
              // Insert redemption record
              await db.insert(couponRedemption).values({
                id: crypto.randomUUID(),
                couponId: couponRow.id,
                userId,
                redeemedAt: new Date(),
              });

              // Increment coupon redemption count atomically (prevents read-modify-write race)
              await db
                .update(coupon)
                .set({ redeemedCount: sql`${coupon.redeemedCount} + 1` })
                .where(eq(coupon.id, couponRow.id));
            }
          }
        }

        try {
          const u = await db.query.user.findFirst({ where: eq(user.id, userId) });
          if (u) await sendPaymentSuccessEmail({ to: u.email, name: u.name });
        } catch (emailErr) {
          console.error("[email] payment success failed:", emailErr);
          // Non-fatal — don't fail the webhook response
        }

        break;
      }

      case "subscription_updated": {
        const periodEnd = new Date(attributes.renews_at ?? attributes.ends_at);
        await db
          .update(subscription)
          .set({
            status: attributes.status ?? "active",
            currentPeriodEnd: periodEnd,
            updatedAt: new Date(),
          })
          .where(eq(subscription.userId, userId));
        break;
      }

      case "subscription_cancelled": {
        await db
          .update(subscription)
          .set({ status: "cancelled", updatedAt: new Date() })
          .where(eq(subscription.userId, userId));
        break;
      }

      case "subscription_expired": {
        await db
          .update(subscription)
          .set({ status: "cancelled", plan: "free", updatedAt: new Date() })
          .where(eq(subscription.userId, userId));
        break;
      }

      case "subscription_payment_success": {
        const periodEnd = new Date(attributes.renews_at ?? attributes.ends_at);
        await db
          .update(subscription)
          .set({ currentPeriodEnd: periodEnd, updatedAt: new Date() })
          .where(eq(subscription.userId, userId));
        break;
      }

      case "subscription_payment_failed": {
        await db
          .update(subscription)
          .set({ status: "past_due", updatedAt: new Date() })
          .where(eq(subscription.userId, userId));
        break;
      }

      default:
        // Unknown event — acknowledge without action
        break;
    }

    return Response.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("[lemonsqueezy webhook]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
