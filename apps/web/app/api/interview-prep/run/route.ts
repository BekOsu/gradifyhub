import { and, eq } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { interviewPrepSession } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { getUserPlan } from "~/lib/billing/hasFeature";
import {
  extractJdInfo,
  parseCv,
  researchCompany,
  analyzeGaps,
  buildPrepPlan,
  generateMockQuestions,
} from "~/lib/ai/interview-prep-agents";

// Maximum function duration — ensure Vercel Pro (60s) or self-hosted
export const maxDuration = 60;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timed out after ${ms / 1_000}s — try again`)),
        ms
      )
    ),
  ]);
}

type StepEvent =
  | { step: "jd_extracted" }
  | { step: "cv_parsed" }
  | { step: "company_researched" }
  | { step: "gaps_analyzed" }
  | { step: "plan_built" }
  | { step: "questions_generated" }
  | { step: "done" }
  | { step: "error"; error: string };

export async function POST(req: Request) {
  const user = await requireAuth();
  const plan = await getUserPlan(user.id);
  const { sessionId } = (await req.json()) as { sessionId: string };

  const session = await db.query.interviewPrepSession.findFirst({
    where: and(
      eq(interviewPrepSession.id, sessionId),
      eq(interviewPrepSession.userId, user.id),
    ),
  });

  if (!session) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: StepEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        await db
          .update(interviewPrepSession)
          .set({ status: "processing", updatedAt: new Date() })
          .where(eq(interviewPrepSession.id, sessionId));

        // Step 1: parse the job description (15s budget)
        const jdInfo = await withTimeout(
          extractJdInfo(session.jobDescription, plan),
          15_000,
          "JD extraction"
        );
        await db
          .update(interviewPrepSession)
          .set({ targetCompany: jdInfo.company, targetRole: jdInfo.role, updatedAt: new Date() })
          .where(eq(interviewPrepSession.id, sessionId));
        send({ step: "jd_extracted" });

        // Steps 2 + 3: CV parsing and company research in parallel (20s budget)
        const [parsedCv, companyResearch] = await withTimeout(
          Promise.all([
            parseCv(session.cvText, session.linkedinUrl, plan),
            researchCompany(jdInfo, plan),
          ]),
          20_000,
          "CV parsing + company research"
        );
        await db
          .update(interviewPrepSession)
          .set({ parsedCv, companyResearch, updatedAt: new Date() })
          .where(eq(interviewPrepSession.id, sessionId));
        send({ step: "cv_parsed" });
        send({ step: "company_researched" });

        // Step 4: gap analysis (15s budget)
        const gapAnalysis = await withTimeout(
          analyzeGaps(jdInfo, parsedCv, companyResearch, plan),
          15_000,
          "Gap analysis"
        );
        await db
          .update(interviewPrepSession)
          .set({ gapAnalysis, updatedAt: new Date() })
          .where(eq(interviewPrepSession.id, sessionId));
        send({ step: "gaps_analyzed" });

        // Steps 5 + 6: prep plan and mock questions in parallel (20s budget)
        const [prepPlan, mockQuestions] = await withTimeout(
          Promise.all([
            buildPrepPlan(gapAnalysis, session.interviewDate, session.cvText ?? "", plan),
            generateMockQuestions(jdInfo, gapAnalysis, plan),
          ]),
          20_000,
          "Prep plan + mock questions"
        );
        await db
          .update(interviewPrepSession)
          .set({ prepPlan, mockQuestions, status: "ready", updatedAt: new Date() })
          .where(eq(interviewPrepSession.id, sessionId));
        send({ step: "plan_built" });
        send({ step: "questions_generated" });
        send({ step: "done" });
      } catch (err) {
        const rawError = err instanceof Error ? err.message : "Pipeline failed";
        const error = /invalid x-api-key/i.test(rawError)
          ? "AI provider key is invalid. Please update Anthropic API key configuration."
          : rawError;
        if (/invalid x-api-key/i.test(rawError)) {
          console.error("[interview-prep] invalid Anthropic key. Check AGENT_ANTHROPIC_API_KEY / ANTHROPIC_API_KEY");
        }
        await db
          .update(interviewPrepSession)
          .set({ status: "failed", error, updatedAt: new Date() })
          .where(eq(interviewPrepSession.id, sessionId))
          .catch(() => {});
        send({ step: "error", error });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
