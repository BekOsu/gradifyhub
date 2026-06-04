"use server";

import { db } from "@repo/db/client";
import { coupon, couponRedemption, subscription } from "@repo/db/schema";
import { eq, and } from "@repo/db/drizzle";
import { requireAuth } from "~/lib/auth/session";
import { createCheckout } from "~/lib/billing/lemonsqueezy";
import { funnel } from "~/lib/analytics";
import { sendPaymentSuccessEmail } from "~/lib/email/resend";

// ─── Checkout ────────────────────────────────────────────────────────────────

export async function createCheckoutAction(
  plan: "pro",
  couponCode?: string,
): Promise<{ url: string } | { comingSoon: true }> {
  const user = await requireAuth();

  const normalizedCoupon =
    couponCode && /^[A-Z0-9-]{4,24}$/.test(couponCode.trim().toUpperCase())
      ? couponCode.trim().toUpperCase()
      : undefined;

  // ── 100% coupon bypass: grant plan directly without LemonSqueezy ──────────
  if (normalizedCoupon) {
    const couponRow = await db.query.coupon.findFirst({
      where: eq(coupon.code, normalizedCoupon),
    });

    if (
      couponRow &&
      couponRow.active &&
      couponRow.discountPct === 100 &&
      !(couponRow.expiresAt && couponRow.expiresAt < new Date()) &&
      !(couponRow.maxRedemptions !== null && couponRow.redeemedCount >= couponRow.maxRedemptions)
    ) {
      const alreadyUsed = await db.query.couponRedemption.findFirst({
        where: and(eq(couponRedemption.couponId, couponRow.id), eq(couponRedemption.userId, user.id)),
      });

      if (!alreadyUsed) {
        // Grant plan directly
        await db
          .insert(subscription)
          .values({ id: crypto.randomUUID(), userId: user.id, plan, status: "active" })
          .onConflictDoUpdate({ target: subscription.userId, set: { plan, status: "active" } });

        // Record redemption + increment counter
        await db.insert(couponRedemption).values({
          id: crypto.randomUUID(),
          couponId: couponRow.id,
          userId: user.id,
        });
        await db
          .update(coupon)
          .set({ redeemedCount: couponRow.redeemedCount + 1 })
          .where(eq(coupon.id, couponRow.id));

        sendPaymentSuccessEmail({ to: user.email, name: user.name }).catch((err) =>
          console.error("[email] payment success failed:", err)
        );
        funnel.checkoutInitiated(user.id, plan).catch((err) =>
          console.error("[analytics] checkout_initiated failed:", err)
        );

        return { url: "/dashboard?payment=success" };
      }
    }
  }

  // ── Standard LemonSqueezy checkout path ───────────────────────────────────
  const variantId = process.env.LEMONSQUEEZY_VARIANT_PRO_MONTHLY || process.env.LEMONSQUEEZY_VARIANT_PRO;
  if (!variantId) {
    throw new Error("Payment service is not configured. Please contact support.");
  }

  funnel.checkoutInitiated(user.id, plan).catch((err) =>
    console.error("[analytics] checkout_initiated failed:", err)
  );

  const url = await createCheckout(user.id, user.email, variantId, normalizedCoupon);
  if (url === "__coming_soon__") return { comingSoon: true };
  return { url };
}

// ─── Coupon validation ───────────────────────────────────────────────────────

export async function validateCouponAction(code: string): Promise<{
  valid: boolean;
  message: string;
  discountPct?: number;
  discountLabel?: string;
}> {
  const normalized = code.trim().toUpperCase();

  if (!normalized || !/^[A-Z0-9-]{4,24}$/.test(normalized)) {
    return { valid: false, message: "Invalid coupon format." };
  }

  const row = await db.query.coupon.findFirst({
    where: eq(coupon.code, normalized),
  });

  if (!row || !row.active) {
    return { valid: false, message: "Coupon not found or inactive." };
  }

   if (row.expiresAt && row.expiresAt < new Date()) {
     return { valid: false, message: "This coupon has expired." };
   }

   if (row.maxRedemptions !== null && row.redeemedCount >= row.maxRedemptions) {
     return { valid: false, message: "This coupon has reached its usage limit." };
   }

   // If logged in, enforce one redemption per user.
   let currentUserId: string | undefined;
   try {
     const user = await requireAuth();
     currentUserId = user.id;
     const alreadyUsed = await db.query.couponRedemption.findFirst({
       where: and(eq(couponRedemption.couponId, row.id), eq(couponRedemption.userId, user.id)),
     });
     if (alreadyUsed) {
       return { valid: false, message: "You have already used this coupon." };
     }
   } catch {
     // Not logged in; validate format + availability only.
   }

   // Track coupon validation
   funnel.couponValidated(currentUserId, normalized, row.discountPct).catch((err) =>
     console.error("[analytics] coupon_validated failed:", err)
   );

   return {
     valid: true,
     discountPct: row.discountPct,
     discountLabel: `${row.discountPct}% off`,
     message: `${row.discountPct}% discount applied! ${row.note ? `(${row.note})` : ""}`.trim(),
   };
}

// ─── Subscription ────────────────────────────────────────────────────────────

export async function getSubscription() {
  const user = await requireAuth();

  const row = await db.query.subscription.findFirst({
    where: eq(subscription.userId, user.id),
  });

  return row ?? null;
}
