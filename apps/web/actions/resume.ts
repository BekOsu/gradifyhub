"use server";

import { and, eq } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { resume } from "@repo/db/schema";
import { z } from "zod";
import { requireAuth } from "~/lib/auth/session";
import { getUserResume, getUserProfile } from "@repo/db/queries/resume";
import { getUserRoadmap } from "@repo/db/queries/roadmap";
import { aiGenerateObject, aiGenerateText, primaryModel } from "~/lib/ai/client";
import { extractCvTextFromUpload } from "~/lib/uploads/cv-extract";
import { getUserPlan } from "~/lib/billing/hasFeature";
import { DEFAULT_SECTION_ORDER, normalizeSectionOrder } from "~/lib/resume/layout";
import type { ResumeContent } from "~/lib/resume/types";
import { getGoalLabel } from "~/lib/journey/goals";



function emptyContent(name: string, email: string): ResumeContent {
  return {
    meta: {
      template: "modern",
      sectionOrder: DEFAULT_SECTION_ORDER,
    },
    personalInfo: {
      name,
      email,
      phone: "",
      location: "Remote",
      linkedin: "",
      github: "",
      website: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
  };
}

export async function getOrCreateResume() {
  const user = await requireAuth();

  const existing = await getUserResume(user.id);
  if (existing) return existing;

  const [userProfile, userRoadmap] = await Promise.all([
    getUserProfile(user.id),
    getUserRoadmap(user.id),
  ]);

  const content = emptyContent(user.name ?? "", user.email ?? "");

  // Pre-fill skills from onboarding knownStack + completed roadmap skills
  const skillSet = new Set<string>();
  const knownStack = userProfile?.knownStack as {
    languages?: string[];
    frameworks?: string[];
    custom?: string;
  } | null;
  if (knownStack) {
    knownStack.languages?.forEach((s) => skillSet.add(s));
    knownStack.frameworks?.forEach((s) => skillSet.add(s));
    if (knownStack.custom) {
      knownStack.custom
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => skillSet.add(s));
    }
  }
  userRoadmap?.phases
    .flatMap((p) => p.skills)
    .filter((s) => s.status === "completed")
    .forEach((s) => skillSet.add(s.name));

  content.skills = Array.from(skillSet);

  // Build summary from profile
  if (userProfile?.currentRole) {
    const goalLabel = userProfile.goal ? getGoalLabel(userProfile.goal) : null;
    const exp = userProfile.yearsOfExperience;
    let summary = `${userProfile.currentRole} with ${exp ?? "several"} years of experience`;
    if (goalLabel) summary += `, currently building toward ${goalLabel}`;
    content.summary = summary + ".";
  }

  const newResume = {
    id: crypto.randomUUID(),
    userId: user.id,
    title: "My Resume",
    content,
    isPublic: false,
    publicSlug: null as string | null,
  };

  await db.insert(resume).values(newResume);

  return db.query.resume.findFirst({
    where: eq(resume.id, newResume.id),
  });
}

export async function getResume() {
  const user = await requireAuth();
  return getUserResume(user.id);
}

const ResumeIntakeSchema = z.object({
  summary: z.string().default(""),
  skills: z.array(z.string()).default([]),
});

export async function createResumeFromIntake(form: FormData) {
  const user = await requireAuth();

  const existing = await getUserResume(user.id);

  const linkedinUrl = (form.get("linkedinUrl") as string | null)?.trim() || "";
  const cvTextInput = (form.get("cvText") as string | null)?.trim() || "";
  const cvUploadValue = form.get("cvUpload");
  const cvUpload = cvUploadValue instanceof File && cvUploadValue.size > 0 ? cvUploadValue : null;
  const uploadedExt = cvUpload?.name.toLowerCase().split(".").pop() ?? "";

  let cvText = cvTextInput;
  if (!cvText && cvUpload) {
    try {
      cvText = await extractCvTextFromUpload(cvUpload);
    } catch (err) {
      return {
        success: false as const,
        error: err instanceof Error ? err.message : "Could not extract text from uploaded CV.",
      };
    }
  }

  const target = existing ?? (await getOrCreateResume());
  if (!target) {
    return { success: false as const, error: "Could not create resume." };
  }

  const content = target.content as ResumeContent;

  const intakeSource: NonNullable<ResumeContent["meta"]>["intakeSource"] = cvText
    ? cvUpload
      ? uploadedExt === "pdf"
        ? "pdf"
        : uploadedExt === "docx"
          ? "docx"
          : "text"
      : "manual"
    : linkedinUrl
      ? "linkedin"
      : undefined;

  const nextContent: ResumeContent = {
    ...content,
    meta: {
      ...(content.meta ?? {}),
      intakeSource,
      hasLinkedin: Boolean(linkedinUrl || content.personalInfo.linkedin),
      sectionOrder: normalizeSectionOrder(content.meta?.sectionOrder),
    },
    personalInfo: {
      ...content.personalInfo,
      linkedin: linkedinUrl || content.personalInfo.linkedin,
    },
  };

  if (cvText || linkedinUrl) {
    try {
      const plan = await getUserPlan(user.id);
      const parsed = await aiGenerateObject({
        plan,
        speed: "fast",
        schema: ResumeIntakeSchema,
        system:
          "You are a resume parser. Extract a concise professional summary and a clean list of technical skills. Keep output factual and grounded in input.",
        prompt: `Candidate context:\n${cvText ? `CV text:\n${cvText}` : "No CV text provided."}\n\n${linkedinUrl ? `LinkedIn URL: ${linkedinUrl}` : "No LinkedIn URL provided."}\n\nReturn:\n- summary: 2-4 sentence resume summary\n- skills: list of concrete technical skills only`,
      });

      if (parsed.summary?.trim()) {
        nextContent.summary = parsed.summary.trim();
      }

      if (parsed.skills.length > 0) {
        const merged = new Set<string>([...nextContent.skills, ...parsed.skills.map((s) => s.trim()).filter(Boolean)]);
        nextContent.skills = Array.from(merged);
      }
    } catch {
      if (!nextContent.summary && cvText) {
        nextContent.summary = cvText.slice(0, 320).trim();
      }
    }
  }

  await db
    .update(resume)
    .set({ content: nextContent, updatedAt: new Date() })
    .where(eq(resume.id, target.id));

  return { success: true as const, resumeId: target.id };
}

export async function saveResume(resumeId: string, content: unknown) {
  const user = await requireAuth();

  const existing = await db.query.resume.findFirst({
    where: and(eq(resume.id, resumeId), eq(resume.userId, user.id)),
  });

  if (!existing) {
    return { success: false, error: "Not found" };
  }

  if (typeof content !== "object" || content === null || Array.isArray(content)) {
    return { success: false, error: "Invalid content shape" };
  }

  await db
    .update(resume)
    .set({ content, updatedAt: new Date() })
    .where(eq(resume.id, resumeId));

  return { success: true };
}

export async function optimizeResume(resumeId: string) {
  const user = await requireAuth();

  const [existing, userProfile] = await Promise.all([
    db.query.resume.findFirst({
      where: and(eq(resume.id, resumeId), eq(resume.userId, user.id)),
    }),
    getUserProfile(user.id),
  ]);

  if (!existing) {
    return { success: false as const, error: "Not found" };
  }

  const resumeContent = existing.content as ResumeContent;
  const roleLabel = getGoalLabel(userProfile?.goal);

  const raw = await aiGenerateText({
    model: primaryModel,
    system:
      `You are an expert technical resume writer specialising in ${roleLabel} roles. Be specific, use active verbs, quantify impact where possible. Return only the optimised text, no preamble.`,
    prompt: `Optimise this resume summary and experience descriptions for a ${roleLabel} role. Current resume: ${JSON.stringify(resumeContent, null, 2)}. Return a JSON object with keys: "summary" (improved summary string) and "suggestions" (array of 3 specific improvement tips as strings).`,
  });

  try {
    // Strip markdown code fences if the model wrapped the JSON
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(cleaned) as { summary?: string; suggestions?: string[] };
    return {
      success: true as const,
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [raw],
    };
  } catch {
    return {
      success: true as const,
      summary: "",
      suggestions: [raw],
    };
  }
}

export async function togglePublic(resumeId: string) {
  const user = await requireAuth();

  const existing = await db.query.resume.findFirst({
    where: and(eq(resume.id, resumeId), eq(resume.userId, user.id)),
  });

  if (!existing) {
    return { success: false as const, error: "Not found" };
  }

  const makingPublic = !existing.isPublic;
  const publicSlug = makingPublic
    ? (existing.publicSlug ?? crypto.randomUUID().slice(0, 8))
    : existing.publicSlug;

  await db
    .update(resume)
    .set({
      isPublic: makingPublic,
      publicSlug,
      updatedAt: new Date(),
    })
    .where(eq(resume.id, resumeId));

  return {
    success: true as const,
    isPublic: makingPublic,
    publicSlug: makingPublic ? publicSlug : null,
  };
}
