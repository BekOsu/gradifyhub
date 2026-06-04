import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "~/lib/auth/auth";
import { saveFoundationCheckResults } from "~/lib/foundation/storage";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const answers = body.answers as Record<string, unknown>;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "Missing or invalid answers" },
        { status: 400 }
      );
    }

    // Validate all 5 questions answered
    const expectedQuestions = ["python", "api", "database", "cli", "git"];
    const answeredQuestions = Object.keys(answers);

    if (
      !expectedQuestions.every((q) => answeredQuestions.includes(q)) ||
      answeredQuestions.length !== expectedQuestions.length
    ) {
      return NextResponse.json(
        { error: "Not all questions answered" },
        { status: 400 }
      );
    }

    // Validate each answer is "yes", "tried", or "no"
    const validAnswers = new Set(["yes", "tried", "no"]);
    for (const [key, value] of Object.entries(answers)) {
      if (typeof value !== "string" || !validAnswers.has(value)) {
        return NextResponse.json(
          { error: `Invalid answer for ${key}` },
          { status: 400 }
        );
      }
    }

    // Calculate score: yes/tried = 1 point each, no = 0
    const score = Object.values(answers).filter((a) => a !== "no").length;
    const needsFoundationPath = score < 3;

    // Save results to profile for roadmap calibration later
    try {
      await saveFoundationCheckResults(session.user.id, answers as Record<string, string>, score);
    } catch (err) {
      console.error("Failed to save foundation-check results:", err);
    }

    return NextResponse.json({
      success: true,
      score,
      needsFoundationPath,
    });
  } catch (error) {
    console.error("Foundation check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
