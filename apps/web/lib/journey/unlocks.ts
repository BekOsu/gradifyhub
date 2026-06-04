import { and, eq, isNotNull } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { attempt, roadmap, lessonProgress, interviewPrepSession, profile } from "@repo/db/schema";

// Index maps to stepper position:
// 0 Profile     — always accessible
// 1 Assessment  — needs profile (onboardedAt)
// 2 Roadmap     — needs completed assessment
// 3 Learn       — needs roadmap generated
// 4 Build       — needs ≥1 lesson completed
// 5 Interview   — needs ≥1 lesson completed
// 6 Resume      — needs ≥1 interview session
// 7 Hired       — always
export type JourneyUnlocks = [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean];

export async function getJourneyUnlocks(userId: string): Promise<JourneyUnlocks> {
  const [userProfile, completedAttempt, userRoadmap, completedLesson, interviewSession] =
    await Promise.all([
      db.query.profile.findFirst({
        where: eq(profile.userId, userId),
        columns: { onboardedAt: true },
      }),
      db.query.attempt.findFirst({
        where: and(eq(attempt.userId, userId), isNotNull(attempt.completedAt)),
        columns: { id: true },
      }),
      db.query.roadmap.findFirst({
        where: eq(roadmap.userId, userId),
        columns: { id: true },
      }),
      db.query.lessonProgress.findFirst({
        where: and(eq(lessonProgress.userId, userId), isNotNull(lessonProgress.completedAt)),
        columns: { id: true },
      }),
      db.query.interviewPrepSession.findFirst({
        where: eq(interviewPrepSession.userId, userId),
        columns: { id: true },
      }),
    ]);

  const isOnboarded = Boolean(userProfile?.onboardedAt);
  const hasAssessment = Boolean(completedAttempt);
  const hasRoadmap = Boolean(userRoadmap);
  const hasLesson = Boolean(completedLesson);
  const hasInterview = Boolean(interviewSession);

  return [
    true,          // 0 Profile
    isOnboarded,   // 1 Assessment
    hasAssessment, // 2 Roadmap
    hasRoadmap,    // 3 Learn
    hasLesson,     // 4 Build
    hasLesson,     // 5 Interview
    hasInterview,  // 6 Resume
    true,          // 7 Hired
  ];
}
