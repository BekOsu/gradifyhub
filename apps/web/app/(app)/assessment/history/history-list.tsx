"use client";

import Link from "next/link";
import { AttemptCard } from "./attempt-card";

interface GroupedAttempt {
  id: string;
  completedAt: Date;
  status: "completed" | "abandoned";
  topSkill?: string;
  timeSpentMinutes: number;
}

interface AttemptGroup {
  label: string;
  attempts: GroupedAttempt[];
}

function groupAttemptsByDate(attempts: GroupedAttempt[]): AttemptGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const today_ = [] as GroupedAttempt[];
  const yesterday_ = [] as GroupedAttempt[];
  const thisWeek_ = [] as GroupedAttempt[];
  const older_ = [] as GroupedAttempt[];

  attempts.forEach((attempt) => {
    const attemptDate = new Date(
      new Date(attempt.completedAt).getFullYear(),
      new Date(attempt.completedAt).getMonth(),
      new Date(attempt.completedAt).getDate()
    );

    if (attemptDate.getTime() === today.getTime()) {
      today_.push(attempt);
    } else if (attemptDate.getTime() === yesterday.getTime()) {
      yesterday_.push(attempt);
    } else if (attemptDate.getTime() >= weekAgo.getTime()) {
      thisWeek_.push(attempt);
    } else {
      older_.push(attempt);
    }
  });

  const result: AttemptGroup[] = [];

  if (today_.length > 0) {
    result.push({ label: "Today", attempts: today_ });
  }
  if (yesterday_.length > 0) {
    result.push({ label: "Yesterday", attempts: yesterday_ });
  }
  if (thisWeek_.length > 0) {
    result.push({ label: "This Week", attempts: thisWeek_ });
  }
  if (older_.length > 0) {
    result.push({ label: "Older", attempts: older_ });
  }

  return result;
}

export function HistoryList({ attempts }: { attempts: GroupedAttempt[] }) {
  if (attempts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-14 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground" aria-hidden="true">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
            <path d="M9 12h6M9 16h4"/>
          </svg>
        </div>
        <div>
          <p className="font-semibold">No assessments yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Complete your first diagnostic to see results here.</p>
        </div>
        <Link
          href="/assessment"
          className="mt-1 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Start assessment →
        </Link>
      </div>
    );
  }

  const groups = groupAttemptsByDate(attempts);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </h3>
          <div className="space-y-2">
            {group.attempts.map((attempt) => (
              <AttemptCard
                key={attempt.id}
                id={attempt.id}
                completedAt={attempt.completedAt}
                status={attempt.status}
                topSkill={attempt.topSkill}
                timeSpentMinutes={attempt.timeSpentMinutes}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
