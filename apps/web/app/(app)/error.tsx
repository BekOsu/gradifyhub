"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-sm font-semibold text-destructive">Something went wrong</p>
      <p className="max-w-sm text-xs text-muted-foreground">
        {error.digest ? `Error ID: ${error.digest}` : "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}
