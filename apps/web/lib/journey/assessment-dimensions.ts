import type { LucideIcon } from "lucide-react";
import {
  Brain, Bot, Code2, GitBranch, LayoutGrid, Package, Users, Globe, Map,
  Database, Shield, Zap, Terminal, Cloud, BarChart2, Smartphone, Layers,
  MessageSquare, CheckCircle2, TrendingUp, Target,
} from "lucide-react";

export interface DimensionDetail {
  label: string;
  icon: LucideIcon;
  description: string;
}

const AI_DIMENSIONS: DimensionDetail[] = [
  { label: "Python for AI",            icon: Code2,       description: "Async patterns, Pydantic, generators, and secrets management for AI systems" },
  { label: "LLM Fundamentals & Evals", icon: Brain,       description: "Tokenisation, evaluation metrics, model selection, hallucination measurement, and benchmarking" },
  { label: "Context Engineering",      icon: Bot,         description: "Prompt design, few-shot, chain-of-thought, structured output, and context window management" },
  { label: "RAG & Retrieval",          icon: LayoutGrid,  description: "Chunking, hybrid search, reranking, grounding, and RAGAS evaluation" },
  { label: "Agentic Systems",          icon: GitBranch,   description: "LangGraph, multi-agent orchestration, tool design, HITL patterns, and failure recovery" },
  { label: "Voice & Multimodal",       icon: Zap,         description: "STT/TTS pipelines, barge-in handling, latency budgeting, and multi-channel deployment" },
  { label: "System Design",            icon: Map,         description: "Async job patterns, semantic caching, rate limit handling, and production AI architecture" },
  { label: "Tooling & Observability",  icon: Package,     description: "Eval harnesses, self-healing systems, containment rate debugging, and CI/CD for AI" },
  { label: "Professional Skills",      icon: Users,       description: "Communication clarity, stakeholder management, technical discovery, and client delivery" },
];

const BACKEND_DIMENSIONS: DimensionDetail[] = [
  { label: "APIs & REST",            icon: Globe,        description: "Route design, HTTP semantics, versioning, error contracts, and API documentation" },
  { label: "Databases",              icon: Database,     description: "SQL/NoSQL design, indexing, transactions, joins, and query optimisation" },
  { label: "System Design",          icon: Map,          description: "Scalability, load balancing, caching layers, and distributed-system patterns" },
  { label: "Auth & Security",        icon: Shield,       description: "JWT, OAuth 2.0, RBAC, input validation, and secure-by-default coding practices" },
  { label: "Caching & Performance",  icon: Zap,          description: "Redis, CDN strategies, N+1 prevention, profiling, and response time optimisation" },
  { label: "Testing",                icon: CheckCircle2, description: "Unit, integration, and contract testing for backend services and APIs" },
  { label: "Dev Tooling",            icon: Package,      description: "Git workflows, Docker, CI/CD pipelines, and local environment hygiene" },
  { label: "Soft Skills",            icon: Users,        description: "Cross-team communication, technical writing, and sprint delivery habits" },
  { label: "English Proficiency",    icon: MessageSquare,description: "PR descriptions, async updates, and clear technical communication" },
];

const FRONTEND_DIMENSIONS: DimensionDetail[] = [
  { label: "HTML & CSS",             icon: LayoutGrid,   description: "Semantic markup, CSS layout systems, responsive design, and animations" },
  { label: "JavaScript",             icon: Code2,        description: "Modern ES2022+, async/await, DOM APIs, and runtime behaviour" },
  { label: "React or Vue",           icon: GitBranch,    description: "Components, hooks/composables, state patterns, and lifecycle management" },
  { label: "Performance",            icon: Zap,          description: "Core Web Vitals, lazy loading, code splitting, and bundle analysis" },
  { label: "Testing",                icon: CheckCircle2, description: "Unit testing with Vitest, component testing, and E2E with Playwright" },
  { label: "Accessibility",          icon: Users,        description: "WCAG 2.2, ARIA roles, keyboard navigation, and screen-reader compatibility" },
  { label: "Dev Tooling",            icon: Package,      description: "Vite/webpack, TypeScript, linting, formatting, and version control" },
  { label: "Soft Skills",            icon: MessageSquare,description: "Design collaboration, code review culture, and cross-functional delivery" },
  { label: "English Proficiency",    icon: Globe,        description: "Clear PR descriptions, ticket writing, and async team communication" },
];

const FULLSTACK_DIMENSIONS: DimensionDetail[] = [
  { label: "JavaScript/TypeScript",  icon: Code2,        description: "Type safety, modern patterns, async, and shared isomorphic logic" },
  { label: "Frontend Frameworks",    icon: LayoutGrid,   description: "React or Vue components, state management, and SSR/CSR trade-offs" },
  { label: "Backend APIs",           icon: Globe,        description: "REST design, server-side logic, middleware, and authentication patterns" },
  { label: "Databases",              icon: Database,     description: "SQL/NoSQL design, ORMs, indexing, and data modelling best practices" },
  { label: "System Design",          icon: Map,          description: "Architecture patterns, caching, queues, and deployment strategies" },
  { label: "Testing",                icon: CheckCircle2, description: "Full-stack testing strategies: frontend unit, backend integration, and CI gates" },
  { label: "Dev Tooling",            icon: Package,      description: "Git, Docker, CI/CD pipelines, and monorepo tooling" },
  { label: "Soft Skills",            icon: Users,        description: "Product thinking, cross-functional collaboration, and delivery habits" },
  { label: "English Proficiency",    icon: MessageSquare,description: "Technical documentation, PR culture, and stakeholder communication" },
];

const MOBILE_DIMENSIONS: DimensionDetail[] = [
  { label: "Swift or Kotlin",        icon: Code2,        description: "Platform language idioms, modern concurrency, and standard library usage" },
  { label: "UI & Navigation",        icon: Smartphone,   description: "Layouts, navigation stacks, custom components, and micro-animations" },
  { label: "State Management",       icon: GitBranch,    description: "Architecture patterns (MVVM, MVI, Flux), dependency injection, and reactivity" },
  { label: "Networking",             icon: Globe,        description: "HTTP clients, auth token flows, error handling, and offline-first design" },
  { label: "Local Storage",          icon: Database,     description: "SQLite/Room/Core Data, shared preferences, and file management" },
  { label: "Testing",                icon: CheckCircle2, description: "Unit, UI snapshot, and integration testing on device/simulator" },
  { label: "Platform APIs",          icon: Layers,       description: "Push notifications, camera, location, biometrics, and background tasks" },
  { label: "Soft Skills",            icon: Users,        description: "Designer collaboration, product feedback loops, and release planning" },
  { label: "English Proficiency",    icon: MessageSquare,description: "App store copy, user-facing messages, and team documentation" },
];

const DEVOPS_DIMENSIONS: DimensionDetail[] = [
  { label: "Linux & Shell",          icon: Terminal,     description: "Command line, Bash scripting, process management, and file system hygiene" },
  { label: "Containers",             icon: Package,      description: "Docker, image optimisation, multi-stage builds, and registry management" },
  { label: "Kubernetes",             icon: Layers,       description: "Pod design, deployments, services, ingress, ConfigMaps, and resource limits" },
  { label: "CI/CD Pipelines",        icon: GitBranch,    description: "GitHub Actions/GitLab CI, deploy strategies, feature flags, and rollback patterns" },
  { label: "Cloud Platforms",        icon: Cloud,        description: "AWS/GCP/Azure core services, IAM, VPC networking, and Terraform basics" },
  { label: "Monitoring & Alerting",  icon: BarChart2,    description: "Prometheus, Grafana, structured logging, distributed tracing, and on-call practice" },
  { label: "Security & Compliance",  icon: Shield,       description: "Secrets management, network policies, RBAC in clusters, and supply-chain hygiene" },
  { label: "Soft Skills",            icon: Users,        description: "Incident response culture, post-mortems, and cross-team coordination" },
  { label: "English Proficiency",    icon: MessageSquare,description: "Runbooks, incident reports, architecture docs, and async communication" },
];

const DATA_ANALYST_DIMENSIONS: DimensionDetail[] = [
  { label: "SQL",                    icon: Database,     description: "Complex queries, window functions, CTEs, execution plans, and query optimisation" },
  { label: "Python for Data",        icon: Code2,        description: "Pandas, NumPy, data wrangling, automation scripts, and notebook hygiene" },
  { label: "Statistics",             icon: Brain,        description: "Descriptive stats, probability distributions, A/B testing, and regression basics" },
  { label: "Data Visualisation",     icon: TrendingUp,   description: "Chart selection, dashboard design, and storytelling with data" },
  { label: "BI Tools",               icon: LayoutGrid,   description: "Tableau, Power BI, or Looker — report building, calculated fields, and data models" },
  { label: "ETL & Pipelines",        icon: GitBranch,    description: "Data extraction, transformation, scheduling, and data quality validation" },
  { label: "Communication",          icon: Globe,        description: "Translating data findings into clear, actionable insights for stakeholders" },
  { label: "Soft Skills",            icon: Users,        description: "Stakeholder management, requirements scoping, and cross-functional delivery" },
  { label: "English Proficiency",    icon: MessageSquare,description: "Analytical reports, executive summaries, and data storytelling narratives" },
];

const QA_DIMENSIONS: DimensionDetail[] = [
  { label: "Testing Fundamentals",   icon: CheckCircle2, description: "Test types, coverage metrics, quality gates, defect lifecycle, and risk-based testing" },
  { label: "Test Automation",        icon: Bot,          description: "Selenium, Playwright, or Cypress — writing maintainable, reliable test suites" },
  { label: "API Testing",            icon: Globe,        description: "REST/GraphQL contract testing, schema validation, and data-driven test scenarios" },
  { label: "CI/CD Integration",      icon: GitBranch,    description: "Running suites in pipelines, test environments, and gating deploy stages" },
  { label: "Performance Testing",    icon: Zap,          description: "Load testing with k6/JMeter, profiling hot paths, and identifying regressions" },
  { label: "Python or JavaScript",   icon: Code2,        description: "Scripting for automation, data-driven tests, custom reporters, and tooling" },
  { label: "Bug Reporting",          icon: Target,       description: "Reproduction steps, severity triage, root-cause analysis, and stakeholder updates" },
  { label: "Soft Skills",            icon: Users,        description: "Upstream defect prevention, dev partnership, and sprint quality habits" },
  { label: "English Proficiency",    icon: MessageSquare,description: "Clear bug reports, test plans, acceptance criteria, and QA documentation" },
];

export const GOAL_DIMENSION_DETAILS: Record<string, DimensionDetail[]> = {
  ai_ml_engineer:            AI_DIMENSIONS,
  land_first_ai_role:        AI_DIMENSIONS,
  ml_research_to_production: AI_DIMENSIONS,
  software_to_ai:            AI_DIMENSIONS,
  freelance_ai_engineer:     AI_DIMENSIONS,
  backend_engineer:          BACKEND_DIMENSIONS,
  frontend_engineer:         FRONTEND_DIMENSIONS,
  full_stack_engineer:       FULLSTACK_DIMENSIONS,
  mobile_engineer:           MOBILE_DIMENSIONS,
  devops_engineer:           DEVOPS_DIMENSIONS,
  data_analyst:              DATA_ANALYST_DIMENSIONS,
  qa_engineer:               QA_DIMENSIONS,
};

export function getDimensionDetails(goal: string | null | undefined): DimensionDetail[] {
  return (goal ? GOAL_DIMENSION_DETAILS[goal] : undefined) ?? AI_DIMENSIONS;
}
