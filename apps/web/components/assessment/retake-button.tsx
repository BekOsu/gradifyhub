"use client";

import { useState, useTransition } from "react";
import { startRetakeAttempt } from "~/actions/assessment-start";
import { cn } from "~/lib/utils";

interface RetakeButtonProps {
  plan: string;
  completedThisWeek: number;
  weeklyLimit: number | null;
}

export function RetakeButton({
  plan,
  completedThisWeek,
  weeklyLimit,
}: RetakeButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isUnlimited = weeklyLimit === null;
  const limitReached = weeklyLimit !== null && completedThisWeek >= weeklyLimit;
  const canRetake = isUnlimited || !limitReached;

  function handleRetake() {
    setError(null);
    startTransition(async () => {
      try {
        const { attemptId: newAttemptId } = await startRetakeAttempt();
        window.location.href = `/assessment/q/1?attempt=${newAttemptId}`;
      } catch (err) {
        if (err instanceof Error) {
          if (err.message === "weekly_retake_limit_reached") {
            setError("You've used your weekly retake. Try again next Monday.");
          } else {
            setError(err.message);
          }
        } else {
          setError("Failed to start retake. Please try again.");
        }
      }
    });
  }

  return (
    <div className="space-y-3">
      <div>
        <button
          onClick={handleRetake}
          disabled={!canRetake || isPending}
          className={cn(
            "inline-flex rounded-full px-6 py-2.5 text-sm font-semibold transition-colors",
            canRetake
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed",
            isPending && "opacity-70"
          )}
        >
          {isPending ? "Starting retake..." : "Retake assessment"}
        </button>
      </div>

      {/* Show limit status */}
      {weeklyLimit !== null && (
        <p className="text-xs text-muted-foreground">
          {isUnlimited ? (
            "Unlimited retakes"
          ) : (
            <>
              {completedThisWeek}/{weeklyLimit} retake{weeklyLimit !== 1 ? "s" : ""} used this week
            </>
          )}
        </p>
      )}

      {/* Show error message */}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {/* Show upgrade suggestion for free users when limit reached */}
      {limitReached && plan === "free" && (
        <p className="text-xs text-muted-foreground">
          Upgrade to Pro for unlimited retakes.
        </p>
      )}
    </div>
  );
}
