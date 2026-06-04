"use client";

import Link from "next/link";
import { useState } from "react";
import { createCheckoutAction } from "~/actions/billing";
import { useSession } from "~/lib/auth/client";

export function PricingCtaButtons({ initialIsLoggedIn = false }: { initialIsLoggedIn?: boolean }) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user || initialIsLoggedIn;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comingSoon, setComingSoon] = useState(false);

  async function handleUpgrade() {
    if (!isLoggedIn) {
      const params = new URLSearchParams({ plan: "pro", from: "/pricing?plan=pro" });
      window.location.href = `/sign-up?${params.toString()}`;
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createCheckoutAction("pro");
      if ("comingSoon" in result) {
        setComingSoon(true);
        setLoading(false);
        setTimeout(() => setComingSoon(false), 5000);
        return;
      }
      window.location.href = result.url;
    } catch (err) {
      setLoading(false);
      setError("Could not start checkout. Please try again.");
      console.error("[pricing-cta-checkout]", err);
    }
  }

  if (comingSoon) {
    return (
      <div className="mt-8 rounded-xl border border-background/20 bg-background/10 px-6 py-5 text-center">
        <p className="text-sm font-semibold text-background">Pro is launching soon</p>
        <p className="mt-1 text-xs text-background/60">
          We&apos;ll email you when it&apos;s ready. No action needed.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href={isLoggedIn ? "/dashboard" : "/sign-up"}
          className="inline-flex rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-background/90 hover:shadow-md"
        >
          {isLoggedIn ? "Go to dashboard →" : "Get started free →"}
        </Link>
        <button
          type="button"
          onClick={() => { void handleUpgrade(); }}
          disabled={loading}
          className="inline-flex rounded-full border border-background/30 px-6 py-3 text-sm font-medium text-background/80 transition-colors hover:border-background/60 hover:text-background disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Preparing…" : "Upgrade to Pro →"}
        </button>
      </div>
      {error && <p className="mt-4 text-sm text-red-200">{error}</p>}
    </>
  );
}
