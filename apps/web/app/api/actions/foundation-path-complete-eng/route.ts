import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "~/lib/auth/auth";
import { saveFoundationPathCompletionEng } from "~/lib/foundation/storage";
import { startFreshAttemptForTrack } from "~/actions/assessment-start";
import { ENGLISH_PROFICIENCY_TRACK_GOAL } from "~/lib/journey/engineering-knowledge";

export async function POST() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await saveFoundationPathCompletionEng(session.user.id);

    const result = await startFreshAttemptForTrack(ENGLISH_PROFICIENCY_TRACK_GOAL);
    return NextResponse.json({
      success: true,
      redirectUrl: `/assessment/q/1?attempt=${result.attemptId}`,
    });
  } catch (error) {
    console.error("[foundation-path-complete-eng] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
