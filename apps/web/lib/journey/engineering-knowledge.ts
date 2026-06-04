// Static knowledge module — transcribed from local-only/data/engineering-roadmap.md.
// Used to inject track-specific skill ladder context into roadmap generation prompts.
// "levels" use the roadmap spec's L1–L4 naming; L0 = below L1 foundations (MCQ < 30%).

export type LevelDescription = string; // one-line description of what this level means

export type TrackDimension = {
  key: string;
  label: string;
  isCritical: boolean; // from the criticality matrix in assessment-guide.md
  levels: {
    L1: LevelDescription;
    L2: LevelDescription;
    L3: LevelDescription;
    L4: LevelDescription;
  };
};

export type TrackKnowledge = {
  trackLabel: string;
  dimensions: TrackDimension[];
};

// ─── AI / ML Engineer ───────────────────────────────────────────────────────
// Uses existing 9-dimension structure from assessment.ts (founding track).
// Dimension keys match DIMENSION_LABELS keys for MCQ score injection.

const AI_TRACK: TrackKnowledge = {
  trackLabel: "AI / ML Engineer",
  dimensions: [
    {
      key: "python",
      label: "Python for AI",
      isCritical: true,
      levels: {
        L1: "writes basic scripts, uses AI libraries with docs open",
        L2: "async patterns, type hints, production-quality code, fluent in numpy/pandas/requests",
        L3: "optimised pipelines, memory-efficient patterns, profiling, builds reusable modules",
        L4: "contributes to Python AI libraries, debugs at CPython/extension level",
      },
    },
    {
      key: "llm_fundamentals_evals",
      label: "LLM Fundamentals & Evals",
      isCritical: true,
      levels: {
        L1: "explains tokens, context windows, and the difference between encoder/decoder models",
        L2: "selects models by task (latency, cost, capability), measures hallucination rate and faithfulness",
        L3: "designs eval harnesses, builds golden test sets, benchmarks models systematically before deploying",
        L4: "drives LLM evaluation methodology for the team, keeps up with research, advises on model strategy",
      },
    },
    {
      key: "context_engineering",
      label: "Context Engineering",
      isCritical: true,
      levels: {
        L1: "calls an LLM API, writes a basic system prompt",
        L2: "few-shot examples, chain-of-thought, token management, cost-aware prompt design",
        L3: "structured output pipelines, prompt versioning, evaluates quality systematically, handles edge cases",
        L4: "designs context engineering standards org-wide, sets prompt evaluation frameworks",
      },
    },
    {
      key: "rag_retrieval",
      label: "RAG & Retrieval",
      isCritical: true,
      levels: {
        L1: "knows what RAG is, has followed a tutorial",
        L2: "builds a RAG pipeline (embed → store → retrieve → generate), handles chunking strategies",
        L3: "hybrid search, reranking, RAGAS evaluation, production-ready multilingual retrieval pipeline",
        L4: "designs retrieval architectures at scale, sets RAG patterns for the organisation",
      },
    },
    {
      key: "agentic_systems",
      label: "Agentic Systems",
      isCritical: true,
      levels: {
        L1: "knows what an agent is, has used LangChain or LlamaIndex",
        L2: "builds multi-step agents with tool use, handles retries and error cases",
        L3: "designs reliable agentic systems with HITL, multi-agent orchestration, observability for LLM pipelines",
        L4: "defines agentic architecture standards, mentors others, handles edge failure modes at scale",
      },
    },
    {
      key: "voice_multimodal",
      label: "Voice & Multimodal",
      isCritical: false,
      levels: {
        L1: "knows what STT and TTS are, has called a voice API",
        L2: "builds a full STT → LLM → TTS pipeline, understands latency budget and tradeoffs",
        L3: "handles barge-in with VAD, tunes for <800ms end-to-end, deploys multi-channel (chat + voice + email)",
        L4: "designs voice AI platform infrastructure, sets latency and quality standards org-wide",
      },
    },
    {
      key: "system_design",
      label: "System Design",
      isCritical: true,
      levels: {
        L1: "understands client/server, API, database fundamentals",
        L2: "designs AI-powered services with queues, caching, async processing",
        L3: "scales AI systems (batching, streaming, rate limiting), failure modes, cost optimisation",
        L4: "designs AI platform infrastructure that others build on",
      },
    },
    {
      key: "tooling_observability",
      label: "Tooling & Observability",
      isCritical: false,
      levels: {
        L1: "uses Git and an editor comfortably, runs scripts, reads logs",
        L2: "Docker, CI/CD basics, containment rate tracking, eval harness basics",
        L3: "self-healing systems (detect + recover + learn), production eval pipelines, debugs containment drops",
        L4: "builds AI observability platforms for the team, sets quality bar for production deployments",
      },
    },
    {
      key: "soft_skills",
      label: "Professional Skills",
      isCritical: false,
      levels: {
        L1: "communicates status clearly, asks for help appropriately, writes clear async messages",
        L2: "explains technical systems to non-technical stakeholders, manages up, gives useful code review",
        L3: "runs technical discovery calls, aligns stakeholders, writes design docs that get adopted",
        L4: "mentors others into L3, shapes team culture and client relationship standards",
      },
    },
  ],
};

// ─── Backend Engineer ────────────────────────────────────────────────────────
// 9 dimensions — matches BACKEND_DIMENSIONS in assessment-dimensions.ts exactly.
// Keys match the item bank dimension strings.

const BACKEND_TRACK: TrackKnowledge = {
  trackLabel: "Backend Engineer",
  dimensions: [
    {
      key: "core_language",
      label: "Core Language & Runtime",
      isCritical: true,
      levels: {
        L1: "syntax, stdlib, writes scripts; understands async/await basics",
        L2: "idiomatic code, async/concurrency patterns, package management, event loop model",
        L3: "memory model, GC tuning, picks the right concurrency primitive; profiling",
        L4: "contributes to libraries, debugs runtime-level issues (GIL, JVM flags, event loop stalls)",
      },
    },
    {
      key: "apis",
      label: "APIs & REST",
      isCritical: true,
      levels: {
        L1: "builds CRUD REST endpoints with correct HTTP semantics",
        L2: "pagination, versioning, error modelling, OpenAPI specs",
        L3: "chooses REST vs gRPC vs GraphQL with reasoning, designs idempotent + backward-compatible APIs",
        L4: "sets API guidelines for the org, handles deprecation across consumers",
      },
    },
    {
      key: "databases",
      label: "Databases",
      isCritical: true,
      levels: {
        L1: "writes SELECT/INSERT, basic joins",
        L2: "normalisation, indexes, transactions, ORM fluency",
        L3: "reads EXPLAIN plans, picks SQL vs NoSQL by access pattern, designs for scale",
        L4: "shards, tunes replication, recovers from corruption, owns schema evolution strategy",
      },
    },
    {
      key: "system_design",
      label: "System Design",
      isCritical: true,
      levels: {
        L1: "understands client–server, monolith vs microservice trade-offs",
        L2: "designs a small service with queue + DB + cache",
        L3: "handles consistency models, partitioning, failure modes; runs design reviews",
        L4: "designs platforms others build on; owns multi-team architectural direction",
      },
    },
    {
      key: "messaging",
      label: "Messaging & Streaming",
      isCritical: false,
      levels: {
        L1: "knows what a queue is, has used one (SQS, RabbitMQ, or similar)",
        L2: "produces/consumes Kafka or SQS, handles retries and dead-letter queues",
        L3: "designs exactly-once / outbox / saga patterns, manages consumer lag",
        L4: "operates Kafka clusters at scale, designs event schemas org-wide",
      },
    },
    {
      key: "auth_security",
      label: "Auth & Security",
      isCritical: false,
      levels: {
        L1: "implements login with a library; knows JWT basics",
        L2: "OAuth2/OIDC flows, JWT pitfalls, RBAC, input validation",
        L3: "threat-models a service, handles secrets rotation, knows OWASP cold",
        L4: "leads security reviews, designs zero-trust boundaries",
      },
    },
    {
      key: "caching",
      label: "Caching & Performance",
      isCritical: false,
      levels: {
        L1: "adds Redis to speed something up",
        L2: "cache invalidation strategies, TTLs, profiles basic hot paths",
        L3: "identifies N+1, designs multi-layer caches, capacity plans",
        L4: "tunes at syscall/network level, owns latency SLOs",
      },
    },
    {
      key: "testing",
      label: "Testing",
      isCritical: false,
      levels: {
        L1: "writes unit tests when asked",
        L2: "TDD-comfortable, integration tests, mocks vs fakes",
        L3: "contract testing, mutation testing, designs the test pyramid for a service",
        L4: "sets quality bar org-wide, builds testing infra",
      },
    },
    {
      key: "observability",
      label: "Observability",
      isCritical: false,
      levels: {
        L1: "adds log statements, reads dashboards",
        L2: "structured logs, custom metrics, basic distributed traces",
        L3: "designs SLOs, instruments with OpenTelemetry, debugs prod from telemetry alone",
        L4: "owns the observability platform, defines what 'operable' means for new services",
      },
    },
    {
      key: "delivery",
      label: "Dev Tooling",
      isCritical: false,
      levels: {
        L1: "uses Docker and Git comfortably, pushes to a CI pipeline",
        L2: "writes Dockerfiles, configures CI pipelines with caching and secrets",
        L3: "designs deployment strategies (blue/green, canary), IaC for own service",
        L4: "builds platform tooling, sets delivery standards org-wide",
      },
    },
    {
      key: "soft_skills",
      label: "Soft Skills",
      isCritical: false,
      levels: {
        L1: "writes clear PR descriptions, asks for help well",
        L2: "runs design discussions, gives useful code review",
        L3: "aligns stakeholders, writes RFCs that get adopted",
        L4: "influences across teams, mentors others into L3",
      },
    },
    {
      key: "english",
      label: "English Proficiency",
      isCritical: false,
      levels: {
        L1: "reads technical docs comfortably",
        L2: "writes clear async messages, tickets, and commit messages",
        L3: "writes design docs and postmortems that travel well across teams",
        L4: "sets the writing bar for the team",
      },
    },
  ],
};

// ─── Frontend Engineer ───────────────────────────────────────────────────────

const FRONTEND_TRACK: TrackKnowledge = {
  trackLabel: "Frontend Engineer",
  dimensions: [
    {
      key: "html_css",
      label: "HTML, CSS & Modern Layout",
      isCritical: true,
      levels: {
        L1: "semantic HTML, basic CSS, builds a static page",
        L2: "Flexbox/Grid fluency, responsive design, custom properties",
        L3: "container queries, layout systems at scale, picks CSS architecture with reasoning",
        L4: "defines the org's CSS strategy, fluent in browser rendering pipeline",
      },
    },
    {
      key: "javascript",
      label: "JavaScript / TypeScript",
      isCritical: true,
      levels: {
        L1: "ES6 syntax, basic types, wires up event handlers",
        L2: "async/await, modules, generics, comfortable in strict TS",
        L3: "advanced types (conditional, mapped), runtime/compile-time boundaries",
        L4: "writes type infrastructure others depend on, debugs at language spec level",
      },
    },
    {
      key: "frameworks",
      label: "Frameworks (React/Vue + meta-frameworks)",
      isCritical: true,
      levels: {
        L1: "builds components, understands props/state",
        L2: "hooks/composition, routing, data fetching, basic SSR/SSG",
        L3: "server components, streaming, hydration trade-offs; picks meta-framework with reasoning",
        L4: "defines framework conventions, handles edge cases others can't",
      },
    },
    {
      key: "state_data",
      label: "State & Data Fetching",
      isCritical: false,
      levels: {
        L1: "useState, prop drilling",
        L2: "context, reducers, server state libraries (TanStack Query/SWR)",
        L3: "cache invalidation strategy, optimistic updates, designs state architecture",
        L4: "builds state primitives, owns app-wide data flow patterns",
      },
    },
    {
      key: "build_tooling",
      label: "Build & Tooling",
      isCritical: false,
      levels: {
        L1: "runs `npm run dev`, basic Vite/webpack config",
        L2: "bundling, code splitting, env management, monorepo basics",
        L3: "tunes build performance, designs module boundaries, custom plugins",
        L4: "owns build infra across teams, contributes to bundler ecosystems",
      },
    },
    {
      key: "performance",
      label: "Performance & Core Web Vitals",
      isCritical: true,
      levels: {
        L1: "knows LCP/INP/CLS exist, runs Lighthouse",
        L2: "lazy loading, image optimisation, bundle analysis",
        L3: "profiles with DevTools, fixes hydration cost, owns perf budgets",
        L4: "designs perf strategy, optimises at network/render-pipeline level",
      },
    },
    {
      key: "testing",
      label: "Testing",
      isCritical: false,
      levels: {
        L1: "writes a few unit tests with Vitest/Jest",
        L2: "component testing (Testing Library), basic E2E (Playwright)",
        L3: "visual regression, MSW for API mocking, designs the test strategy",
        L4: "builds test infra, sets bar across teams",
      },
    },
    {
      key: "accessibility",
      label: "Accessibility",
      isCritical: true,
      levels: {
        L1: "uses semantic HTML, alt text",
        L2: "ARIA basics, keyboard nav, colour contrast",
        L3: "screen reader testing, complex widgets (combobox, tree), audits for WCAG AA",
        L4: "drives a11y culture, fixes deep platform issues, advises product",
      },
    },
    {
      key: "design_systems",
      label: "Design Sense & Systems",
      isCritical: false,
      levels: {
        L1: "matches a Figma mockup",
        L2: "design tokens, spacing/typography systems, component library usage",
        L3: "builds reusable component libraries, partners deeply with designers",
        L4: "co-owns the design system, defines visual language",
      },
    },
    {
      key: "security",
      label: "Security",
      isCritical: false,
      levels: {
        L1: "knows XSS exists",
        L2: "CSP basics, sanitisation, secure cookies, CSRF tokens",
        L3: "client-side auth flows, SRI, supply-chain awareness (lockfiles, audits)",
        L4: "leads frontend security reviews, designs secure-by-default patterns",
      },
    },
    {
      key: "communication",
      label: "Communication & Collaboration",
      isCritical: false,
      levels: {
        L1: "clear PR descriptions, asks for help",
        L2: "gives useful design/code review, partners with backend on contracts",
        L3: "leads cross-functional discussions with product/design/backend",
        L4: "influences product direction, mentors others",
      },
    },
    {
      key: "english",
      label: "English",
      isCritical: false,
      levels: {
        L1: "reads docs comfortably",
        L2: "writes clear tickets and async messages",
        L3: "writes design docs/RFCs that travel",
        L4: "sets the writing bar",
      },
    },
  ],
};

// ─── Full-Stack Engineer ─────────────────────────────────────────────────────

const FULLSTACK_TRACK: TrackKnowledge = {
  trackLabel: "Full-Stack Engineer",
  dimensions: [
    {
      key: "typescript",
      label: "TypeScript End-to-End",
      isCritical: true,
      levels: {
        L1: "writes typed React + Node code",
        L2: "shared types across client/server, generics, strict mode",
        L3: "end-to-end type safety (tRPC/Zod), inference at API boundaries",
        L4: "designs type infrastructure for the codebase",
      },
    },
    {
      key: "frontend_frameworks",
      label: "Frontend Frameworks (Next/Nuxt/Remix)",
      isCritical: false,
      levels: {
        L1: "builds pages, uses file-based routing",
        L2: "SSR/SSG/ISR, data fetching patterns, layouts",
        L3: "server components, streaming, edge rendering trade-offs",
        L4: "defines framework conventions, handles complex deployment topologies",
      },
    },
    {
      key: "backend_apis",
      label: "Backend & APIs",
      isCritical: true,
      levels: {
        L1: "builds REST endpoints in Node/Python",
        L2: "tRPC/GraphQL/REST fluency, validation, error modelling",
        L3: "picks API style by use case, designs for evolution",
        L4: "sets API standards across services",
      },
    },
    {
      key: "databases",
      label: "Databases & ORMs",
      isCritical: true,
      levels: {
        L1: "basic Postgres queries via Prisma/Drizzle",
        L2: "migrations, indexes, transactions, relations",
        L3: "query optimisation, schema evolution, connection pooling",
        L4: "owns DB strategy, handles scale issues (read replicas, partitioning)",
      },
    },
    {
      key: "auth_security",
      label: "Auth & Security",
      isCritical: false,
      levels: {
        L1: "uses an auth library (NextAuth/Better Auth)",
        L2: "sessions vs JWTs, OAuth flows, secure cookies",
        L3: "edge auth, multi-tenant patterns, threat modelling",
        L4: "leads security architecture across the stack",
      },
    },
    {
      key: "system_design",
      label: "System Design (mid-scale)",
      isCritical: false,
      levels: {
        L1: "understands client/server/DB layout",
        L2: "adds caching, queues, background jobs",
        L3: "designs for 100k–1M users: CDN, queues, read replicas",
        L4: "scales beyond, handles multi-region, owns architecture",
      },
    },
    {
      key: "devops",
      label: "DevOps Essentials",
      isCritical: false,
      levels: {
        L1: "deploys to Vercel/Render/Fly with defaults",
        L2: "Dockerises, sets up CI/CD, preview environments",
        L3: "IaC (Terraform), monitoring, secret management",
        L4: "owns delivery infra, designs deployment strategy",
      },
    },
    {
      key: "testing",
      label: "Testing Across the Stack",
      isCritical: false,
      levels: {
        L1: "writes a few tests on each side",
        L2: "integration tests with real DB, component tests, E2E happy paths",
        L3: "contract tests between client/server, designs the pyramid",
        L4: "sets testing strategy, builds infra",
      },
    },
    {
      key: "observability",
      label: "Observability",
      isCritical: false,
      levels: {
        L1: "uses Sentry/PostHog out of the box",
        L2: "structured logs, custom events, basic dashboards",
        L3: "traces requests across client→API→DB, owns SLOs",
        L4: "designs the observability stack",
      },
    },
    {
      key: "product_sense",
      label: "Product Sense",
      isCritical: true,
      levels: {
        L1: "builds what the ticket says",
        L2: "questions ambiguous requirements, suggests simpler paths",
        L3: "scopes MVPs, makes build vs buy calls, owns iteration loop",
        L4: "shapes product direction, partners with PMs as a peer",
      },
    },
    {
      key: "communication",
      label: "Communication & Collaboration",
      isCritical: false,
      levels: {
        L1: "clear PR descriptions, asks for help",
        L2: "runs design discussions, gives useful review",
        L3: "aligns stakeholders, writes RFCs that get adopted",
        L4: "influences across teams, mentors others",
      },
    },
    {
      key: "english",
      label: "English",
      isCritical: false,
      levels: {
        L1: "reads docs comfortably",
        L2: "writes clear async messages and tickets",
        L3: "writes design docs that travel",
        L4: "sets the writing bar",
      },
    },
  ],
};

// ─── Mobile Engineer ─────────────────────────────────────────────────────────

const MOBILE_TRACK: TrackKnowledge = {
  trackLabel: "Mobile Engineer",
  dimensions: [
    {
      key: "native_language",
      label: "Native Language (Swift/Kotlin)",
      isCritical: true,
      levels: {
        L1: "builds a screen following a tutorial",
        L2: "idiomatic code, coroutines/async-await, lifecycle awareness",
        L3: "deep language features, picks architecture patterns with reasoning",
        L4: "contributes to language/framework ecosystem, debugs at runtime level",
      },
    },
    {
      key: "cross_platform",
      label: "Cross-Platform Awareness (RN/Flutter)",
      isCritical: false,
      levels: {
        L1: "knows the trade-offs at a high level",
        L2: "can read code, contribute small features",
        L3: "makes the native vs cross-platform call with evidence",
        L4: "leads platform-strategy decisions",
      },
    },
    {
      key: "ui_navigation",
      label: "UI, Animation & Navigation",
      isCritical: false,
      levels: {
        L1: "uses stock components, basic navigation",
        L2: "custom layouts, transitions, gesture handling",
        L3: "complex animations, deep links, multi-stack navigation",
        L4: "builds UI primitives others use, deep platform-rendering knowledge",
      },
    },
    {
      key: "state_architecture",
      label: "State & Architecture",
      isCritical: true,
      levels: {
        L1: "holds state in a view",
        L2: "MVVM, unidirectional data flow, DI basics",
        L3: "designs app architecture (modularisation, feature flags, navigation graphs)",
        L4: "defines architecture across the app, mentors into L3",
      },
    },
    {
      key: "networking",
      label: "Networking & Offline-First",
      isCritical: false,
      levels: {
        L1: "makes REST calls",
        L2: "retries, error handling, GraphQL/Combine/Flow",
        L3: "offline-first sync, conflict resolution, request coalescing",
        L4: "designs the data layer for an app at scale",
      },
    },
    {
      key: "persistence",
      label: "Local Storage & Persistence",
      isCritical: false,
      levels: {
        L1: "uses UserDefaults/SharedPreferences",
        L2: "SQLite via Room/Core Data/SwiftData, migrations",
        L3: "complex schemas, encryption, sync strategies",
        L4: "owns persistence architecture",
      },
    },
    {
      key: "platform_apis",
      label: "Platform APIs",
      isCritical: false,
      levels: {
        L1: "uses one or two (camera, location)",
        L2: "push notifications, background tasks, deep links",
        L3: "complex integrations (HealthKit, ARKit, BLE, WidgetKit)",
        L4: "deep platform expertise, files OS bug reports that get fixed",
      },
    },
    {
      key: "performance",
      label: "Performance & Battery",
      isCritical: true,
      levels: {
        L1: "knows the app shouldn't lag",
        L2: "profiles with Instruments/Android Profiler, fixes obvious issues",
        L3: "frame budget discipline, memory leaks, battery analysis",
        L4: "tunes at OS-interaction level, owns perf SLOs",
      },
    },
    {
      key: "security",
      label: "Security & Privacy",
      isCritical: false,
      levels: {
        L1: "knows secrets shouldn't be in code",
        L2: "keychain/keystore, ATS, permission flows",
        L3: "jailbreak/root detection, certificate pinning, secure enclaves",
        L4: "leads security architecture, partners with privacy/legal",
      },
    },
    {
      key: "testing",
      label: "Testing",
      isCritical: false,
      levels: {
        L1: "a few unit tests",
        L2: "UI tests (XCUITest/Espresso), snapshot tests",
        L3: "designs the test pyramid, handles flakiness",
        L4: "builds testing infra, sets bar",
      },
    },
    {
      key: "release",
      label: "Release & Distribution",
      isCritical: true,
      levels: {
        L1: "ships a build with help",
        L2: "signing, App Store/Play submission, phased rollout",
        L3: "handles rejections, manages release trains, crash triage",
        L4: "owns release process, designs feature flagging strategy",
      },
    },
    {
      key: "communication",
      label: "Communication & Collaboration + English",
      isCritical: false,
      levels: {
        L1: "clear PR descriptions, reads docs",
        L2: "gives useful review, writes clear tickets",
        L3: "aligns stakeholders, writes design docs",
        L4: "mentors others, sets the writing bar",
      },
    },
  ],
};

// ─── DevOps / SRE ────────────────────────────────────────────────────────────

const DEVOPS_TRACK: TrackKnowledge = {
  trackLabel: "DevOps / SRE",
  dimensions: [
    {
      key: "linux",
      label: "Linux & Networking",
      isCritical: false,
      levels: {
        L1: "comfortable in a shell, knows basic commands",
        L2: "systemd, file permissions, networking (DNS, TCP/TLS), troubleshooting",
        L3: "kernel namespaces/cgroups, packet captures, deep networking debug",
        L4: "kernel-level expertise, contributes to OSS infra tooling",
      },
    },
    {
      key: "scripting",
      label: "Scripting",
      isCritical: false,
      levels: {
        L1: "writes simple Bash scripts",
        L2: "Python or Go for tooling, error handling, idempotency",
        L3: "builds operational tooling others depend on",
        L4: "designs internal platforms, sets scripting standards",
      },
    },
    {
      key: "containers",
      label: "Containers",
      isCritical: false,
      levels: {
        L1: "runs Docker containers, writes basic Dockerfiles",
        L2: "multi-stage builds, image hardening, registries",
        L3: "image supply chain (signing, SBOM), runtime security",
        L4: "owns container strategy, contributes to OCI tooling",
      },
    },
    {
      key: "kubernetes",
      label: "Orchestration (Kubernetes)",
      isCritical: true,
      levels: {
        L1: "deploys with kubectl/Helm",
        L2: "writes manifests, understands deployments/services/ingress",
        L3: "operators, RBAC, network policies, multi-cluster",
        L4: "runs Kubernetes at scale, contributes upstream",
      },
    },
    {
      key: "iac",
      label: "Infrastructure as Code",
      isCritical: true,
      levels: {
        L1: "edits existing Terraform/Pulumi",
        L2: "writes modules, manages state, plans/applies safely",
        L3: "designs module structure, handles drift, multi-account/region",
        L4: "owns IaC strategy, builds platform abstractions",
      },
    },
    {
      key: "cicd",
      label: "CI/CD & GitOps",
      isCritical: false,
      levels: {
        L1: "edits a GitHub Actions workflow",
        L2: "builds pipelines with caching, matrix builds, secrets",
        L3: "GitOps (ArgoCD/Flux), progressive delivery (canary, blue/green)",
        L4: "designs delivery platform, sets standards across teams",
      },
    },
    {
      key: "cloud",
      label: "Cloud Platform (AWS/GCP/Azure)",
      isCritical: true,
      levels: {
        L1: "launches a VM, knows core services",
        L2: "IAM, VPC, managed services (RDS, S3), cost-aware",
        L3: "multi-account architecture, networking at scale, well-architected reviews",
        L4: "owns cloud strategy, certifications + battle scars",
      },
    },
    {
      key: "observability",
      label: "Observability",
      isCritical: true,
      levels: {
        L1: "reads dashboards",
        L2: "deploys Prometheus/Grafana, writes basic queries (PromQL)",
        L3: "designs metric/log/trace strategy, OpenTelemetry-fluent",
        L4: "owns the observability platform, sets standards",
      },
    },
    {
      key: "reliability",
      label: "Reliability Engineering",
      isCritical: true,
      levels: {
        L1: "knows what an SLO is",
        L2: "writes SLIs/SLOs, runs incident response",
        L3: "error budgets, chaos engineering, postmortem culture",
        L4: "leads reliability culture, designs platform reliability primitives",
      },
    },
    {
      key: "security",
      label: "Security / DevSecOps",
      isCritical: false,
      levels: {
        L1: "rotates secrets, doesn't commit them",
        L2: "SAST/DAST in CI, vulnerability scanning, secret managers",
        L3: "supply chain security (SLSA, signing), zero trust, threat modelling",
        L4: "leads security architecture, partners with security org",
      },
    },
    {
      key: "finops",
      label: "Cost & Capacity (FinOps)",
      isCritical: false,
      levels: {
        L1: "reads the cloud bill",
        L2: "tags resources, right-sizes, uses spot/reserved instances",
        L3: "capacity planning, autoscaling strategy, FinOps practices",
        L4: "owns cost strategy, builds chargeback/showback systems",
      },
    },
    {
      key: "communication",
      label: "Communication & Collaboration + English",
      isCritical: false,
      levels: {
        L1: "clear PR descriptions, reads docs; incident comms basics",
        L2: "writes status updates, tickets; clear incident comms",
        L3: "writes postmortems and runbooks that travel, aligns stakeholders",
        L4: "sets the communication bar, mentors others",
      },
    },
  ],
};

// ─── Data Analyst ────────────────────────────────────────────────────────────

const DATA_ANALYST_TRACK: TrackKnowledge = {
  trackLabel: "Data Analyst",
  dimensions: [
    {
      key: "sql",
      label: "SQL (advanced)",
      isCritical: true,
      levels: {
        L1: "SELECT, JOIN, GROUP BY",
        L2: "window functions, CTEs, subqueries",
        L3: "query performance (EXPLAIN), complex analytical queries",
        L4: "designs warehouse query patterns, mentors others",
      },
    },
    {
      key: "python_data",
      label: "Python for Data",
      isCritical: false,
      levels: {
        L1: "pandas basics, reads CSVs",
        L2: "fluent in pandas/numpy, polars-aware",
        L3: "large data with chunking/Dask/polars, builds reusable analysis modules",
        L4: "builds analytical libraries the team depends on",
      },
    },
    {
      key: "statistics",
      label: "Statistics & Experimentation",
      isCritical: true,
      levels: {
        L1: "mean, median, distributions",
        L2: "hypothesis testing, confidence intervals, regression",
        L3: "A/B test design (power, sample size, MDE), causal inference basics",
        L4: "owns experimentation platform/methodology, handles confounders",
      },
    },
    {
      key: "visualisation",
      label: "Data Visualisation",
      isCritical: false,
      levels: {
        L1: "makes basic charts in Excel/matplotlib",
        L2: "seaborn/plotly, picks the right chart for the question",
        L3: "designs dashboards that drive decisions, chart literacy as a craft",
        L4: "sets visualisation standards, fluent in perception research",
      },
    },
    {
      key: "bi_tools",
      label: "BI Tools (Tableau/Power BI/Looker)",
      isCritical: false,
      levels: {
        L1: "builds a basic dashboard",
        L2: "complex calculations, parameters, filters",
        L3: "LookML/data modelling layer, governance, performance tuning",
        L4: "owns BI architecture, sets standards",
      },
    },
    {
      key: "modelling",
      label: "Modelling & Warehousing",
      isCritical: false,
      levels: {
        L1: "knows what a fact/dimension is",
        L2: "writes dbt models, understands star schema",
        L3: "designs warehouse layers (staging/marts), semantic layer",
        L4: "owns modelling strategy, mentors data engineering peers",
      },
    },
    {
      key: "etl",
      label: "ETL/ELT & Orchestration",
      isCritical: false,
      levels: {
        L1: "knows what Airflow does",
        L2: "writes/maintains pipelines, basic scheduling",
        L3: "designs reliable pipelines, handles backfills, monitoring",
        L4: "owns orchestration strategy",
      },
    },
    {
      key: "data_quality",
      label: "Data Quality & Governance",
      isCritical: false,
      levels: {
        L1: "spots obvious data issues",
        L2: "writes dbt tests, documents sources",
        L3: "designs data contracts, lineage, PII handling",
        L4: "leads governance, partners with legal/compliance",
      },
    },
    {
      key: "domain_acumen",
      label: "Domain & Business Acumen",
      isCritical: true,
      levels: {
        L1: "knows what the company does",
        L2: "understands core KPIs, frames questions in business terms",
        L3: "anticipates business questions, partners with stakeholders proactively",
        L4: "shapes strategy with data, peer to senior leadership",
      },
    },
    {
      key: "storytelling",
      label: "Storytelling & Insight Communication",
      isCritical: true,
      levels: {
        L1: "presents numbers in a deck",
        L2: "structures findings around a narrative, picks the headline",
        L3: "tailors communication to audience (exec/IC/cross-functional)",
        L4: "known internally as a great communicator, sets the bar",
      },
    },
    {
      key: "soft_skills",
      label: "Soft Skills (Ownership, Curiosity)",
      isCritical: false,
      levels: {
        L1: "completes assigned analyses",
        L2: "digs into anomalies, asks 'why' beyond the ticket",
        L3: "identifies impactful questions before being asked",
        L4: "shapes the analytical agenda",
      },
    },
    {
      key: "english",
      label: "English",
      isCritical: false,
      levels: {
        L1: "reads docs comfortably",
        L2: "writes clear async messages and tickets",
        L3: "writes reports and analyses that travel",
        L4: "sets the writing bar",
      },
    },
  ],
};

// ─── QA / Test Engineer ──────────────────────────────────────────────────────

const QA_TRACK: TrackKnowledge = {
  trackLabel: "QA / Test Engineer",
  dimensions: [
    {
      key: "testing_fundamentals",
      label: "Testing Fundamentals",
      isCritical: true,
      levels: {
        L1: "knows the test pyramid",
        L2: "equivalence partitioning, boundary analysis, risk-based testing",
        L3: "designs test strategy for a feature/service",
        L4: "defines testing methodology org-wide",
      },
    },
    {
      key: "manual_exploratory",
      label: "Manual & Exploratory Testing",
      isCritical: false,
      levels: {
        L1: "follows test cases",
        L2: "writes test cases, exploratory charters",
        L3: "heuristic-driven exploration, finds bugs others miss",
        L4: "trains others in exploratory technique, sets the bar",
      },
    },
    {
      key: "ui_automation",
      label: "Test Automation (UI)",
      isCritical: true,
      levels: {
        L1: "edits an existing Playwright/Cypress test",
        L2: "writes stable tests with proper waits/selectors",
        L3: "designs page object/component models, handles flakiness systemically",
        L4: "builds automation framework, sets standards",
      },
    },
    {
      key: "api_testing",
      label: "API Testing",
      isCritical: true,
      levels: {
        L1: "makes Postman requests",
        L2: "writes API tests in Postman/REST Assured/supertest",
        L3: "contract testing (Pact), schema validation, designs API test strategy",
        L4: "owns API quality strategy across services",
      },
    },
    {
      key: "performance_testing",
      label: "Performance Testing",
      isCritical: false,
      levels: {
        L1: "knows what load/stress tests are",
        L2: "runs k6/JMeter/Locust scripts, reads results",
        L3: "designs perf test strategy, identifies bottlenecks with engineering",
        L4: "owns perf engineering practice, drives capacity planning input",
      },
    },
    {
      key: "security_testing",
      label: "Security Testing (basics)",
      isCritical: false,
      levels: {
        L1: "knows OWASP Top 10 exists",
        L2: "runs ZAP scans, reports common vulns",
        L3: "integrates security testing into CI, threat modelling support",
        L4: "bridges QA and security, leads security testing strategy",
      },
    },
    {
      key: "programming",
      label: "Programming (Python or JS/TS)",
      isCritical: true,
      levels: {
        L1: "writes simple scripts",
        L2: "idiomatic code, builds testing utilities",
        L3: "builds frameworks/tooling, code-review–level fluency",
        L4: "contributes to testing OSS, indistinguishable from a dev on this axis",
      },
    },
    {
      key: "cicd_infra",
      label: "CI/CD Integration & Test Infra",
      isCritical: false,
      levels: {
        L1: "knows tests run in CI",
        L2: "configures test stages, reads pipeline output",
        L3: "designs parallelisation, sharding, artifacts; tackles flakiness systemically",
        L4: "owns test infra, sets reliability bar",
      },
    },
    {
      key: "bug_advocacy",
      label: "Bug Advocacy & Documentation",
      isCritical: false,
      levels: {
        L1: "writes a bug report with steps",
        L2: "clear repro, severity vs priority, attaches evidence",
        L3: "drives root-cause discussions, prevents regressions",
        L4: "shapes engineering quality culture",
      },
    },
    {
      key: "quality_strategy",
      label: "Quality Strategy",
      isCritical: true,
      levels: {
        L1: "executes the test plan",
        L2: "writes test plans, defines coverage",
        L3: "shift-left/shift-right thinking, designs strategy with engineering",
        L4: "owns quality strategy across products",
      },
    },
    {
      key: "communication",
      label: "Communication & Collaboration",
      isCritical: false,
      levels: {
        L1: "reports bugs clearly, asks for help",
        L2: "communicates quality risk to stakeholders, gives useful review",
        L3: "leads quality discussions across teams",
        L4: "advocates for quality culture org-wide",
      },
    },
    {
      key: "english",
      label: "English",
      isCritical: false,
      levels: {
        L1: "reads docs comfortably",
        L2: "writes clear bug reports and test plans",
        L3: "writes quality strategy docs that travel",
        L4: "sets the writing bar",
      },
    },
  ],
};

// ─── Soft Skills Track ────────────────────────────────────────────────────────
// 6 dimensions matching the SS item bank and roadmap (roadmap-soft-skills.ts).

const SS_TRACK: TrackKnowledge = {
  trackLabel: "Soft Skills",
  dimensions: [
    {
      key: "ss-written-comms",
      label: "Written Communication",
      isCritical: true,
      levels: {
        L1: "writes basic PR descriptions and clear async messages",
        L2: "writes RFCs, postmortems, and design docs that get read and acted on",
        L3: "produces technical writing that travels across teams and drives alignment",
        L4: "sets the written communication bar for the engineering org",
      },
    },
    {
      key: "ss-discovery-scoping",
      label: "Discovery & Scoping",
      isCritical: true,
      levels: {
        L1: "asks clarifying questions before starting; avoids scope surprises",
        L2: "runs discovery calls, writes project briefs, breaks work into scoped MVPs",
        L3: "manages stakeholder expectations, defines success criteria, navigates scope creep",
        L4: "leads discovery for complex multi-team projects, mentors others on scoping",
      },
    },
    {
      key: "ss-async-collab",
      label: "Async Collaboration",
      isCritical: true,
      levels: {
        L1: "sends clear blocker messages; makes decisions in writing when appropriate",
        L2: "reduces meeting load with async updates, decision docs, and Loom recordings",
        L3: "designs async-first workflows for distributed teams across timezones",
        L4: "shapes the team's async culture, sets norms for how decisions are made",
      },
    },
    {
      key: "ss-code-review",
      label: "Code Review",
      isCritical: true,
      levels: {
        L1: "gives clear, actionable review comments; separates blocking from non-blocking",
        L2: "gives review feedback that improves code and grows reviewees; handles disagreements",
        L3: "designs review processes, mentors reviewers, balances quality and velocity",
        L4: "sets code review culture and standards for the engineering org",
      },
    },
    {
      key: "ss-conflict-escalation",
      label: "Conflict & Escalation",
      isCritical: false,
      levels: {
        L1: "raises concerns 1:1 before escalating; knows when to loop in a third party",
        L2: "resolves technical disagreements constructively; escalates with evidence, not blame",
        L3: "mediates team conflicts, handles security or quality risks with appropriate urgency",
        L4: "builds a psychologically safe team culture; coaches others on conflict resolution",
      },
    },
    {
      key: "ss-career-navigation",
      label: "Career Navigation",
      isCritical: false,
      levels: {
        L1: "understands levelling expectations; discusses growth proactively with manager",
        L2: "identifies skill gaps, creates a concrete promotion plan, builds visibility",
        L3: "navigates career transitions (e.g. backend → ML), responds to feedback constructively",
        L4: "mentors others on career growth, shapes levelling expectations on the team",
      },
    },
  ],
};

// ─── English Proficiency Track ────────────────────────────────────────────────
// 5 dimensions matching the English item bank and roadmap (roadmap-english-proficiency.ts).

const ENG_TRACK: TrackKnowledge = {
  trackLabel: "English Proficiency",
  dimensions: [
    {
      key: "eng-reading",
      label: "Technical Reading",
      isCritical: true,
      levels: {
        L1: "reads API docs and READMEs without needing translation",
        L2: "reads design docs, postmortems, and RFC-style documents at pace",
        L3: "reads academic papers and advanced specifications; spots ambiguity and FIXME risks",
        L4: "sets documentation quality bar; reviews and improves team technical writing",
      },
    },
    {
      key: "eng-listening",
      label: "Listening Comprehension",
      isCritical: true,
      levels: {
        L1: "follows standups and clear technical explanations at moderate pace",
        L2: "follows native-speed technical calls, podcasts, and conference talks",
        L3: "understands idioms, technical jargon, and cross-cultural communication signals",
        L4: "facilitates global technical discussions; no listening comprehension gaps at work",
      },
    },
    {
      key: "eng-speaking",
      label: "Speaking & Presenting",
      isCritical: true,
      levels: {
        L1: "participates in standups and asks clarifying questions confidently",
        L2: "presents technical demos to mixed audiences; disagrees professionally in meetings",
        L3: "presents post-incident reports and technical proposals to leadership",
        L4: "represents the team at conferences and cross-company discussions",
      },
    },
    {
      key: "eng-writing",
      label: "Professional Writing",
      isCritical: true,
      levels: {
        L1: "writes clear Slack messages, PR requests, and status updates",
        L2: "writes client communications, incident summaries, and async updates with right tone",
        L3: "writes RFCs and technical documentation for both engineering and product audiences",
        L4: "sets the writing tone and clarity bar for the team's external communications",
      },
    },
    {
      key: "eng-cross-cultural",
      label: "Cross-Cultural Comms",
      isCritical: false,
      levels: {
        L1: "aware of direct vs indirect communication styles; asks for clarification when unsure",
        L2: "reads implicit feedback signals; adapts tone across cultural contexts",
        L3: "facilitates global retrospectives; includes quieter voices across cultures",
        L4: "builds cross-cultural communication norms for distributed teams",
      },
    },
  ],
};

// ─── Track registry ───────────────────────────────────────────────────────────

// Goal keys for the standalone SS and English tracks (separate from profile.goal,
// used only internally when routing users through the SS/English Assessment flow).
export const SOFT_SKILLS_TRACK_GOAL = "soft_skills_track" as const;
export const ENGLISH_PROFICIENCY_TRACK_GOAL = "english_proficiency_track" as const;

const TRACK_KNOWLEDGE: Record<string, TrackKnowledge> = {
  ai_ml_engineer:            AI_TRACK,
  land_first_ai_role:        AI_TRACK,
  ml_research_to_production: AI_TRACK,
  software_to_ai:            AI_TRACK,
  freelance_ai_engineer:     AI_TRACK,
  backend_engineer:          BACKEND_TRACK,
  frontend_engineer:         FRONTEND_TRACK,
  full_stack_engineer:       FULLSTACK_TRACK,
  mobile_engineer:           MOBILE_TRACK,
  devops_engineer:           DEVOPS_TRACK,
  data_analyst:              DATA_ANALYST_TRACK,
  qa_engineer:               QA_TRACK,
  [SOFT_SKILLS_TRACK_GOAL]:          SS_TRACK,
  [ENGLISH_PROFICIENCY_TRACK_GOAL]:  ENG_TRACK,
};

export function getTrackKnowledge(goal: string | null | undefined): TrackKnowledge {
  return (goal ? TRACK_KNOWLEDGE[goal] : undefined) ?? AI_TRACK;
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

export type DimensionScore = { dimension: string; score: number };

// Maps MCQ % to a knowledge level (L0–L3).
// L4 (Teaching) cannot be inferred from a knowledge check — only from evidence.
// L0 = below L1 foundations (no meaningful knowledge signal).
function mcqToKnowledgeLevel(pct: number): 0 | 1 | 2 | 3 {
  if (pct >= 80) return 3;
  if (pct >= 55) return 2;
  if (pct >= 30) return 1;
  return 0;
}

const LEVEL_LABEL: Record<number, string> = {
  0: "L0 (below foundations)",
  1: "L1 (Foundations)",
  2: "L2 (Working)",
  3: "L3 (Designing)",
  4: "L4 (Teaching)",
};

// Builds the context block injected into the roadmap generation prompt.
// earnedLevels (evidence-based) takes priority over mcqScores (MCQ baseline) when both exist.
// For all goals: includes the skill ladder description per dimension.
export function buildRoadmapContext(
  goal: string | null | undefined,
  mcqScores?: DimensionScore[],
  earnedLevels?: Record<string, number> | null,
): string {
  const knowledge = getTrackKnowledge(goal);
  const isAiTrack = !goal || [
    "ai_ml_engineer", "land_first_ai_role", "ml_research_to_production",
    "software_to_ai", "freelance_ai_engineer",
  ].includes(goal);

  const scoreMap = new Map<string, number>(
    (mcqScores ?? []).map((s) => [s.dimension, s.score]),
  );

  const criticalLines: string[] = [];
  const standardLines: string[] = [];

  for (const dim of knowledge.dimensions) {
    const earnedLevel = earnedLevels?.[dim.key];
    const pct = scoreMap.get(dim.key);
    const hasMcqScore = isAiTrack && pct !== undefined;

    let line: string;

    if (earnedLevel !== undefined) {
      // Evidence-based level from self-assessment — most authoritative signal
      const targetLevel = Math.min(earnedLevel + 1, 4);
      const targetKey = `L${targetLevel}` as "L1" | "L2" | "L3" | "L4";
      const targetDesc = dim.levels[targetKey] ?? "continue deepening";
      line = `• ${dim.label}: evidence-based earned level ${LEVEL_LABEL[earnedLevel]}`
        + ` → target ${LEVEL_LABEL[targetLevel]}: ${targetDesc}`;
      if (hasMcqScore) {
        // Append MCQ as a secondary signal so the LLM can see both
        const mcqLevel = mcqToKnowledgeLevel(pct!);
        line += ` (MCQ readiness baseline: ${LEVEL_LABEL[mcqLevel]}, ${pct}%)`;
      }
    } else if (hasMcqScore && pct !== undefined) {
      // MCQ readiness baseline only — directional signal, not earned
      const level = mcqToKnowledgeLevel(pct);
      const targetLevel = Math.min(level + 1, 3);
      const targetDesc = dim.levels[`L${targetLevel}` as "L1" | "L2" | "L3"];
      line = `• ${dim.label}: readiness baseline ${LEVEL_LABEL[level]} (${pct}% MCQ)`
        + ` → target ${LEVEL_LABEL[targetLevel]}: ${targetDesc}`;
    } else {
      // No signal — show the full ladder so the LLM can calibrate phase depth
      line = `• ${dim.label}:`
        + ` L1: ${dim.levels.L1} |`
        + ` L2: ${dim.levels.L2} |`
        + ` L3: ${dim.levels.L3}`;
    }

    if (dim.isCritical) {
      criticalLines.push(line + " [critical for this role]");
    } else {
      standardLines.push(line);
    }
  }

  const sections: string[] = [
    `Skill ladder context for ${knowledge.trackLabel} track:`,
  ];

  if (criticalLines.length > 0) {
    sections.push("Critical dimensions (weight phases heavily):");
    sections.push(criticalLines.join("\n"));
  }

  if (standardLines.length > 0) {
    sections.push("Standard dimensions:");
    sections.push(standardLines.join("\n"));
  }

  if (!isAiTrack && !earnedLevels) {
    sections.push(
      "Note: knowledge-check scores are not available for this track yet — use the skill ladder to calibrate phase depth and avoid beginner or expert-only content.",
    );
  }

  return sections.join("\n\n");
}
