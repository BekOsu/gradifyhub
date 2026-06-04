"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { signIn } from "~/lib/auth/client";
import { AlertBanner } from "~/components/auth/alert-banner";
import { resolveAuthCallbackURL } from "~/lib/auth/redirects";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = resolveAuthCallbackURL(searchParams);
  const signUpHref = `/sign-up?${new URLSearchParams({ from: callbackURL }).toString()}`;
  const accountJustCreated = searchParams.get("account_created") === "true";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [socialLoadingProvider, setSocialLoadingProvider] = useState<"google" | "github" | null>(null);

  async function handleSocialSignIn(provider: "google" | "github") {
    setError(null);
    setSocialLoadingProvider(provider);

    try {
      const { error: socialError } = await signIn.social({ provider, callbackURL });

      if (socialError) {
        setError(socialError.message ?? `Unable to sign in with ${provider}.`);
        setSocialLoadingProvider(null);
      }
    } catch {
      setError(`Unable to sign in with ${provider}. Please try again.`);
      setSocialLoadingProvider(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const { error: err } = await signIn.email({ email, password, callbackURL });

    if (err) {
      if ((err as { code?: string }).code === "EMAIL_NOT_VERIFIED") {
        const verifyParams = new URLSearchParams({ email, from: callbackURL });
        router.push(`/verify-email?${verifyParams.toString()}`);
        setLoading(false);
        return;
      }

      setError("Email or password incorrect.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          No account?{" "}
          <Link href={signUpHref} className="underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </div>

      {accountJustCreated && (
        <AlertBanner
          type="success"
          title="Account created!"
          message="Your account has been created successfully. Please sign in to continue."
          dismissible
          autoClose={6000}
        />
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground underline underline-offset-4"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {error && (
          <AlertBanner type="error" title="Sign in failed" message={error} dismissible={false} autoClose={0} />
        )}

        <button
          type="submit"
          disabled={loading || socialLoadingProvider !== null}
          className="rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={loading || socialLoadingProvider !== null}
          onClick={() => {
            void handleSocialSignIn("google");
          }}
          className="flex items-center justify-center gap-2 rounded-full border border-input bg-background px-4 py-2.5 text-sm font-medium hover:bg-muted"
        >
          {socialLoadingProvider === "google" ? "Redirecting to Google..." : "Continue with Google"}
        </button>
        <button
          type="button"
          disabled={loading || socialLoadingProvider !== null}
          onClick={() => {
            void handleSocialSignIn("github");
          }}
          className="flex items-center justify-center gap-2 rounded-full border border-input bg-background px-4 py-2.5 text-sm font-medium hover:bg-muted"
        >
          {socialLoadingProvider === "github" ? "Redirecting to GitHub..." : "Continue with GitHub"}
        </button>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}