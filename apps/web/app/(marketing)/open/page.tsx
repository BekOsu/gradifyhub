import type { Metadata } from "next";
import { db } from "@repo/db/client";
import { and, count, eq, isNotNull } from "@repo/db/drizzle";
import { attempt, subscription, user } from "@repo/db/schema";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Open — GradifyHub",
  description: "Live metrics from GradifyHub.",
};

export default async function OpenPage() {
  const totalUsersResult = await db.select({ value: count() }).from(user);
  const totalUsers = totalUsersResult[0]?.value ?? 0;

  const activeSubs = await db
    .select({ plan: subscription.plan })
    .from(subscription)
    .where(and(eq(subscription.status, "active"), isNotNull(subscription.plan)));

  const paidSubs = activeSubs.filter((s) => s.plan !== "free");
  const paidUsers = paidSubs.length;
  const proCount = paidSubs.filter((s) => s.plan === "pro").length;
  const mrr = proCount * 10;

  const completedAssessmentsResult = await db
    .select({ value: count() })
    .from(attempt)
    .where(isNotNull(attempt.completedAt));
  const completedAssessments = completedAssessmentsResult[0]?.value ?? 0;

  const metrics = [
    {
      value: `$${mrr.toLocaleString()}`,
      label: "Monthly Recurring Revenue",
    },
    {
      value: totalUsers.toLocaleString(),
      label: "Registered users",
    },
    {
      value: paidUsers.toLocaleString(),
      label: "Paying subscribers",
    },
    {
      value: completedAssessments.toLocaleString(),
      label: "Skill assessments completed",
    },
  ];

  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <header className="mb-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">GradifyHub</p>
          <h1 className="text-3xl font-bold tracking-tight">Open</h1>
          <p className="mt-3 text-base text-muted-foreground">
            We build in public. Here&apos;s exactly how GradifyHub is doing.
          </p>
          <p className="mt-1 text-sm text-muted-foreground/50">Stats update hourly.</p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-2xl border p-8 transition-shadow hover:shadow-lift">
              <p className="text-4xl font-bold tracking-tight">{m.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>

        <section className="mt-16 border-t pt-14">
          <h2 className="text-xl font-semibold">Why we share this</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We believe the best products are built in public. Sharing real
            numbers keeps us accountable and helps prospective users understand
            where the platform is headed.
          </p>
        </section>

        <p className="mt-12 text-xs text-muted-foreground/50">
          Numbers are live from our database, updated hourly. No rounding, no
          cherry-picking.
        </p>
      </div>
    </div>
  );
}
