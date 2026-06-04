import { eq } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { attempt, response } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { scoreResponses } from "~/lib/ai/assessment";
import { HistoryList } from "./history-list";
import Link from "next/link";

interface AttemptWithScore {
  id: string;
  completedAt: Date;
  status: "completed" | "abandoned";
  topSkill?: string;
  timeSpentMinutes: number;
}

export const metadata = {
  title: "Assessment History",
  description: "View your past assessment attempts",
};

export default async function HistoryPage() {
  const user = await requireAuth();

  const attempts = await db.query.attempt.findMany({
    where: eq(attempt.userId, user.id),
    orderBy: (a, { desc }) => [desc(a.completedAt)],
    limit: 50,
  });

  const attemptsWithScores: AttemptWithScore[] = [];

  for (const att of attempts) {
    // Only include completed or abandoned (with completedAt set)
    if (!att.completedAt) continue;

    const responses = await db.query.response.findMany({
      where: eq(response.attemptId, att.id),
    });

    let topSkill: string | undefined;

    // Calculate top skill if attempt has responses
    if (responses.length > 0 && att.status === "completed") {
      try {
        const scores = scoreResponses(
          responses.map((r) => ({ itemId: r.itemId, choiceId: r.choiceId }))
        );
        topSkill = scores[0]?.label;
      } catch (err) {
        console.error("[history] scoring failed for attempt", att.id, err);
      }
    }

    // Calculate time spent in minutes
    const timeSpentMs = att.completedAt.getTime() - att.startedAt.getTime();
    const timeSpentMinutes = Math.round(timeSpentMs / 1000 / 60);

    attemptsWithScores.push({
      id: att.id,
      completedAt: att.completedAt,
      status: att.status as "completed" | "abandoned",
      topSkill,
      timeSpentMinutes,
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assessment History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All your past assessment attempts
        </p>
      </div>

      {/* Back to assessment link */}
      <div>
        <Link
          href="/assessment"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Back to assessment
        </Link>
      </div>

      {/* History list */}
      <HistoryList attempts={attemptsWithScores} />
    </div>
  );
}
