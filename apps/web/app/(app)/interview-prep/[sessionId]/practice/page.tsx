import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, and } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { interviewPrepSession } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { MockQuestionsSchema } from "@repo/contracts/interview-prep";
import { PracticeClient } from "./practice-client";

export default async function PracticePage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const user = await requireAuth();

  const session = await db.query.interviewPrepSession.findFirst({
    where: and(
      eq(interviewPrepSession.id, sessionId),
      eq(interviewPrepSession.userId, user.id),
    ),
  });

  if (!session || session.status !== "ready") notFound();

  const questionsResult = MockQuestionsSchema.safeParse(session.mockQuestions);
  if (!questionsResult.success || questionsResult.data.length === 0) notFound();

  const questions = questionsResult.data;

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-16">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-sm text-muted-foreground">
            <Link href={`/interview-prep/${sessionId}`} className="hover:text-foreground">
              ← Back to prep plan
            </Link>
          </p>
          <h1 className="text-xl font-bold tracking-tight">Interview Prep</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {session.targetRole ?? "Interview"} at {session.targetCompany ?? "the company"} · {questions.length} questions
          </p>
        </div>
      </div>

      <PracticeClient sessionId={sessionId} questions={questions} />
    </div>
  );
}
