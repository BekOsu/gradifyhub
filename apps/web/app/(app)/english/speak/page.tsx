import { requireAuth } from '~/lib/auth/session';
import { hasFeature } from '~/lib/billing/hasFeature';
import { SpeakingPartnerShell } from './speaking-partner-shell';
import Link from 'next/link';

export default async function SpeakingPage() {
  const user = await requireAuth();
  const canSpeak = await hasFeature(user.id, 'english_speak');

  if (!canSpeak) {
    return (
      <div className="mx-auto max-w-2xl px-4 pb-12 sm:px-0">
        <div className="mt-12 flex justify-center">
          <div className="rounded-2xl border bg-card p-8 text-center shadow-sm max-w-md">
            <h2 className="text-lg font-semibold text-foreground">
              AI Speaking Partner
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Practice real conversations with an AI partner and get instant feedback. Available on the Pro plan.
            </p>
            <Link
              href="/pricing"
              className="mt-6 inline-flex rounded-xl bg-brand-green px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <SpeakingPartnerShell />;
}
