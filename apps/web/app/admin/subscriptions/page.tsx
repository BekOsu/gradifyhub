import { db } from "@repo/db/client";
import { subscription, user } from "@repo/db/schema";
import { eq, desc } from "@repo/db/drizzle";

export default async function AdminSubscriptionsPage() {
  const rows = await db
    .select({
      userId: subscription.userId,
      plan: subscription.plan,
      status: subscription.status,
      lsId: subscription.lsSubscriptionId,
      periodEnd: subscription.currentPeriodEnd,
      updatedAt: subscription.updatedAt,
      name: user.name,
      email: user.email,
    })
    .from(subscription)
    .leftJoin(user, eq(user.id, subscription.userId))
    .orderBy(desc(subscription.updatedAt))
    .limit(200);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="text-sm text-muted-foreground">{rows.length} loaded</p>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">User</th>
              <th className="px-4 py-3 text-left font-semibold">Plan</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">LS ID</th>
              <th className="px-4 py-3 text-left font-semibold">Renews</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No subscriptions yet
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.userId} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    {r.name ? (
                      <>
                        <p className="font-medium">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.email}</p>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">User deleted (orphaned)</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      r.plan === "pro"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {r.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.status}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {r.lsId ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.periodEnd ? r.periodEnd.toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

