import { eq, and } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { profile, account } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { SettingsAccountForm } from "~/components/app/settings-account-form";
import Link from "next/link";
import { GOAL_LABELS } from "~/lib/journey/goals";

export default async function AccountProfilePage() {
  const user = await requireAuth();

  const [userProfile, credentialAccount] = await Promise.all([
    db.query.profile.findFirst({ where: eq(profile.userId, user.id) }),
    db.query.account.findFirst({
      where: and(eq(account.userId, user.id), eq(account.providerId, "credential")),
      columns: { id: true },
    }),
  ]);

  const knownStack = userProfile?.knownStack as
    | { languages?: string[]; frameworks?: string[]; custom?: string }
    | null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account details and learning profile.
        </p>
      </div>

      {/* Account */}
      <section className="rounded-xl border p-6">
        <h2 className="mb-4 text-sm font-semibold">Account</h2>
        <div className="mb-4 flex justify-between text-sm">
          <span className="text-muted-foreground">Email</span>
          <span className="font-medium">{user.email}</span>
        </div>
        <SettingsAccountForm
          currentName={user.name ?? ""}
          hasPasswordCredential={!!credentialAccount}
        />
      </section>

      {/* Learning profile */}
      <section className="rounded-xl border p-6">
        <div className="flex items-start justify-between">
          <h2 className="text-sm font-semibold">Learning profile</h2>
          <Link
            href="/onboarding/step-1?edit=1"
            className="text-xs text-brand-green hover:underline"
          >
            Edit preferences
          </Link>
        </div>

        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
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

        {knownStack && (
          <div className="mt-4 rounded-xl bg-muted/30 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Known stack
            </dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              {[...(knownStack.languages ?? []), ...(knownStack.frameworks ?? [])].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border bg-background px-2.5 py-0.5 text-xs font-medium"
                  >
                    {item}
                  </span>
                ),
              )}
              {knownStack.custom && (
                <span className="rounded-full border bg-background px-2.5 py-0.5 text-xs font-medium">
                  {knownStack.custom}
                </span>
              )}
            </dd>
          </div>
        )}
      </section>
    </div>
  );
}
