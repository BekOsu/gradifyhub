"use client";

import { useState, useTransition } from "react";
import { adminSendCoupon } from "~/actions/admin";

interface CouponOption {
  code: string;
  discountPct: number;
  note: string | null;
}

export function UserCouponForm({
  userId,
  coupons,
}: {
  userId: string;
  coupons: CouponOption[];
}) {
  const [selected, setSelected] = useState(coupons[0]?.code ?? "");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSend() {
    if (!selected) return;
    setMessage(null);
    startTransition(async () => {
      const result = await adminSendCoupon(userId, selected);
      setMessage(
        result.success
          ? { text: `Coupon ${selected} sent successfully.`, ok: true }
          : { text: result.error ?? "Failed to send.", ok: false },
      );
    });
  }

  if (coupons.length === 0) {
    return (
      <div className="rounded-xl border p-6 space-y-2">
        <p className="font-semibold">Send coupon</p>
        <p className="text-sm text-muted-foreground">
          No active coupons available. Create one in{" "}
          <a href="/admin/coupons" className="underline underline-offset-4 hover:text-foreground">
            /admin/coupons
          </a>{" "}
          first.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-6 space-y-4">
      <div>
        <p className="font-semibold">Send coupon by email</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Sends the discount code to the user&apos;s registered email. They apply it on the pricing page at checkout.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1">
          <label className="block text-xs font-medium text-muted-foreground">Select coupon</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isPending}
          >
            {coupons.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.discountPct}% off{c.note ? ` (${c.note})` : ""}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={isPending || !selected}
          className="shrink-0 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "Sending…" : "Send coupon"}
        </button>
      </div>

      {message && (
        <p className={`text-sm font-medium ${message.ok ? "text-green-600" : "text-destructive"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
