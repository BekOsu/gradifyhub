import { requireAuth } from "~/lib/auth/session";
import { getUserPlan } from "~/lib/billing/hasFeature";
import { getIntegration } from "~/lib/openrouter/token";
import { PageHeader } from "@repo/ui/page-header";
import {
  getMonthlySpendMicroUsd,
  getMonthlyRequestCount,
  getMonthlySpendByFeature,
  getRecentUsageLogs,
} from "@repo/db/queries/openrouter";
import Link from "next/link";

function formatMicroUsd(microUsd: number): string {
  if (microUsd === 0) return "$0.00";
  if (microUsd < 1000) return `< $0.001`;
  return `$${(microUsd / 1_000_000).toFixed(4)}`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

const FEATURE_LABELS: Record<string, string> = {
  assessment: "Assessment",
  lesson: "Lessons",
  interview_prep: "Interview Prep",
  roadmap: "Roadmap",
  resume: "Resume",
};

export default async function UsagePage() {
  const user = await requireAuth();

  const [plan, integration, totalMicroUsd, totalRequests, byFeature, recent] = await Promise.all([
    getUserPlan(user.id),
    getIntegration(user.id),
    getMonthlySpendMicroUsd(user.id),
    getMonthlyRequestCount(user.id),
    getMonthlySpendByFeature(user.id),
    getRecentUsageLogs(user.id, 20),
  ]);

  const isPaid = plan === "pro";
  const budgetCents = integration?.monthlyBudgetCents ?? null;
  const budgetMicroUsd = budgetCents ? budgetCents * 10_000 : null;
  const budgetPct =
    budgetMicroUsd && budgetMicroUsd > 0
      ? Math.min(100, Math.round((totalMicroUsd / budgetMicroUsd) * 100))
      : null;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        title="Usage"
        description={`AI usage for ${new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date())}.`}
      />

      {isPaid && (
        <div className="rounded-xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Your Pro plan includes managed AI — no per-call charges
          to you.
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total spend
          </p>
          <p className="mt-1 text-xl font-semibold">{formatMicroUsd(totalMicroUsd)}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Requests
          </p>
          <p className="mt-1 text-xl font-semibold">{totalRequests}</p>
        </div>
        {budgetCents !== null && (
          <div className="rounded-xl border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Budget
            </p>
            <p className="mt-1 text-xl font-semibold">${(budgetCents / 100).toFixed(2)}</p>
            {budgetPct !== null && (
              <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                <div
                  className={`h-1.5 rounded-full ${budgetPct >= 90 ? "bg-destructive" : "bg-primary"}`}
                  style={{ width: `${budgetPct}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* By feature */}
      {byFeature.length > 0 && (
        <section className="rounded-xl border">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Spend by feature</h2>
          </div>
          <div className="divide-y">
            {byFeature.map((row: (typeof byFeature)[number]) => (
              <div key={row.feature} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>{FEATURE_LABELS[row.feature] ?? row.feature}</span>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span>{row.requests} req</span>
                  <span className="font-medium text-foreground">{formatMicroUsd(row.costMicroUsd)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent activity */}
      {recent.length > 0 && (
        <section className="rounded-xl border">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Recent activity</h2>
          </div>
          <div className="divide-y">
            {recent.map((entry: (typeof recent)[number]) => (
              <div key={entry.id} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {FEATURE_LABELS[entry.feature] ?? entry.feature}
                  </span>
                  <span className="text-muted-foreground">{formatMicroUsd(entry.costMicroUsd)}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="truncate max-w-[180px]">{entry.model}</span>
                  <span>{entry.inputTokens + entry.outputTokens} tokens</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                      entry.source === "byok"
                        ? "bg-blue-500/10 text-blue-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {entry.source === "byok" ? "your key" : "managed"}
                  </span>
                  <span className="ml-auto">{formatDate(entry.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {recent.length === 0 && (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No usage recorded yet this month.
          {!isPaid && !integration?.connected && (
            <p className="mt-2">
              <Link href="/settings/openrouter" className="underline underline-offset-2">
                Connect OpenRouter
              </Link>{" "}
              to start tracking.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
