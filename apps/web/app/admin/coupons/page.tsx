import { db } from "@repo/db/client";
import { coupon } from "@repo/db/schema";
import { desc } from "@repo/db/drizzle";
import { CouponCreateForm } from "~/components/admin/coupon-create-form";
import { CouponToggle } from "~/components/admin/coupon-toggle";

export default async function AdminCouponsPage() {
  const coupons = await db.query.coupon.findMany({
    orderBy: [desc(coupon.createdAt)],
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Coupons</h1>

      <CouponCreateForm />

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Code</th>
              <th className="px-4 py-3 text-left font-semibold">Discount</th>
              <th className="px-4 py-3 text-left font-semibold">Used / Max</th>
              <th className="px-4 py-3 text-left font-semibold">Expires</th>
              <th className="px-4 py-3 text-left font-semibold">Note</th>
              <th className="px-4 py-3 text-left font-semibold">Active</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                <td className="px-4 py-3">{c.discountPct}%</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span>{c.redeemedCount} / {c.maxRedemptions ?? "∞"}</span>
                    {c.maxRedemptions && c.redeemedCount >= c.maxRedemptions && (
                      <span className="text-xs bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded font-semibold">
                        EXHAUSTED
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {c.expiresAt ? c.expiresAt.toLocaleDateString() : "Never"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.note ?? "—"}</td>
                <td className="px-4 py-3">
                  <CouponToggle couponId={c.id} active={c.active} />
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No coupons yet. Create one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

