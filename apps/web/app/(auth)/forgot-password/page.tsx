"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { requestPasswordReset } from "~/lib/auth/client";

function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;

    try {
      const { error: err } = await requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });

      if (err) {
        console.error("[ForgotPassword] Error:", err);
        setError(
          err.message ||
          "Unable to process password reset. Please check your email and try again."
        );
        setLoading(false);
        return;
      }

      setSent(true);
    } catch (error) {
      console.error("[ForgotPassword] Unexpected error:", error);
      setError("An unexpected error occurred. Please try again later.");
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            If an account exists for that address, we sent a reset link.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Back to{" "}
          <Link href="/sign-in" className="underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Forgot your password?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

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

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Back to{" "}
        <Link href="/sign-in" className="underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
