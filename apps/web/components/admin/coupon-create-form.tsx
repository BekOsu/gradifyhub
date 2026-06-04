"use client";

import { useState, useEffect } from "react";
import { adminCreateCoupon } from "~/actions/coupons";

export function CouponCreateForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [success]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const fd = new FormData(e.currentTarget);
    const result = await adminCreateCoupon(fd);
    if (!result.success) {
      setError(result.error ?? "Failed to create coupon");
    } else {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border p-6 space-y-4">
      <h2 className="font-semibold">Create coupon</h2>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-600">Coupon created ✓</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium">Code *</label>
          <input name="code" required placeholder="EARLYACCESS" className="rounded-md border px-3 py-2 text-sm uppercase" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium">Discount % *</label>
          <input name="discountPct" required type="number" min={1} max={100} placeholder="20" className="rounded-md border px-3 py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium">Max uses (blank = ∞)</label>
          <input name="maxRedemptions" type="number" min={1} placeholder="50" className="rounded-md border px-3 py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium">Expires (blank = never)</label>
          <input name="expiresAt" type="date" className="rounded-md border px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium">Note (admin only)</label>
        <input name="note" placeholder="e.g. Beta launch batch" className="rounded-md border px-3 py-2 text-sm" />
      </div>

      <button type="submit" className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
        Create coupon
      </button>
    </form>
  );
}

