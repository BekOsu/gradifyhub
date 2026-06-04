"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle } from "lucide-react";

export function ContinueButton({ isEnabled }: { isEnabled: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!isEnabled || loading) return;
    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch("/api/actions/foundation-path-complete-eng", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error("Invalid response format from server");
      }

      if (!response.ok) {
        throw new Error(result?.error || "Failed to complete foundation path");
      }

      router.push(result.redirectUrl ?? "/roadmap?track=english-proficiency");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <button
        onClick={handleContinue}
        disabled={!isEnabled || loading}
        className="w-full rounded-lg bg-foreground px-4 py-3 text-sm font-semibold text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-foreground/90"
      >
        {loading
          ? "Saving progress..."
          : isEnabled
          ? "Continue to English roadmap →"
          : "Complete all lessons first"}
      </button>
    </div>
  );
}
