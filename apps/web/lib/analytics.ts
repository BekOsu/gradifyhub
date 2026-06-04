/**
 * PostHog Analytics Client
 * Safe wrapper that gracefully handles missing PostHog key (no-op in dev/test).
 */

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

interface PostHogEvent {
  event: string;
  properties?: Record<string, unknown>;
  distinct_id?: string;
}

/**
 * Server-side event tracking (for server actions).
 * Falls back gracefully if POSTHOG_KEY is not set.
 */
export async function trackEvent(
  event: string,
  properties?: Record<string, unknown>,
  userId?: string
): Promise<void> {
  if (!POSTHOG_KEY) {
    console.log(`[analytics] skipped event (no key): ${event}`, properties);
    return;
  }

  try {
    const payload: PostHogEvent = {
      event,
      properties,
      distinct_id: userId || "anonymous",
    };

    // PostHog API: POST /capture
    await fetch("https://us.posthog.com/capture/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        ...payload,
      }),
    });
  } catch (error) {
    console.error("[analytics] event tracking failed:", event, error);
    // Fail silently; don't break app logic
  }
}

/**
 * Track key conversion funnel events.
 */
export const funnel = {
  /**
   * User starts an assessment.
   */
  assessmentStarted: (userId: string, attemptId: string) =>
    trackEvent(
      "assessment_started",
      {
        attemptId,
        timestamp: new Date().toISOString(),
      },
      userId
    ),

  /**
   * User completes the assessment.
   */
  assessmentCompleted: (userId: string, attemptId: string, topSkill: string) =>
    trackEvent(
      "assessment_completed",
      {
        attemptId,
        topSkill,
        timestamp: new Date().toISOString(),
      },
      userId
    ),

  /**
   * User initiates roadmap generation.
   */
  roadmapGenerationStarted: (userId: string, roadmapId: string) =>
    trackEvent(
      "roadmap_generation_started",
      {
        roadmapId,
        timestamp: new Date().toISOString(),
      },
      userId
    ),

  /**
   * Roadmap generation completed successfully.
   */
  roadmapGenerationCompleted: (userId: string, roadmapId: string, totalWeeks: number) =>
    trackEvent(
      "roadmap_generation_completed",
      {
        roadmapId,
        totalWeeks,
        timestamp: new Date().toISOString(),
      },
      userId
    ),

  /**
   * User completes a lesson.
   */
  lessonCompleted: (userId: string, lessonId: string, quizScore: number) =>
    trackEvent(
      "lesson_completed",
      {
        lessonId,
        quizScore,
        timestamp: new Date().toISOString(),
      },
      userId
    ),

  /**
   * User initiates checkout.
   */
  checkoutInitiated: (userId: string, plan: "pro") =>
    trackEvent(
      "checkout_initiated",
      {
        plan,
        timestamp: new Date().toISOString(),
      },
      userId
    ),

  /**
   * User completes payment (post-webhook validation).
   */
  checkoutCompleted: (userId: string, plan: "pro", priceUsd: number) =>
    trackEvent(
      "checkout_completed",
      {
        plan,
        priceUsd,
        timestamp: new Date().toISOString(),
      },
      userId
    ),

  /**
   * User validates a coupon.
   */
  couponValidated: (userId: string | undefined, code: string, discountPct: number) =>
    trackEvent(
      "coupon_validated",
      {
        couponCode: code,
        discountPct,
        timestamp: new Date().toISOString(),
      },
      userId
    ),

  /**
   * Interview prep session started.
   */
  interviewPrepStarted: (userId: string, sessionId: string) =>
    trackEvent(
      "interview_prep_started",
      {
        sessionId,
        timestamp: new Date().toISOString(),
      },
      userId
    ),

  /**
   * Onboarding completed.
   */
  onboardingCompleted: (userId: string, profileId: string) =>
    trackEvent(
      "onboarding_completed",
      {
        profileId,
        timestamp: new Date().toISOString(),
      },
      userId
    ),
};

