"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { startAttempt } from "~/actions/assessment";

interface AttemptCardProps {
  id: string;
  completedAt: Date;
  status: "completed" | "abandoned";
  topSkill?: string;
  timeSpentMinutes: number;
}

export function AttemptCard({
  id,
  completedAt,
  status,
  topSkill,
  timeSpentMinutes,
}: AttemptCardProps) {
  const router = useRouter();
  const [restarting, setRestarting] = useState(false);

  const date = new Date(completedAt);
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  async function handleRestart() {
    setRestarting(true);
    try {
      await startAttempt();
      router.push(`/assessment/q/1`);
    } catch (err) {
      console.error("[history] restart failed:", err);
      setRestarting(false);
    }
  }

  const isCompleted = status === "completed";
  const statusBadge = isCompleted ? "🟢 Completed" : "⚪ Abandoned";
  const statusColor = isCompleted ? "text-green-600" : "text-muted-foreground";

  return (
    <div className="rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${statusColor}`}>{statusBadge}</span>
            <span className="text-sm text-muted-foreground">{timeStr}</span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            {isCompleted && topSkill && (
              <div>
                <span className="text-muted-foreground">Top skill: </span>
                <span className="font-medium">{topSkill}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Time: </span>
              <span className="font-medium">{timeSpentMinutes} min</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 ml-4">
          {isCompleted && (
            <Link
              href={`/assessment/results/${id}`}
              className="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors text-center"
            >
              View Results
            </Link>
          )}
          <button
            type="button"
            onClick={handleRestart}
            disabled={restarting}
            className="rounded-md border border-primary bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 disabled:opacity-50 transition-colors"
          >
            {restarting ? "Starting…" : "Restart"}
          </button>
        </div>
      </div>
    </div>
  );
}
