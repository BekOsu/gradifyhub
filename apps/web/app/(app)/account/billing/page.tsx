import Link from "next/link";
import { requireAuth } from "~/lib/auth/session";
import { getSubscription } from "~/actions/billing";
import { Zap } from "lucide-react";

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  cancelled: "Cancelled",
  past_due: "Past due",
  paused: "Paused",
};

function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(date));
}

export default async function AccountBillingPage() {
  await requireAuth();
  const sub = await getSubscription();

  const plan = sub?.plan ?? "free";
  const status = sub?.status ?? "active";
  const isPaid = plan !== "free";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your subscription and payment details.
        </p>
      </div>

      <section className="rounded-xl border p-6">
        <h2 className="mb-4 text-sm font-semibold">Current plan</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Plan</dt>
            <dd className="font-semibold">{PLAN_LABELS[plan] ?? plan}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Status</dt>
            <dd
              className={
                status === "active"
                  ? "font-medium text-green-600"
                  : status === "past_due"
                  ? "font-medium text-amber-500"
                  : "font-medium text-muted-foreground"
              }
            >
              {STATUS_LABELS[status] ?? status}
            </dd>
          </div>
          {sub?.currentPeriodEnd && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                {status === "cancelled" ? "Access until" : "Renews"}
              </dt>
              <dd className="font-medium">{formatDate(sub.currentPeriodEnd)}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6">
          {isPaid ? (
            <a
              href="https://app.lemonsqueezy.com/my-orders"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-full border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
            >
              Manage subscription
            </a>
          ) : (
            <div className="rounded-xl border border-brand-green/30 bg-brand-green/5 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-brand-green" />
                <span className="text-sm font-semibold">Upgrade to Pro — $10/mo</span>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Unlock the full lesson library, mock interviews, company intel, gig
                matching, and unlimited AI roadmaps.
              </p>
              <Link
                href="/pricing"
                className="inline-flex rounded-full bg-brand-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-green/90"
              >
                View pricing →
              </Link>
            </div>
          )}
        </div>
      </section>

      {isPaid && (
        <section className="rounded-xl border p-6">
          <h2 className="mb-2 text-sm font-semibold">Pro features included</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {[
              "Full lesson library (unlimited lessons/day)",
              "Unlimited AI roadmap regeneration",
              "Mock interview practice",
              "Company intel briefings",
              "Gig & job match feed",
              "Streak freeze (3 per month)",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-brand-green">✓</span> {f}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
