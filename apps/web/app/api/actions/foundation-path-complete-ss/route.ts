import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "~/lib/auth/auth";
import { saveFoundationPathCompletionSS } from "~/lib/foundation/storage";
import { startFreshAttemptForTrack } from "~/actions/assessment-start";
import { SOFT_SKILLS_TRACK_GOAL } from "~/lib/journey/engineering-knowledge";

export async function POST() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await saveFoundationPathCompletionSS(session.user.id);

    const result = await startFreshAttemptForTrack(SOFT_SKILLS_TRACK_GOAL);
    return NextResponse.json({
      success: true,
      redirectUrl: `/assessment/q/1?attempt=${result.attemptId}`,
    });
  } catch (error) {
    console.error("[foundation-path-complete-ss] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
