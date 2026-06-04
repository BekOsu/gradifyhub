"use server";

import { db } from "@repo/db/client";
import { coupon } from "@repo/db/schema";
import { eq } from "@repo/db/drizzle";
import { requireAdmin } from "~/lib/auth/permissions";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CouponInput = z.object({
  code: z.string().min(4).max(24).regex(/^[A-Z0-9-]+$/, "Use uppercase letters, numbers, dashes"),
  discountPct: z.coerce.number().int().min(1).max(100),
  maxRedemptions: z.coerce.number().int().positive().nullable(),
  expiresAt: z.string().optional().nullable(),
  note: z.string().max(100).optional(),
});

export async function adminCreateCoupon(formData: FormData) {
  await requireAdmin();

  const raw = {
    code: String(formData.get("code") ?? "").trim().toUpperCase(),
    discountPct: formData.get("discountPct"),
    maxRedemptions: formData.get("maxRedemptions") || null,
    expiresAt: formData.get("expiresAt") || null,
    note: formData.get("note") || undefined,
  };

  const parsed = CouponInput.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const { code, discountPct, maxRedemptions, expiresAt, note } = parsed.data;

  await db.insert(coupon).values({
    id: crypto.randomUUID(),
    code,
    discountPct,
    maxRedemptions: maxRedemptions ?? null,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    note: note ?? null,
    active: true,
  });

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function adminToggleCoupon(couponId: string, active: boolean) {
  await requireAdmin();

  await db.update(coupon).set({ active }).where(eq(coupon.id, couponId));
  revalidatePath("/admin/coupons");
}

