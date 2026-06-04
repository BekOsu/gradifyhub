import { notFound } from "next/navigation";
import { db } from "@repo/db/client";
import { user, subscription, attempt, lessonProgress, coupon } from "@repo/db/schema";
import { eq, and, isNotNull, count } from "@repo/db/drizzle";
import { AdminUserActions } from "~/components/admin/user-actions";
import { UserCouponForm } from "~/components/admin/user-coupon-form";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [row] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      plan: subscription.plan,
      subStatus: subscription.status,
    })
    .from(user)
    .leftJoin(subscription, eq(subscription.userId, user.id))
    .where(eq(user.id, id))
    .limit(1);

  if (!row) notFound();

  const [assessmentCount, lessonCount, activeCoupons] = await Promise.all([
    db
      .select({ n: count() })
      .from(attempt)
      .where(and(eq(attempt.userId, id), isNotNull(attempt.completedAt)))
      .then((r) => r[0]?.n ?? 0),
    db
      .select({ n: count() })
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, id), isNotNull(lessonProgress.completedAt)))
      .then((r) => r[0]?.n ?? 0),
    db.query.coupon.findMany({
      where: eq(coupon.active, true),
      columns: { code: true, discountPct: true, note: true },
    }),
  ]);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{row.name}</h1>
        <p className="text-sm text-muted-foreground">{row.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Plan", value: row.plan ?? "free" },
          { label: "Assessments", value: String(assessmentCount) },
          { label: "Lessons done", value: String(lessonCount) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-lg font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <AdminUserActions userId={id} currentPlan={(row.plan as "free" | "pro") ?? "free"} currentStatus={row.subStatus ?? "active"} userName={row.name} userEmail={row.email} />
      <UserCouponForm userId={id} coupons={activeCoupons} />
    </div>
  );
}

