"use server";

import { cookies } from "next/headers";
import { eq } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { interviewPrepSession, profile } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { funnel } from "~/lib/analytics";
import { extractCvTextFromUpload } from "~/lib/uploads/cv-extract";

export async function startInterviewPrep(form: FormData) {
  const user = await requireAuth();

  const currentRole = (form.get("currentRole") as string | null)?.trim();
  const yearsOfExperience = (form.get("yearsOfExperience") as string | null)?.trim();
  const interviewDateStr = (form.get("interviewDate") as string | null)?.trim();
  const jobDescription = (form.get("jobDescription") as string | null)?.trim();
  const linkedinUrl = (form.get("linkedinUrl") as string | null)?.trim() || null;
  const cvTextInput = (form.get("cvText") as string | null)?.trim() || null;
  const cvUploadValue = form.get("cvUpload");
  const cvUpload = cvUploadValue instanceof File && cvUploadValue.size > 0 ? cvUploadValue : null;
  let cvExtractionSource: "pdf" | "docx" | "text" | null = null;

  if (!currentRole || !yearsOfExperience || !interviewDateStr || !jobDescription) {
    return { success: false, error: "Please fill in all required fields." };
  }

  if (jobDescription.length < 50) {
    return { success: false, error: "Job description is too short — paste the full posting." };
  }

  const interviewDate = new Date(interviewDateStr);
  if (isNaN(interviewDate.getTime()) || interviewDate <= new Date()) {
    return { success: false, error: "Interview date must be in the future." };
  }

  let cvText = cvTextInput;
  if (!cvText && cvUpload) {
    try {
      const lowerName = cvUpload.name.toLowerCase();
      if (lowerName.endsWith(".pdf")) cvExtractionSource = "pdf";
      else if (lowerName.endsWith(".docx")) cvExtractionSource = "docx";
      else cvExtractionSource = "text";
      cvText = await extractCvTextFromUpload(cvUpload);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not process uploaded CV.";
      return { success: false, error: message };
    }
  }

  const existing = await db.query.profile.findFirst({
    where: eq(profile.userId, user.id),
  });

  const now = new Date();
  const onboardedAt = existing?.onboardedAt ?? now;
  const sessionId = crypto.randomUUID();

  await Promise.all([
    db.insert(interviewPrepSession).values({
      id: sessionId,
      userId: user.id,
      interviewDate,
      jobDescription,
      linkedinUrl,
      cvText,
      status: "pending",
    }),
    db
      .insert(profile)
      .values({
        id: crypto.randomUUID(),
        userId: user.id,
        currentRole,
        yearsOfExperience,
        targetTimeline: deriveTimeline(interviewDate),
        hoursPerDay: "4",
        daysPerWeek: "5",
        onboardedAt,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: profile.userId,
        set: {
          currentRole,
          yearsOfExperience,
          targetTimeline: deriveTimeline(interviewDate),
          hoursPerDay: "4",
          daysPerWeek: "5",
          onboardedAt,
          updatedAt: now,
        },
      }),
  ]);

   if (!existing?.onboardedAt) {
     const cookieStore = await cookies();
     cookieStore.set("onboarded", "1", {
       path: "/",
       httpOnly: true,
       sameSite: "lax",
       maxAge: 60 * 60 * 24 * 365,
     });
   }

   // Track analytics
   funnel.interviewPrepStarted(user.id, sessionId).catch((err) =>
     console.error("[analytics] interview_prep_started failed:", err)
   );

   return { success: true, sessionId, cvExtractionSource };
 }

function deriveTimeline(interviewDate: Date): string {
  const days = Math.ceil((interviewDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days <= 14) return "2 weeks";
  if (days <= 28) return "4 weeks";
  if (days <= 42) return "6 weeks";
  if (days <= 60) return "2 months";
  if (days <= 90) return "3 months";
  return "4 months";
}
