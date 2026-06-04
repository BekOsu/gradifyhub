import { requireAuth } from "~/lib/auth/session";
import { CopyReferralLink } from "~/components/app/copy-referral-link";

export default async function AccountFriendsPage() {
  const user = await requireAuth();
  const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://gradifyhub.com"}/sign-up?ref=${user.id}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold">Friends</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite friends and you both get 1 month of Pro free.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 rounded-xl border py-14 text-center">
        {/* Icon */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-10 w-10 text-muted-foreground"
          >
            <circle cx="9" cy="7" r="4" />
            <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
            <path d="M16 11h6m-3-3v6" />
          </svg>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold">Invite your Friends</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Share your unique link with friends. When they sign up and upgrade,
            you both get 1 month of Pro free (up to 5 referrals).
          </p>
        </div>

        <CopyReferralLink url={referralUrl} />
      </div>

      <div className="rounded-xl border p-5">
        <h3 className="mb-3 text-sm font-semibold">How it works</h3>
        <ol className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-xs font-semibold text-brand-green">
              1
            </span>
            Share your unique referral link with a friend.
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-xs font-semibold text-brand-green">
              2
            </span>
            They sign up using your link and upgrade to Pro.
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-xs font-semibold text-brand-green">
              3
            </span>
            You both get 1 month of Pro free, automatically applied.
          </li>
        </ol>
      </div>
    </div>
  );
}
