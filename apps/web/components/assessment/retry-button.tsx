"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function RetryButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [clicked, setClicked] = useState(false);

  function handleRetry() {
    setClicked(true);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleRetry}
      disabled={isPending || clicked}
      className="inline-flex rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 disabled:opacity-60"
    >
      {isPending ? "Retrying…" : "Try again"}
    </button>
  );
}
