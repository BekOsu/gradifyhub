import { requireAuth } from '~/lib/auth/session';
import { hasFeature } from '~/lib/billing/hasFeature';
import { VocabMineClient } from './vocab-mine-client';
import Link from 'next/link';

export default async function VocabMinePage() {
  const user = await requireAuth();
  const canMine = await hasFeature(user.id, 'english_mining');

  if (!canMine) {
    return (
      <div className="mx-auto max-w-2xl px-4 pb-12 sm:px-0">
        <div className="mt-12 flex justify-center">
          <div className="rounded-2xl border bg-card p-8 text-center shadow-sm max-w-md">
            <h2 className="text-lg font-semibold text-foreground">
              Vocabulary Mining
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Extract vocabulary from YouTube videos, articles, and any text. Build your personal vault from real content you watch and read. Available on the Pro plan.
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

  return <VocabMineClient />;
}
