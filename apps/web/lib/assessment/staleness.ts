export function isAttemptStale(
  profileUpdatedAt?: Date | null,
  attemptTimestamp?: Date | null
) {
  if (!profileUpdatedAt || !attemptTimestamp) return false;
  return profileUpdatedAt.getTime() > attemptTimestamp.getTime();
}

export function needsAssessmentRefresh(
  profileUpdatedAt?: Date | null,
  latestCompletedAt?: Date | null
) {
  if (!profileUpdatedAt) return false;
  if (!latestCompletedAt) return false;
  return profileUpdatedAt.getTime() > latestCompletedAt.getTime();
}

