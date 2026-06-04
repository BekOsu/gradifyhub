import { requireAuth } from "~/lib/auth/session";
import { getIntegration, decryptApiKey } from "~/lib/openrouter/token";
import { getUserPlan } from "~/lib/billing/hasFeature";
import { getMonthlySpendMicroUsd, getModelPreference } from "@repo/db/queries/openrouter";
import { PageHeader } from "@repo/ui/page-header";
import { OpenRouterConnectedSection } from "~/components/app/openrouter-connected-section";
import { OpenRouterModelPicker } from "~/components/app/openrouter-model-picker";
import { fetchORModels, TASK_DEFAULTS } from "~/lib/openrouter/models";
import { getProAllowlist } from "~/lib/openrouter/router";
import Link from "next/link";

function formatMicroUsd(microUsd: number): string {
  return `$${(microUsd / 1_000_000).toFixed(4)}`;
}

function BudgetProgress({
  spentMicroUsd,
  budgetCents,
}: {
  spentMicroUsd: number;
  budgetCents: number | null;
}) {
  if (!budgetCents) return null;
  const budgetMicroUsd = budgetCents * 10_000;
  const pct = Math.min(100, Math.round((spentMicroUsd / budgetMicroUsd) * 100));
  const budgetLabel = `$${(budgetCents / 100).toFixed(2)}`;

  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Monthly spend</span>
        <span>
          {formatMicroUsd(spentMicroUsd)} / {budgetLabel}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className={`h-2 rounded-full transition-all ${pct >= 90 ? "bg-destructive" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default async function OpenRouterSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const user = await requireAuth();
  const { connected: justConnected, error } = await searchParams;

  const [plan, integration] = await Promise.all([
    getUserPlan(user.id),
    getIntegration(user.id),
  ]);

  const isPaid = plan === "pro";

  const features = Object.keys(TASK_DEFAULTS);
  let keyPreview: string | null = null;
  let monthlySpend = 0;
  const modelPreferences: Record<string, string> = {};
  let orModels: { id: string; name: string }[] = [];

  if (isPaid) {
    const allowlist = getProAllowlist();
    orModels = allowlist.map((id) => ({ id, name: id.split("/")[1] ?? id }));
    const prefRows = await Promise.all(features.map((f) => getModelPreference(user.id, f)));
    features.forEach((f, i) => {
      modelPreferences[f] = (prefRows[i] as string | null) ?? TASK_DEFAULTS[f] ?? "";
    });
  } else if (integration?.connected) {
    const [decrypted, spend, catalog, ...prefRows] = await Promise.all([
      decryptApiKey(user.id),
      getMonthlySpendMicroUsd(user.id),
      fetchORModels(),
      ...features.map((f) => getModelPreference(user.id, f)),
    ]);
    keyPreview = decrypted ? `${decrypted.slice(0, 12)}...` : null;
    monthlySpend = spend;
    orModels = catalog.map((m) => ({ id: m.id, name: m.name }));
    features.forEach((f, i) => {
      modelPreferences[f] = (prefRows[i] as string | null) ?? TASK_DEFAULTS[f] ?? "";
    });
  }

  const ERROR_MESSAGES: Record<string, string> = {
    no_code: "Authorization failed — no code returned from OpenRouter.",
    expired: "Connection timed out. Please try again.",
    exchange_failed: "Could not exchange authorization code. Please try again.",
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        title="AI Usage"
        description="Connect your OpenRouter account or view your managed plan status."
      />

      {justConnected === "true" && (
        <div className="rounded-xl border border-green-200 bg-green-500/5 px-4 py-3 text-sm text-green-700">
          OpenRouter connected successfully.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {ERROR_MESSAGES[error] ?? "Something went wrong. Please try again."}
        </div>
      )}

      {isPaid ? (
        <section className="rounded-xl border p-6 space-y-4">
          <div>
            <h2 className="mb-1 text-sm font-semibold">Managed AI</h2>
            <p className="text-sm text-muted-foreground">
              Your Pro plan includes managed AI inference — no
              setup needed. All LLM calls are handled by the platform.
            </p>
            <Link
              href="/usage"
              className="mt-4 inline-flex rounded-full border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
            >
              View usage
            </Link>
          </div>
          <OpenRouterModelPicker
            features={features}
            currentPreferences={modelPreferences}
            models={orModels}
          />
        </section>
      ) : integration?.connected ? (
        <section className="rounded-xl border p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold">OpenRouter connected</h2>
              {keyPreview && (
                <p className="mt-1 font-mono text-xs text-muted-foreground">{keyPreview}</p>
              )}
            </div>
            <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-700">
              Active
            </span>
          </div>

          <BudgetProgress
            spentMicroUsd={monthlySpend}
            budgetCents={integration.monthlyBudgetCents ?? null}
          />

          <OpenRouterConnectedSection
            currentBudgetCents={integration.monthlyBudgetCents ?? null}
            monthlySpendMicroUsd={monthlySpend}
          />

          <OpenRouterModelPicker
            features={Object.keys(TASK_DEFAULTS)}
            currentPreferences={modelPreferences}
            models={orModels}
          />

          <div className="pt-2">
            <Link
              href="/usage"
              className="text-sm text-muted-foreground underline-offset-2 hover:underline"
            >
              View detailed usage
            </Link>
          </div>
        </section>
      ) : (
        <section className="rounded-xl border p-6 space-y-4">
          <h2 className="text-sm font-semibold">Connect OpenRouter</h2>
          <p className="text-sm text-muted-foreground">
            Connect your OpenRouter account to use AI features. Your own credits fund inference —
            the platform charges nothing on top. Upgrade to Pro for fully managed AI.
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
            <li>Use your existing OpenRouter credits</li>
            <li>Set a monthly spend cap</li>
            <li>See a full usage breakdown</li>
          </ul>
          <a
            href="/api/openrouter/connect"
            className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Connect OpenRouter
          </a>
          <p className="text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a
              href="https://openrouter.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Create one at openrouter.ai
            </a>
          </p>
        </section>
      )}
    </div>
  );
}
