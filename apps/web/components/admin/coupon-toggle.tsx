"use client";

import { useTransition } from "react";
import { adminToggleCoupon } from "~/actions/coupons";

export function CouponToggle({ couponId, active }: { couponId: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => adminToggleCoupon(couponId, !active))}
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
        active ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </button>
  );
}

