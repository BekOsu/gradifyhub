"use client";

import { useEffect, useState } from "react";

export interface AssessmentTimerState {
  elapsedMs: number;
  isPaused: boolean;
}

export function useAssessmentTimer(
  startedAt: Date,
  pausedAt: Date | null,
  totalPauseMs: number
): AssessmentTimerState {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const startMs = new Date(startedAt).getTime();

      if (pausedAt) {
        const pauseStartMs = new Date(pausedAt).getTime();
        const pauseDurationMs = now - pauseStartMs;
        setElapsedMs(now - startMs - totalPauseMs - pauseDurationMs);
      } else {
        setElapsedMs(now - startMs - totalPauseMs);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);

    return () => clearInterval(interval);
  }, [startedAt, pausedAt, totalPauseMs]);

  return {
    elapsedMs: Math.max(0, elapsedMs),
    isPaused: pausedAt !== null,
  };
}

export function formatElapsedTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
