"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signUp, signIn } from "~/lib/auth/client";
import { AlertBanner } from "~/components/auth/alert-banner";
import { PasswordStrength } from "~/components/auth/password-strength";
import { validateEmailNotRegistered } from "~/actions/auth";
import { validatePassword } from "~/lib/auth/password-validation";
import { resolveAuthCallbackURL } from "~/lib/auth/redirects";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = resolveAuthCallbackURL(searchParams);
  const signInHref = `/sign-in?${new URLSearchParams({ from: callbackURL }).toString()}`;
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const name = form.get("name") as string;

    // Validate email is not already registered
    const { available, error: emailError } = await validateEmailNotRegistered(email);

    if (!available) {
      setError(emailError ?? "Email validation failed");
      setLoading(false);
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(
        "Password does not meet requirements. Must have at least 12 characters, " +
        "1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (!@#$%^&*)."
      );
      setLoading(false);
      return;
    }

    const { error: err } = await signUp.email({
      email,
      password,
      name,
      callbackURL,
    });

    if (err) {
      setError(err.message ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    setSuccess("Account created! Signing you in...");

    // Try to sign in right away; only send users to verify page when verification is enforced.
    const { error: signInError } = await signIn.email({
      email,
      password,
      callbackURL,
    });

    if (!signInError) {
      router.push(callbackURL);
      router.refresh();
      return;
    }

    if ((signInError as { code?: string }).code === "EMAIL_NOT_VERIFIED") {
      const verifyParams = new URLSearchParams({ email, from: callbackURL });
      router.push(`/verify-email?${verifyParams.toString()}`);
      return;
    }

    // Account is created but auto sign-in failed for a non-verification reason.
    // Redirect to sign-in with account_created flag for success banner
    const signInParams = new URLSearchParams({
      account_created: "true",
      from: callbackURL,
    });
    router.push(`/sign-in?${signInParams.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Already have one?{" "}
          <Link href={signInHref} className="underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <AlertBanner type="error" title="Sign up failed" message={error} dismissible autoClose={0} />
        )}

        {success && (
          <AlertBanner type="success" title="Success!" message={success} dismissible={false} autoClose={3000} />
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

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
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          />
          <PasswordStrength password={password} />
        </div>

        {error && (
          <AlertBanner type="error" title="Sign up failed" message={error} dismissible autoClose={0} />
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
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
          onClick={() => signIn.social({ provider: "google", callbackURL })}
          className="flex items-center justify-center gap-2 rounded-full border border-input bg-background px-4 py-2.5 text-sm font-medium hover:bg-muted"
        >
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => signIn.social({ provider: "github", callbackURL })}
          className="flex items-center justify-center gap-2 rounded-full border border-input bg-background px-4 py-2.5 text-sm font-medium hover:bg-muted"
        >
          Continue with GitHub
        </button>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
