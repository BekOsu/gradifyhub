import { aiGenerateObject } from "./client";
import {
  JdInfoSchema, ParsedCvSchema, CompanyResearchSchema,
  GapAnalysisSchema, PrepPlanSchema, MockQuestionsSchema,
} from "@repo/contracts/interview-prep";
import type { JdInfo, ParsedCv, CompanyResearch, GapAnalysis, PrepPlan, MockQuestion } from "@repo/contracts/interview-prep";

function toIsoDate(date: Date): string {
  const [isoDate] = date.toISOString().split("T");
  return isoDate ?? date.toISOString();
}

export async function extractJdInfo(jobDescription: string, plan?: string): Promise<JdInfo> {
  return aiGenerateObject({
    plan,
    speed: "fast",
    schema: JdInfoSchema,
    system: "You are a technical recruiter. Extract structured data from job descriptions with precision. If the company name is not explicitly mentioned, infer it from context or use 'Unknown Company'.",
    prompt: `Extract structured information from this job description:\n\n${jobDescription}`,
  });
}

export async function parseCv(cvText: string | null, linkedinUrl: string | null, plan?: string): Promise<ParsedCv> {
  if (!cvText && !linkedinUrl) {
    return {
      skills: [],
      experience: "Not provided",
      tech: [],
      summary: "No CV or LinkedIn profile was provided. Gap analysis will be based solely on the job description.",
    };
  }

  const context = [
    cvText ? `CV text:\n${cvText}` : null,
    linkedinUrl ? `LinkedIn profile: ${linkedinUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  return aiGenerateObject({
    plan,
    speed: "fast",
    schema: ParsedCvSchema,
    system: "You are a senior technical recruiter. Extract the most relevant technical skills, experience level, and tech stack from candidate profiles. Be specific and evidence-based.",
    prompt: `Extract key technical information from this candidate background:\n\n${context}`,
  });
}

export async function researchCompany(jdInfo: JdInfo, plan?: string): Promise<CompanyResearch> {
  return aiGenerateObject({
    plan,
    speed: "primary",
    schema: CompanyResearchSchema,
    system: `You are an elite tech industry analyst with deep knowledge of engineering cultures and interview processes at technology companies.
Use your training knowledge to provide accurate, specific insights. If you have limited knowledge of this specific company, infer patterns from the job description and comparable companies in the same domain.`,
    prompt: `Company: ${jdInfo.company}
Role: ${jdInfo.role}
Tech stack from JD: ${jdInfo.techStack.join(", ")}

Provide:
1. Their actual/inferred tech stack (be specific — include frameworks, tools, infrastructure)
2. Engineering culture summary (2-3 sentences)
3. Interview style description (what format, what to expect)
4. 3-5 specific, actionable preparation tips tailored to this company and role`,
  });
}

export async function analyzeGaps(
  jdInfo: JdInfo,
  parsedCv: ParsedCv,
  companyResearch: CompanyResearch,
  plan?: string,
): Promise<GapAnalysis> {
  return aiGenerateObject({
    plan,
    speed: "primary",
    schema: GapAnalysisSchema,
    system: "You are a senior engineering hiring manager who has evaluated hundreds of candidates. Identify skill gaps objectively and estimate realistic study hours. Be specific about WHY each gap matters for this role.",
    prompt: `Job requirements:
${jdInfo.requirements.join("\n")}

Required tech stack: ${jdInfo.techStack.join(", ")}

Candidate skills: ${parsedCv.skills.join(", ") || "Not provided"}
Candidate tech: ${parsedCv.tech.join(", ") || "Not provided"}
Candidate experience: ${parsedCv.experience}

Company interview style: ${companyResearch.interviewStyle}

Identify:
1. Skill gaps (with priority level and estimated hours to get interview-ready)
2. Candidate strengths that are a strong match
3. Top 3 prep priorities (what to focus on most)`,
  });
}

export async function buildPrepPlan(
  gapAnalysis: GapAnalysis,
  interviewDate: Date,
  cvContext: string,
  plan?: string,
): Promise<PrepPlan> {
  const today = new Date();
  const daysUntil = Math.max(
    1,
    Math.min(30, Math.ceil((interviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))),
  );

  const dayList = Array.from({ length: daysUntil }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    return toIsoDate(d);
  });

  return aiGenerateObject({
    plan,
    speed: "primary",
    schema: PrepPlanSchema,
    system: "You are a technical interview coach. Create realistic, focused daily study plans. Front-load the highest priority items. Each day should have a clear theme and 3-5 concrete tasks.",
    prompt: `Interview date: ${toIsoDate(interviewDate)}
Days available: ${daysUntil}
Exact dates to fill: ${dayList.join(", ")}

Priority skill gaps:
${gapAnalysis.gaps.filter(g => g.priority === "high").map(g => `- ${g.skill} (~${g.estimatedHours}h): ${g.reason}`).join("\n")}

Medium priority gaps:
${gapAnalysis.gaps.filter(g => g.priority === "medium").map(g => `- ${g.skill} (~${g.estimatedHours}h)`).join("\n")}

Top priorities: ${gapAnalysis.priorities.join(", ")}
Candidate context: ${cvContext || "Not provided"}

Create a day-by-day plan. Use the exact dates provided. Focus on high-priority gaps first. Include review/mock practice days in the final 2-3 days.
totalStudyHours should reflect ~3-4 hours per day.`,
  });
}

export async function generateMockQuestions(
  jdInfo: JdInfo,
  gapAnalysis: GapAnalysis,
  plan?: string,
): Promise<MockQuestion[]> {
  return aiGenerateObject({
    plan,
    speed: "primary",
    schema: MockQuestionsSchema,
    system: `You are a senior interviewer at ${jdInfo.company}. Generate interview questions that reflect the actual style and depth of questions asked at this company for this role. Mix technical, behavioral, system design, and coding questions appropriately.`,
    prompt: `Role: ${jdInfo.role} at ${jdInfo.company}
Required tech: ${jdInfo.techStack.join(", ")}
Key requirements: ${jdInfo.requirements.slice(0, 5).join("; ")}

Candidate gaps to target:
${gapAnalysis.gaps.filter(g => g.priority !== "low").map(g => `- ${g.skill}`).join("\n")}

Generate 15-20 interview questions. Include:
- 5-7 technical questions (targeting the required stack and gaps)
- 3-4 behavioral questions (STAR-format situations relevant to the role)
- 2-3 system design questions (appropriate for the role level)
- 2-3 coding/problem-solving questions
For each question, write a one-sentence hint on what a strong answer covers.`,
  });
}
