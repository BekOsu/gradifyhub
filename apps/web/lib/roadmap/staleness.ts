export function needsRoadmapRefresh(
  profileUpdatedAt?: Date | null,
  roadmapUpdatedAt?: Date | null,
  lastAttemptCompletedAt?: Date | null,
) {
  if (!roadmapUpdatedAt) return false;
  if (profileUpdatedAt && profileUpdatedAt.getTime() > roadmapUpdatedAt.getTime()) return true;
  if (lastAttemptCompletedAt && lastAttemptCompletedAt.getTime() > roadmapUpdatedAt.getTime()) return true;
  return false;
}
