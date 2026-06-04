"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "~/lib/auth/client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState<string | null>(
    token ? null : "Invalid or missing reset link. Please request a new one.",
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;

    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const newPassword = form.get("password") as string;

    const { error: err } = await resetPassword({ newPassword, token });

    if (err) {
      setError("This link has expired or is invalid. Please request a new one.");
      setLoading(false);
      return;
    }

    router.push("/sign-in");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Set a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a password with at least 8 characters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            disabled={!token}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={loading || !token}
          className="rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
