import { requireAuth } from '~/lib/auth/session';
import { getShadowingPhrasesAction } from '~/actions/english/shadow';
import { ShadowingCoach } from './shadowing-coach';
import { hasFeature } from '~/lib/billing/hasFeature';
import Link from 'next/link';

export default async function ShadowingPage() {
  const user = await requireAuth();
  const canShadow = await hasFeature(user.id, 'english_shadow');

  if (!canShadow) {
    return (
      <div className="mx-auto max-w-2xl px-4 pb-12 sm:px-0">
        <div className="mt-12 flex justify-center">
          <div className="rounded-2xl border bg-card p-8 text-center shadow-sm max-w-md">
            <h2 className="text-lg font-semibold text-foreground">
              Shadowing Coach
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Practice pronunciation with AI feedback. Available on the Pro plan.
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

  const result = await getShadowingPhrasesAction(10);
  const phrases = result.phrases;

  if (phrases.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 pb-12 sm:px-0">
        <div className="mt-12 flex justify-center">
          <div className="rounded-2xl border bg-card p-8 text-center shadow-sm max-w-md">
            <h2 className="text-lg font-semibold text-foreground">
              No phrases to practice
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Add vocabulary words to start shadowing
            </p>
            <Link
              href="/english/vocab"
              className="mt-6 inline-flex rounded-xl bg-brand-green px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
            >
              Go to Vocabulary
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ShadowingCoach phrases={phrases} />;
}
