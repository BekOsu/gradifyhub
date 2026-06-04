"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { sendVerificationEmail } from "~/lib/auth/client";
import { AlertBanner } from "~/components/auth/alert-banner";
import { resolveAuthCallbackURL } from "~/lib/auth/redirects";

type AuthClientError = { code?: string; message?: string };

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const callbackURL = resolveAuthCallbackURL(searchParams);
  const signInHref = `/sign-in?${new URLSearchParams({ from: callbackURL }).toString()}`;
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function handleResend() {
    if (!email) {
      setError("Email is missing. Go back to sign up and try again.");
      return;
    }

    setSending(true);
    setError(null);
    setStatus(null);

    const { error: resendError } = await sendVerificationEmail({
      email,
      callbackURL,
    });

    if (resendError) {
      const typedError = resendError as AuthClientError;
      if (typedError.code === "VERIFICATION_EMAIL_NOT_ENABLED") {
        setError("Verification email is currently unavailable. Please try again shortly.");
        setSending(false);
        return;
      }

      setError(typedError.message ?? "Failed to send verification email.");
      setSending(false);
      return;
    }

    setStatus("✓ Verification email sent! Check your inbox and spam folder.");
    setSending(false);
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h1 className="text-2xl font-bold">Check your email</h1>
      <p className="text-sm text-muted-foreground">
        We sent a verification link to {email || "your email"}. Verify your account before signing in.
      </p>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-left">
        <p className="text-xs text-amber-900">
          💡 <strong>Didn&apos;t receive the email?</strong>
        </p>
        <ul className="mt-2 text-xs text-amber-800 space-y-1">
          <li>• Check your spam or junk folder</li>
          <li>• Click &quot;Resend verification email&quot; below</li>
          <li>• Verification links expire after 24 hours</li>
        </ul>
      </div>

      {status && <AlertBanner type="success" message={status} dismissible autoClose={8000} />}

      {error && (
        <AlertBanner type="error" title="Error" message={error} dismissible={false} autoClose={0} />
      )}

      <button
        type="button"
        onClick={handleResend}
        disabled={sending}
        className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {sending ? "Sending..." : "Resend verification email"}
      </button>

      <Link href={signInHref} className="text-sm underline underline-offset-4">
        Continue to sign in
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}