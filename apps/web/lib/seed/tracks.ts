import { eq } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { track } from "@repo/db/schema";
import type { TrackMarketData } from "@repo/db/schema";

const SEED_TRACKS = [
  {
    value: "ai_ml_engineer",
    label: "AI Engineer",
    description: "Build production AI systems: LLM apps, RAG pipelines, agents, and voice AI",
    icon: "brain",
    enabled: true,
    recommended: true,
    order: 1,
    languages: ["Python"],
    dimensions: [
      { key: "python",                 label: "Python for AI" },
      { key: "llm_fundamentals_evals", label: "LLM Fundamentals & Evals" },
      { key: "context_engineering",    label: "Context Engineering" },
      { key: "rag_retrieval",          label: "RAG & Retrieval" },
      { key: "agentic_systems",        label: "Agentic Systems" },
      { key: "voice_multimodal",       label: "Voice & Multimodal" },
      { key: "system_design",          label: "System Design" },
      { key: "tooling_observability",  label: "Tooling & Observability" },
      { key: "soft_skills",            label: "Professional Skills" },
    ],
  },
  {
    value: "ml_engineer",
    label: "ML Engineer",
    description: "Train, fine-tune, and ship custom ML models at scale",
    icon: "brain",
    enabled: false,
    recommended: false,
    order: 2,
    languages: ["Python"],
    dimensions: [
      { key: "math_fundamentals", label: "Math Fundamentals" },
      { key: "python_ml",         label: "Python for ML" },
      { key: "ml_algorithms",     label: "ML Algorithms" },
      { key: "deep_learning",     label: "Deep Learning" },
      { key: "model_training",    label: "Model Training & Fine-tuning" },
      { key: "mlops",             label: "MLOps" },
      { key: "system_design",     label: "System Design" },
      { key: "soft_skills",       label: "Professional Skills" },
    ],
  },
  {
    value: "backend_engineer",
    label: "Backend Engineer",
    description: "Design APIs, databases, and scalable service architectures",
    icon: "server",
    enabled: false,
    recommended: false,
    order: 3,
    languages: ["TypeScript", "Python", "Go", "Java"],
    dimensions: [
      { key: "core_language", label: "Core Language" },
      { key: "apis", label: "APIs" },
      { key: "databases", label: "Databases" },
      { key: "auth_security", label: "Auth & Security" },
      { key: "caching", label: "Caching" },
      { key: "observability", label: "Observability" },
      { key: "messaging", label: "Messaging" },
      { key: "testing", label: "Testing" },
      { key: "delivery", label: "Delivery" },
      { key: "system_design", label: "System Design" },
      { key: "soft_skills", label: "Soft Skills" },
      { key: "english", label: "English" },
    ],
  },
  {
    value: "frontend_engineer",
    label: "Frontend Engineer",
    description: "Build fast, accessible UIs with React and modern web tooling",
    icon: "monitor",
    enabled: false,
    recommended: false,
    order: 4,
    languages: ["TypeScript", "JavaScript"],
    dimensions: [
      { key: "html_css", label: "HTML & CSS" },
      { key: "javascript", label: "JavaScript" },
      { key: "frameworks", label: "Frameworks" },
      { key: "state_data", label: "State & Data" },
      { key: "build_tooling", label: "Build Tooling" },
      { key: "performance", label: "Performance" },
      { key: "testing", label: "Testing" },
      { key: "accessibility", label: "Accessibility" },
      { key: "design_systems", label: "Design Systems" },
      { key: "security", label: "Security" },
      { key: "communication", label: "Communication" },
    ],
  },
  {
    value: "full_stack_engineer",
    label: "Full-Stack Engineer",
    description: "Own frontend and backend — end-to-end feature delivery",
    icon: "layers",
    enabled: false,
    recommended: false,
    order: 5,
    languages: ["TypeScript", "JavaScript"],
    dimensions: [
      { key: "typescript", label: "TypeScript" },
      { key: "frontend_frameworks", label: "Frontend Frameworks" },
      { key: "backend_apis", label: "Backend APIs" },
      { key: "databases", label: "Databases" },
      { key: "auth_security", label: "Auth & Security" },
      { key: "devops", label: "DevOps" },
      { key: "testing", label: "Testing" },
      { key: "observability", label: "Observability" },
      { key: "product_sense", label: "Product Sense" },
      { key: "system_design", label: "System Design" },
      { key: "soft_skills", label: "Soft Skills" },
      { key: "english", label: "English" },
    ],
  },
  {
    value: "mobile_engineer",
    label: "Mobile Engineer",
    description: "Ship iOS, Android, and cross-platform apps users love",
    icon: "smartphone",
    enabled: false,
    recommended: false,
    order: 6,
    languages: ["Swift", "Kotlin", "Dart"],
    dimensions: [
      { key: "native_language", label: "Native Language" },
      { key: "cross_platform", label: "Cross-Platform" },
      { key: "ui_navigation", label: "UI & Navigation" },
      { key: "state_architecture", label: "State Architecture" },
      { key: "networking", label: "Networking" },
      { key: "persistence", label: "Persistence" },
      { key: "platform_apis", label: "Platform APIs" },
      { key: "performance", label: "Performance" },
      { key: "security", label: "Security" },
      { key: "testing", label: "Testing" },
      { key: "release", label: "Release" },
      { key: "communication", label: "Communication" },
    ],
  },
  {
    value: "devops_engineer",
    label: "DevOps Engineer",
    description: "CI/CD, cloud infrastructure, containers, and reliability",
    icon: "cloud",
    enabled: false,
    recommended: false,
    order: 7,
    languages: ["Bash", "Python", "Go"],
    dimensions: [
      { key: "linux", label: "Linux" },
      { key: "scripting", label: "Scripting" },
      { key: "containers", label: "Containers" },
      { key: "kubernetes", label: "Kubernetes" },
      { key: "iac", label: "IaC" },
      { key: "cicd", label: "CI/CD" },
      { key: "cloud", label: "Cloud" },
      { key: "reliability", label: "Reliability" },
      { key: "security", label: "Security" },
      { key: "finops", label: "FinOps" },
      { key: "observability", label: "Observability" },
      { key: "soft_skills", label: "Soft Skills" },
      { key: "english", label: "English" },
    ],
  },
  {
    value: "data_analyst",
    label: "Data Analyst",
    description: "Turn raw data into decisions with SQL, Python, and BI tools",
    icon: "bar-chart",
    enabled: false,
    recommended: false,
    order: 8,
    languages: ["SQL", "Python"],
    dimensions: [
      { key: "sql", label: "SQL" },
      { key: "python_data", label: "Python for Data" },
      { key: "statistics", label: "Statistics" },
      { key: "visualisation", label: "Visualisation" },
      { key: "bi_tools", label: "BI Tools" },
      { key: "modelling", label: "Data Modelling" },
      { key: "etl", label: "ETL / Pipelines" },
      { key: "data_quality", label: "Data Quality" },
      { key: "domain_acumen", label: "Domain Acumen" },
      { key: "storytelling", label: "Storytelling" },
      { key: "soft_skills", label: "Soft Skills" },
      { key: "english", label: "English" },
    ],
  },
  {
    value: "qa_engineer",
    label: "QA Engineer",
    description: "Ship quality software through strategy, automation, and advocacy",
    icon: "shield-check",
    enabled: false,
    recommended: false,
    order: 9,
    languages: ["Python", "TypeScript", "Java"],
    dimensions: [
      { key: "testing_fundamentals", label: "Testing Fundamentals" },
      { key: "manual_exploratory", label: "Manual & Exploratory" },
      { key: "ui_automation", label: "UI Automation" },
      { key: "api_testing", label: "API Testing" },
      { key: "performance_testing", label: "Performance Testing" },
      { key: "security_testing", label: "Security Testing" },
      { key: "programming", label: "Programming" },
      { key: "cicd_infra", label: "CI/CD & Infra" },
      { key: "bug_advocacy", label: "Bug Advocacy" },
      { key: "quality_strategy", label: "Quality Strategy" },
      { key: "communication", label: "Communication" },
      { key: "soft_skills", label: "Soft Skills" },
      { key: "english", label: "English" },
    ],
  },
] as const;

const TRACK_MARKET_DATA: Partial<Record<string, TrackMarketData>> = {
  ai_ml_engineer: {
    roleNames: [
      "AI Engineer",
      "LLM Application Developer",
      "AI Product Engineer",
      "GenAI Engineer",
      "AI Software Engineer",
    ],
    responsibilities: [
      "Design and deploy LLM-powered applications: RAG pipelines, agents, and vector search systems",
      "Build and evaluate prompt pipelines with structured outputs and automated evaluation harnesses",
      "Implement agentic workflows with tools, memory, long-horizon planning, and multi-agent orchestration",
      "Monitor AI systems in production: latency budgets, hallucination rate, cost per call, and containment rate",
      "Collaborate with product to scope AI features, define evaluation metrics, and iteratively improve quality",
    ],
    salaryRange: {
      min: 120000,
      max: 200000,
      currency: "USD",
      period: "year",
      source: "LinkedIn Salary Insights 2026",
    },
    hiringContext:
      "High demand — 3.2× growth in AI engineering job postings YoY. Top hirers include OpenAI, Anthropic, Google DeepMind, and hundreds of funded AI startups. Remote-friendly, global.",
    curriculumPreview: [
      "Python for AI",
      "LLM Fundamentals & Evals",
      "Context Engineering",
      "RAG & Retrieval",
      "Agentic Systems",
      "Voice & Multimodal",
      "System Design",
      "Tooling & Observability",
    ],
  },
};

type RegionalSalaryRange = {
  min: number;
  max: number;
  currency: string;
  period: "year";
  source: string;
};

export const REGIONAL_SALARY_DATA: Record<string, Record<string, RegionalSalaryRange>> = {
  ai_ml_engineer: {
    US: {
      min: 120000,
      max: 200000,
      currency: "USD",
      period: "year",
      source: "LinkedIn Salary Insights 2026",
    },
    EU: {
      min: 90000,
      max: 160000,
      currency: "EUR",
      period: "year",
      source: "LinkedIn Salary Insights 2026",
    },
    AE: {
      min: 250000,
      max: 540000,
      currency: "AED",
      period: "year",
      source: "UAE Salary Market Data 2026 (Glassdoor, ERI, JobSeekers.ae)",
    },
    SA: {
      min: 140000,
      max: 230000,
      currency: "SAR",
      period: "year",
      source: "LinkedIn Salary Insights 2026",
    },
  },
};

export async function seedTracks(): Promise<void> {
  for (const t of SEED_TRACKS) {
    const exists = await db.query.track.findFirst({
      where: eq(track.value, t.value),
    });
    if (exists) continue;

    await db.insert(track).values({
      id: crypto.randomUUID(),
      ...t,
      languages: [...t.languages],
      dimensions: [...t.dimensions],
      updatedAt: new Date(),
    });
  }

  // Idempotent pass: update marketData for tracks that have it defined.
  for (const [value, marketData] of Object.entries(TRACK_MARKET_DATA)) {
    await db
      .update(track)
      .set({ marketData, updatedAt: new Date() })
      .where(eq(track.value, value));
  }
}