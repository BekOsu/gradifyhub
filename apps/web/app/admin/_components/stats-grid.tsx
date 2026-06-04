import { db } from "@repo/db/client";
import { and, count, eq, isNotNull } from "@repo/db/drizzle";
import { attempt, subscription, user } from "@repo/db/schema";

export async function StatsGrid() {
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
        >
          <p className="text-3xl font-bold tracking-tight text-gray-900">
            {m.value}
          </p>
          <p className="mt-2 text-sm text-gray-600">{m.label}</p>
        </div>
      ))}
    </div>
  );
}
