import type { ProfileGoal } from "@repo/contracts/profile";

export const GOAL_LABELS: Record<string, string> = {
  full_stack_engineer:       "Full-Stack Engineer",
  mobile_engineer:           "Mobile Engineer",
  ai_ml_engineer:            "AI Engineer",
  ml_engineer:               "ML Engineer",
  data_analyst:              "Data Analyst",
  frontend_engineer:         "Frontend Engineer",
  backend_engineer:          "Backend Engineer",
  qa_engineer:               "QA Engineer",
  devops_engineer:           "DevOps Engineer",
  land_first_ai_role:        "AI Engineer",
  ml_research_to_production: "ML Engineer",
  software_to_ai:            "AI Engineer",
  freelance_ai_engineer:     "AI Engineer",
};

export function getGoalLabel(goal: string | null | undefined): string {
  return (goal && GOAL_LABELS[goal]) ?? "Software Engineer";
}

// Short dimension tags used in the step-3 preview card
export const GOAL_DIMENSION_TAGS: Record<string, string[]> = {
  ai_ml_engineer: [
    "Python for AI", "LLM Fundamentals & Evals", "Context Engineering", "RAG & Retrieval",
    "Agentic Systems", "System Design", "Tooling & Observability",
  ],
  ml_engineer: [
    "Python for ML", "ML Algorithms", "Deep Learning", "Model Training", "MLOps", "System Design",
  ],
  land_first_ai_role: [
    "Python for AI", "LLM Fundamentals & Evals", "Context Engineering", "RAG & Retrieval",
    "Agentic Systems", "System Design", "Tooling & Observability",
  ],
  ml_research_to_production: [
    "Python for ML", "ML Algorithms", "Deep Learning", "Model Training", "MLOps", "System Design",
  ],
  software_to_ai: [
    "Python for AI", "LLM Fundamentals & Evals", "Context Engineering", "RAG & Retrieval",
    "Agentic Systems", "System Design", "Tooling & Observability",
  ],
  freelance_ai_engineer: [
    "Python for AI", "LLM Fundamentals & Evals", "Context Engineering", "RAG & Retrieval",
    "Agentic Systems", "System Design", "Tooling & Observability",
  ],
  backend_engineer: [
    "APIs & REST", "Databases", "System Design", "Auth & Security",
    "Caching & Performance", "Testing", "Dev Tooling", "Soft Skills", "English Proficiency",
  ],
  frontend_engineer: [
    "HTML/CSS", "JavaScript", "React/Vue", "Performance", "Testing", "Accessibility", "Dev Tooling",
  ],
  full_stack_engineer: [
    "JavaScript/TypeScript", "Frontend Frameworks", "Backend APIs", "Databases", "System Design", "Testing", "Dev Tooling",
  ],
  mobile_engineer: [
    "Swift/Kotlin", "UI & Navigation", "State Management", "Networking", "Local Storage", "Testing", "Platform APIs",
  ],
  devops_engineer: [
    "Linux & Shell", "Containers", "Kubernetes", "CI/CD", "Cloud Platforms", "Monitoring", "Security",
  ],
  data_analyst: [
    "SQL", "Python for Data", "Statistics", "Data Visualisation", "BI Tools", "ETL & Pipelines", "Communication",
  ],
  qa_engineer: [
    "Testing Fundamentals", "Test Automation", "API Testing", "CI/CD Integration", "Performance Testing", "Python/JS", "Bug Reporting",
  ],
};

// Maps a user's goal value to the sidebar/roadmap track slug.
// One goal can map to one track; null means no dedicated track in the sidebar.
const GOAL_TO_TRACK_SLUG: Record<string, string> = {
  ai_ml_engineer:            "ai-engineer",
  land_first_ai_role:        "ai-engineer",
  software_to_ai:            "ai-engineer",
  freelance_ai_engineer:     "ai-engineer",
  ml_engineer:               "ai-engineer",
  ml_research_to_production: "ai-engineer",
};

export function goalToTrackSlug(goal: string | null | undefined): string | null {
  return (goal && GOAL_TO_TRACK_SLUG[goal]) ?? null;
}

export function getGoalDimensionTags(goal: ProfileGoal | string | null | undefined): string[] {
  return (goal ? GOAL_DIMENSION_TAGS[goal] : undefined) ?? GOAL_DIMENSION_TAGS.ai_ml_engineer!;
}
