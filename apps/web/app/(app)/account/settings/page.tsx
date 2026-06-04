import Link from "next/link";
import { requireAuth } from "~/lib/auth/session";
import { getSubscription } from "~/actions/billing";
import { DeleteAccountButton } from "~/components/app/delete-account-button";
import { eq } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { profile } from "@repo/db/schema";
import { GOAL_LABELS } from "~/lib/journey/goals";

export default async function AccountSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  const user = await requireAuth();
  const { updated } = await searchParams;
  const [sub, userProfile] = await Promise.all([
    getSubscription(),
    db.query.profile.findFirst({ where: eq(profile.userId, user.id) }),
  ]);

  const isPaid = (sub?.plan ?? "free") !== "free";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Learning preferences and account configuration.
        </p>
      </div>

      {updated === "preferences" && (
        <div className="rounded-xl border border-green-200 bg-green-500/5 px-4 py-3 text-sm text-green-700">
          Your learning preferences were updated successfully.
        </div>
      )}

      {/* Learning preferences */}
      <section className="rounded-xl border p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold">Learning preferences</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Update your target stack, study pace, and timeline whenever your plans change.
            </p>
          </div>
          <Link
            href="/onboarding/step-1?edit=1"
            className="inline-flex rounded-full border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Edit preferences
          </Link>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-muted/30 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Current role
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {userProfile?.currentRole ?? "Not set"}
            </dd>
          </div>
          <div className="rounded-xl bg-muted/30 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Target track
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {userProfile?.goal
                ? (GOAL_LABELS[userProfile.goal] ?? userProfile.goal)
                : "Not set"}
            </dd>
          </div>
          <div className="rounded-xl bg-muted/30 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Timeline
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {userProfile?.targetTimeline ?? "Not set"}
            </dd>
          </div>
          <div className="rounded-xl bg-muted/30 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Study pace
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {userProfile?.hoursPerDay && userProfile?.daysPerWeek
                ? `${userProfile.hoursPerDay} hr/day · ${userProfile.daysPerWeek} day${
                    userProfile.daysPerWeek === "1" ? "" : "s"
                  }/week`
                : "Not set"}
            </dd>
          </div>
        </dl>
      </section>

      {/* AI Usage */}
      <section className="rounded-xl border p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold">AI Usage</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isPaid
                ? "Your plan includes managed AI inference."
                : "Connect your OpenRouter account to power AI features."}
            </p>
          </div>
          <Link
            href="/settings/openrouter"
            className="inline-flex rounded-full border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
          >
            {isPaid ? "View usage" : "Configure"}
          </Link>
        </div>
      </section>

      {/* Danger zone */}
      <section className="rounded-xl border border-destructive/30 p-6">
        <h2 className="mb-1 text-sm font-semibold text-destructive">Danger zone</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <DeleteAccountButton />
      </section>
    </div>
  );
}
