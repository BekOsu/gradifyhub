"use client";

import { useState, useTransition } from "react";
import { votePollAction } from "~/actions/community";
import { cn } from "~/lib/utils";
import type { PollResult } from "~/lib/community";

interface PollCardProps {
  poll: PollResult;
  postId: string;
  isLoggedIn: boolean;
}

export function PollCard({ poll, isLoggedIn }: PollCardProps) {
  const [result, setResult] = useState(poll);
  const [isPending, startTransition] = useTransition();
  const hasVoted = !!result.myVoteOptionId;

  function handleVote(optionId: string) {
    if (!isLoggedIn || isPending) return;
    startTransition(async () => {
      const res = await votePollAction(result.id, optionId);
      if (res.success) {
        setResult((prev) => {
          const wasVotedOptionId = prev.myVoteOptionId;
          const updatedOptions = prev.options.map((o) => {
            if (o.id === optionId) return { ...o, votes: o.votes + 1 };
            if (o.id === wasVotedOptionId) return { ...o, votes: Math.max(0, o.votes - 1) };
            return o;
          });
          const totalVotes =
            wasVotedOptionId === optionId
              ? prev.totalVotes
              : wasVotedOptionId
              ? prev.totalVotes
              : prev.totalVotes + 1;
          return { ...prev, options: updatedOptions, myVoteOptionId: optionId, totalVotes };
        });
      }
    });
  }

  return (
    <div className="mt-4 rounded-xl border bg-muted/20 p-4">
      <p className="mb-3 text-sm font-semibold">{result.question}</p>
      <div className="space-y-2">
        {result.options.map((option) => {
          const pct =
            result.totalVotes > 0
              ? Math.round((option.votes / result.totalVotes) * 100)
              : 0;
          const isMyVote = result.myVoteOptionId === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              data-testid={`poll-option-${option.id}`}
              disabled={isPending || !isLoggedIn}
              className={cn(
                "relative w-full overflow-hidden rounded-lg border px-4 py-2.5 text-left text-sm transition-all",
                isMyVote
                  ? "border-brand-green bg-brand-green/5 font-semibold text-brand-green"
                  : "border-muted bg-background hover:bg-muted/50",
                !isLoggedIn && "cursor-default",
              )}
            >
              {/* Progress bar behind text */}
              {hasVoted && (
                <span
                  className="absolute inset-y-0 left-0 bg-brand-green/10 transition-all"
                  style={{ width: `${pct}%` }}
                />
              )}
              <span className="relative flex items-center justify-between">
                <span>{option.label}</span>
                {hasVoted && (
                  <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                    {pct}%
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {result.totalVotes} vote{result.totalVotes !== 1 ? "s" : ""}
        {result.endsAt && ` · Ends ${new Date(result.endsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
      </p>
    </div>
  );
}

