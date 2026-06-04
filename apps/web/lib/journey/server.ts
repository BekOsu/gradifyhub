import { and, eq, isNotNull } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { attempt, lessonProgress, profile, roadmap } from "@repo/db/schema";
import { buildJourneyStatus, type JourneyStatus } from "~/lib/journey/status";

export interface JourneySnapshot {
  isOnboarded: boolean;
  hasCompletedAssessment: boolean;
  hasRoadmap: boolean;
  completedLessonsCount: number;
}

export async function getJourneySnapshot(userId: string): Promise<JourneySnapshot> {
  const [userProfile, latestCompletedAttempt, userRoadmap, completedLessonsCount] = await Promise.all([
    db.query.profile.findFirst({ where: eq(profile.userId, userId) }),
    db.query.attempt.findFirst({
      where: and(eq(attempt.userId, userId), isNotNull(attempt.completedAt)),
      columns: { id: true },
    }),
    db.query.roadmap.findFirst({ where: eq(roadmap.userId, userId), columns: { id: true } }),
    db.query.lessonProgress.findMany({
      where: and(eq(lessonProgress.userId, userId), isNotNull(lessonProgress.completedAt)),
      columns: { id: true },
    }).then((rows) => rows.length),
  ]);

  return {
    isOnboarded: Boolean(userProfile?.onboardedAt),
    hasCompletedAssessment: Boolean(latestCompletedAttempt),
    hasRoadmap: Boolean(userRoadmap),
    completedLessonsCount,
  };
}

export async function getJourneyStatusForUser(userId: string): Promise<JourneyStatus> {
  const snapshot = await getJourneySnapshot(userId);
  return buildJourneyStatus(snapshot);
}
