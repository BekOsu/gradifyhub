import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "~/lib/auth/auth";
import { startFreshAttempt } from "~/actions/assessment-start";
import { saveFoundationPathCompletion } from "~/lib/foundation/storage";

export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mark foundation-path as completed
    try {
      await saveFoundationPathCompletion(session.user.id);
    } catch (err) {
      console.error("Failed to save foundation-path completion:", err);
      // Don't fail - continue to start assessment
    }

    // Start a fresh assessment attempt
    const result = await startFreshAttempt();

    if (!result?.attemptId) {
      return NextResponse.json(
        { error: "Failed to start assessment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      attemptId: result.attemptId,
      redirectUrl: `/assessment/q/1?attempt=${result.attemptId}`,
    });
  } catch (error) {
    console.error("Start assessment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
