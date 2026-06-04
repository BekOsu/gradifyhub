"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertCircle, Clock } from "lucide-react";
import {
  formatTimeRemaining,
  getWarningLevel,
  ASSESSMENT_CONFIG,
  PER_QUESTION_TIME_MS,
} from "~/lib/assessment/time-config";
import { checkTimeExpired } from "~/actions/assessment";

interface TimerProps {
  attemptId: string;
  timeExpiredAt: string | null;
  startedAt: string;
  totalPauseMs: number;
  onExpired?: () => void;
  perQuestion?: boolean;
  questionIndex?: number;
}

export function Timer({
  attemptId,
  timeExpiredAt,
  startedAt,
  totalPauseMs,
  onExpired,
  perQuestion = false,
}: TimerProps) {
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [displayTime, setDisplayTime] = useState<string>(
    perQuestion ? "02:00" : "45:00"
  );
  const [warningLevel, setWarningLevel] = useState<"expired" | "critical" | "warning" | "normal">(
    "normal"
  );
  const [isLoading, setIsLoading] = useState(true);

  // Per-question warning levels: 30 sec warning, 10 sec critical
  const getPerQuestionWarningLevel = (
    ms: number
  ): "expired" | "critical" | "warning" | "normal" => {
    if (ms <= 0) return "expired";
    if (ms <= 10 * 1000) return "critical";
    if (ms <= 30 * 1000) return "warning";
    return "normal";
  };

  // Calculate initial remaining time
  const initializeTimer = useCallback(() => {
    if (perQuestion) {
      // For per-question mode, always start from 2 minutes
      setRemainingMs(PER_QUESTION_TIME_MS);
      setDisplayTime(formatTimeRemaining(PER_QUESTION_TIME_MS));
      setWarningLevel(getPerQuestionWarningLevel(PER_QUESTION_TIME_MS));
      setIsLoading(false);
      return PER_QUESTION_TIME_MS;
    }

    // Session timer mode (original behavior)
    const startMs = new Date(startedAt).getTime();
    const expireMs = timeExpiredAt
      ? new Date(timeExpiredAt).getTime()
      : startMs + ASSESSMENT_CONFIG.totalTimeMs;
    const now = Date.now();
    const remaining = Math.max(0, expireMs - now - totalPauseMs);

    setRemainingMs(remaining);
    setDisplayTime(formatTimeRemaining(remaining));
    setWarningLevel(getWarningLevel(remaining));
    setIsLoading(false);

    return remaining;
  }, [startedAt, timeExpiredAt, totalPauseMs, perQuestion]);

  useEffect(() => {
    // Initialize on mount or when questionIndex changes (per-question mode)
    initializeTimer();

    // Set up countdown interval
    const interval = setInterval(() => {
      setRemainingMs((prev) => {
        const next = Math.max(0, prev - 1000);
        setDisplayTime(formatTimeRemaining(next));
        if (perQuestion) {
          setWarningLevel(getPerQuestionWarningLevel(next));
        } else {
          setWarningLevel(getWarningLevel(next));
        }
        return next;
      });
    }, 1000);

    // Verify time with server every 10 seconds (only for session timer)
    let verifyInterval: NodeJS.Timeout | undefined;
    if (!perQuestion) {
      verifyInterval = setInterval(async () => {
        try {
          const result = await checkTimeExpired(attemptId);
          if (result.expired) {
            setRemainingMs(0);
            setDisplayTime("00:00");
            setWarningLevel("expired");
          }
        } catch (err) {
          console.error("[timer] failed to verify expiry with server:", err);
        }
      }, 10000);
    }

    return () => {
      clearInterval(interval);
      if (verifyInterval) clearInterval(verifyInterval);
    };
  }, [attemptId, initializeTimer, perQuestion]);

  // Handle expiry
  useEffect(() => {
    if (remainingMs === 0 && !isLoading) {
      onExpired?.();
    }
  }, [remainingMs, isLoading, onExpired]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Clock className="h-4 w-4" />
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Timer display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span
            className={`text-lg font-mono font-bold transition-colors ${
              warningLevel === "expired"
                ? "text-destructive"
                : warningLevel === "critical"
                  ? "text-red-500"
                  : warningLevel === "warning"
                    ? "text-amber-500"
                    : "text-foreground"
            }`}
          >
            {displayTime}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {warningLevel === "expired" ? "Time expired" : "remaining"}
        </span>
      </div>

      {/* Warning banners */}
      {warningLevel === "critical" && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <span className="text-sm font-medium text-red-600">
            {perQuestion ? "10 seconds remaining" : "1 minute remaining"}
          </span>
        </div>
      )}

      {warningLevel === "warning" && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <span className="text-sm font-medium text-amber-600">
            {perQuestion ? "30 seconds remaining" : "5 minutes remaining"}
          </span>
        </div>
      )}

      {warningLevel === "expired" && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
          <span className="text-sm font-medium text-destructive">
            Time expired. Submitting assessment...
          </span>
        </div>
      )}
    </div>
  );
}
