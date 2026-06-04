import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "~/lib/auth/auth";
import { saveFoundationCheckResultsSS } from "~/lib/foundation/storage";

const EXPECTED_QUESTIONS = ["written", "discovery", "async", "codereview", "conflict"];

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const answers = body.answers as Record<string, unknown>;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Missing or invalid answers" }, { status: 400 });
    }

    const answeredQuestions = Object.keys(answers);
    if (
      !EXPECTED_QUESTIONS.every((q) => answeredQuestions.includes(q)) ||
      answeredQuestions.length !== EXPECTED_QUESTIONS.length
    ) {
      return NextResponse.json({ error: "Not all questions answered" }, { status: 400 });
    }

    const validAnswers = new Set(["yes", "tried", "no"]);
    for (const [key, value] of Object.entries(answers)) {
      if (typeof value !== "string" || !validAnswers.has(value)) {
        return NextResponse.json({ error: `Invalid answer for ${key}` }, { status: 400 });
      }
    }

    const score = Object.values(answers).filter((a) => a !== "no").length;
    const needsFoundationPath = score < 3;

    try {
      await saveFoundationCheckResultsSS(session.user.id, answers as Record<string, string>, score);
    } catch (err) {
      console.error("[foundation-check-ss] Failed to save results:", err);
    }

    return NextResponse.json({ success: true, score, needsFoundationPath });
  } catch (error) {
    console.error("[foundation-check-ss] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
