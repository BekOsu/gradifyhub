export const ASSESSMENT_CONFIG = {
  totalTimeMs: 45 * 60 * 1000, // 45 minutes in milliseconds
  warningThresholds: [
    { ms: 5 * 60 * 1000, label: "5 minutes remaining" },
    { ms: 1 * 60 * 1000, label: "1 minute remaining" },
  ],
} as const;

export const PER_QUESTION_TIME_MS = 2 * 60 * 1000; // 2 minutes per question

export function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.ceil(Math.max(0, ms) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function getWarningLevel(
  remainingMs: number
): "expired" | "critical" | "warning" | "normal" {
  if (remainingMs <= 0) return "expired";
  if (remainingMs <= ASSESSMENT_CONFIG.warningThresholds[1]!.ms) return "critical";
  if (remainingMs <= ASSESSMENT_CONFIG.warningThresholds[0]!.ms) return "warning";
  return "normal";
}
