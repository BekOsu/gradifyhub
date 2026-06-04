# GradifyHub

**AI-powered career acceleration platform.** Adaptive assessment → personalized roadmap → structured lessons → resume builder → mock interview → job matching → hired.

Live: [gradifyhub.com](https://gradifyhub.com)

---

## What this is

GradifyHub compresses the time from "I want to break into tech" to "I have an offer" by solving three problems no other platform solves together:

1. **Know what the learner actually knows** — IRT-calibrated adaptive assessment across 9 dimensions. Difficulty bands from the user's own experience signals. Multi-agent LangGraph pipeline scores responses in parallel and synthesizes a personalized skill profile.

2. **Know what the market actually wants** — Live job ETL from Greenhouse, Lever, Ashby, and Adzuna. Salary bands, required-skill frequency, and trending technologies extracted per role and fed back into roadmap generation.

3. **Know what the learner can prove** — GitHub artifact verification, public portfolio share URLs, AI-assisted resume builder, and a mock interview system (text + voice) with structured evaluation feedback.

**Founding track:** AI Engineer. Three learning tracks live: AI Engineer (34 lessons) · Soft Skills (18 lessons) · English Proficiency (15 lessons).

---

## Core AI/ML Engineering

### Multi-Agent Assessment Pipeline (LangGraph.js)

Assessment runs a LangGraph.js orchestration graph, not a single prompt:

- **Orchestrator** receives user responses and fans out to parallel domain-specialist agents
- **Domain agents** score each response on their assigned dimension (technical depth, communication clarity, soft-skill signals, English CEFR level) and return `generateObject`-validated structured output
- **Synthesizer** merges all dimension scores into a theta estimate (Rasch-compatible), computes a 9-dimension skill map, and generates a plain-language profile
- **Roadmap generator** receives the skill map plus live job-market context and outputs a phased learning plan via a second LangGraph subgraph

Item bank: 120 calibrated questions across 9 dimensions, 3 difficulty bands per dimension (`difficultyB: 0 | 0.5 | 1`). Band selection is keyed to `aiCalibration` flags set during onboarding (0 flags → L0 only; 1-2 flags → L0+L0.5; 3-4 flags → L0.5+L1).

### FSRS v5 Spaced-Repetition Engine

The English Immersion track uses FSRS (Free Spaced Repetition Scheduler) v5, not SM-2:

- Retention accuracy: ±5.1% vs SM-2's ±16.2%
- 25% fewer review sessions at matched retention targets
- Eliminates "ease hell" (SM-2 permanently lowers ease on failures; FSRS difficulty mean-reverts to 5.0)
- Per-card state machine: `new → learning → review → relearning`
- Schema fields: `stability NUMERIC(8,4)`, `difficulty NUMERIC(4,2) DEFAULT 5.0`, `state TEXT`, `lapses INTEGER`
- Retrievability shown to user as recall probability %: `R = e^(-t / (9 × S))`
- Grades 1–4 (Again / Hard / Good / Easy) map to FSRS scheduling intervals computed on submit

### YouTube Vocabulary Mining

Users submit a YouTube URL; the pipeline:
1. Fetches transcript via `youtube-transcript`, splits into context-window-sized chunks
2. Runs `aiGenerateObject` with a structured extraction schema against each chunk — outputs vocabulary items with definitions, part of speech, and contextual example sentences
3. Streams items into an accept/skip review UI; accepted items enter the FSRS vault with full scheduling state initialized

### AI Shadowing Coach

- Reference audio generated via ElevenLabs TTS, cached to Cloudflare R2 (`audio/reference/` prefix, no expiry — cache-on-first-call)
- User recordings uploaded via presigned PUT URL to R2 (`audio/user/` prefix, 7-day TTL)
- Whisper transcribes user audio server-side
- `evaluateShadowing()` calls `aiGenerateObject` with a four-dimension scoring schema: accuracy / pacing / clarity / naturalness, plus 3 named, actionable improvement suggestions
- Both ElevenLabs TTS and R2 PUT are wrapped in `fetchWithRetry` (3 attempts, 1s/2s/3s backoff on 5xx)

### Interview Prep — 6-Agent Pipeline

Session start triggers a LangGraph pipeline with six sequential agents, each with an individual `withTimeout` guard (15–20s per step):

1. **Job parser** — required skills, seniority signals, company context from job description
2. **Resume parser** — candidate strengths, gaps, STAR stories from uploaded CV
3. **Gap analyzer** — cross-references job vs resume, surfaces 3–5 high-value prep areas
4. **Question generator** — 8 role-specific behavioral and technical questions
5. **Rubric builder** — scoring rubrics per question with pass/fail criteria
6. **Session assembler** — packages everything into a live practice session with inline AI feedback per answer

Voice mode uses LiveKit rooms + OpenAI Realtime API for low-latency audio. Text mode runs the same evaluation pipeline with typed responses.

### AI Roadmap Generation

- Personalized learning plan generated from assessment theta + job market signals
- HITL (human-in-the-loop) confirmation step before roadmap is saved — user reviews and adjusts before committing
- Phases structured by skill cluster; each phase links directly to curriculum lessons and external resources
- Staleness detector monitors profile changes and surfaces a "regenerate" prompt when the plan diverges from current skill state

---

## Features

### Adaptive Assessment

- 15-question adaptive diagnostic, per-question 2-minute countdown timer with auto-submit
- IRT difficulty banding per user's `aiCalibration` profile
- Multi-agent LangGraph scoring pipeline — parallel domain specialists + synthesizer
- Foundation-check gate: score < 3 routes users through a required 3-lesson foundation path before the full assessment
- Three separate tracks: AI Engineer, Soft Skills, English Proficiency
- Assessment history, comparison across retakes, review of skipped questions

### Personalized Roadmap

- AI-generated, phased learning plan from assessment results and job-market context
- HITL review step before saving
- 84 community roadmaps imported from roadmap.sh (CC BY 4.0) — browsable at `/roadmaps`
- Per-node progress tracking (done / in-progress / skip)
- Skill freshness decay: skills have configurable half-lives (LLM skills ~6 months; SQL ~10 years) driving legitimate re-engagement

### Lesson System — 67 Lessons, 3 Tracks

- **AI Engineer:** 34 lessons across 9 dimensions (Python, LLM fundamentals, context engineering, RAG, agentic systems, voice/multimodal, system design, tooling/observability, soft skills)
- **Soft Skills:** 18 lessons across 6 dimensions (written communication, discovery/scoping, async collaboration, code review, conflict/escalation, career navigation)
- **English Proficiency:** 15 lessons across 5 dimensions (reading, listening, speaking, writing, cross-cultural)
- Section stepper UI: one H2 section at a time with scrollable pill-strip navigation and linear progress bar — quiz is the final step
- Per-lesson MCQ quizzes with 70% pass threshold, auto-completion of lesson progress on pass
- Lesson content in `.md` files with a CURRICULUM.md template: Why it matters / What to know / How to use it / Common mistakes / Try it yourself / Real-world example / When NOT to use / Going deeper
- 451 free resource links from roadmap.sh surfaced per lesson dimension

### Resume Builder

- Notion-style BlockNote rich-text editor with section structure (Experience, Education, Skills, Projects)
- AI intake conversation: user describes their background; AI extracts structured content and populates the editor
- AI optimization pass: rewrites bullet points for ATS compatibility and impact clarity
- PDF export
- Public share URLs (`/resume/preview/[slug]`) — shareable portfolio links

### Mock Interview

- Text-based practice sessions with live AI feedback per answer
- Voice mode: LiveKit room creation + OpenAI Realtime API for audio
- Role-specific question banks (AI Engineer, Backend, Full-stack, Data)
- Structured evaluation: technical accuracy, communication clarity, STAR format adherence, named improvement suggestions
- Session replay and transcript export

### English Immersion Platform

- **Vocabulary vault** — FSRS spaced-repetition flashcard system (add words manually, via YouTube mining, or from 1,237 seed phrases across 7 domain packs)
- **Review session** — Flashcard UI with retrievability percentage display and FSRS grade submission
- **YouTube vocabulary mining** — Paste a URL, extract vocabulary with AI, accept/skip items into vault
- **Shadowing coach** — Listen to reference audio, record your version, receive accuracy/pacing/clarity/naturalness scores
- **Speaking partner** — AI conversation partner with scenario selection (workplace, technical, social), inline feedback toggle, voice mode
- **Analytics dashboard** — Words learned, streak, speaking minutes, vocab mastery by category, fluency trend over 30 days, weekly activity heatmap
- Personalization: `profile.goal` maps to relevant vocabulary pack selection on first visit (DevOps → DevOps pack, AI/ML → AI pack; always-on: Daily Life, Work, Opinion, Social)

### Job Matching

- Live job feed aggregated from Arbeitnow, Gulf Jobs, and configurable ETL sources
- Skill-to-job matching based on assessment theta and roadmap completion
- Salary bands and required-skill frequency per role
- Filter by track (AI Engineer jobs filtered to "AI", "LLM", "ML" keywords)

### Gig Matching

- Upwork RSS + Freelancer API surface matching freelance tasks
- AI-drafted proposal templates per gig — user applies themselves, never auto-applied
- Runway calculator: savings ÷ monthly burn vs. time-to-interview-ready, recommends gig path when runway is tight

### Company Intelligence

- Per-company reports: tech stack, culture signals, interview patterns, leadership, prep packs
- Sources: Crunchbase, GitHub, Glassdoor, Reddit, NewsAPI, StackShare
- User-contributed post-mortems: anonymized, moderated before publish

### Growth Mechanics

- Daily streak counter with freeze for Pro users
- `/open` transparency page: public MRR, user counts, infrastructure costs
- Daily challenge: one shareable problem per day
- Referral program: both sides earn 1 month free, cap 5 per user
- Skill-level milestone badges per track (First Lesson → Getting Started → Halfway → Complete)

### Billing & Plans

- **Free:** Assessment, 3 sample lessons, resume builder, progress tracking
- **Pro ($10/mo or $100/yr):** Full lesson library, mock interview, gig match, streak freeze, analytics dashboard, voice mode
- LemonSqueezy (Merchant of Record — global tax handled, no UAE company required) + NOWPayments (BTC/ETH/USDT/USDC crypto fallback)
- Idempotent webhook handlers with signature verification. Atomic coupon `redeemedCount` increment via SQL expression (no read-modify-write race)
- `hasFeature(userId, flag)` re-checked server-side on every gated action — client-side flag hints are advisory only

### Admin & RBAC

- Three-tier roles: `user` / `admin` / `superadmin`
- Audit log on all admin mutations (actor, action, resource, timestamp)
- User management: role assignment, plan override, ban/unban, bulk actions with 100-user hard cap
- Coupon management with redemption tracking
- Health diagnostics: lesson count per track, item bank coverage by dimension

---

## Architecture

```
apps/web/                        # Next.js 15 — App Router + Server Actions
├─ app/
│  ├─ (marketing)/               # Landing, pricing, about, blog, legal
│  ├─ (app)/                     # Auth-required: dashboard, roadmap, lessons,
│  │   ├─ assessment/            #   resume, interview-prep, english/, tracks/
│  │   ├─ english/               #   vocab, mine, shadow, speak, analytics
│  │   ├─ interview-prep/
│  │   ├─ learn/
│  │   ├─ resume/
│  │   └─ roadmap/
│  ├─ (auth)/                    # Sign-in, sign-up, forgot/reset password
│  ├─ admin/                     # RBAC admin panel
│  └─ api/
│      ├─ english/               # Upload URLs, reference audio, voice sessions
│      ├─ interview-prep/        # 6-agent pipeline trigger
│      ├─ actions/               # Foundation-check endpoints
│      └─ webhooks/              # LemonSqueezy, NOWPayments, Inngest
├─ actions/                      # Server actions by domain
├─ lib/
│  ├─ ai/                        # Client wrapper (rate limits, logging, budget)
│  ├─ assessment/                # Item loading, difficulty banding, IRT sidecar
│  ├─ billing/                   # hasFeature(), plan limits, LemonSqueezy calls
│  ├─ english/                   # Transcript, vocab extractor, FSRS, shadowing,
│  │                             #   speaking partner, scenarios, personalization
│  ├─ journey/                   # Stage unlocks, engineering knowledge graph
│  ├─ roadmap/                   # Staleness check, node progress
│  └─ srs/                       # FSRS algorithm (fsrs.ts + schedule.ts)
├─ components/
│  ├─ app/                       # Sidebar, journey pipeline, stepper band
│  └─ lesson/                    # Markdown renderer, section stepper, quiz
└─ inngest/                      # Background jobs (event-driven, no cron hacks)

packages/
├─ db/                           # Drizzle schema + user-scoped query builders
├─ contracts/                    # Zod schemas shared client/server (frozen)
├─ ui/                           # shadcn/ui primitives + design tokens
└─ eslint-config/                # Shared lint rules

apps/ml/                         # Python FastAPI sidecar
├─ irt/                          # catsim Rasch IRT engine, adaptive item selection
├─ embeddings/                   # BGE-M3 via sentence-transformers + pgvector
└─ reranker/                     # Cross-encoder reranking for semantic search

apps/extension/                  # Browser extension — vocabulary capture from any page
```

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router, Server Actions) | PPR enabled on key pages |
| Language | TypeScript strict | No `any` without justification comment |
| Database | PostgreSQL (Neon) + pgvector | Semantic search on same Postgres instance |
| ORM | Drizzle | User-scoped query helpers; schema frozen |
| Auth | Better Auth | Self-hosted, email + Google + GitHub OAuth |
| UI | Tailwind CSS + shadcn/ui | TanStack Query for client state |
| Rich text editor | BlockNote | Resume builder and lesson editor |
| AI SDK | Vercel AI SDK + LangGraph.js | `generateObject` with Zod for structured output |
| Primary LLM | Claude Sonnet 4.5 | Assessment, roadmap, interview, shadowing eval |
| High-volume LLM | Claude Haiku 4.5 | Vocab extraction, classification, tagging |
| Spaced repetition | ts-fsrs v5 | FSRS over SM-2 (D28) |
| Voice | LiveKit + OpenAI Realtime API | Mock interview voice mode |
| Background jobs | Inngest | Event-driven step functions, no cron hacks |
| Storage | Cloudflare R2 | Two-prefix TTL policy (user audio 7d, reference no-expiry) |
| Email | Resend | Transactional; gradifyhub.com domain verified |
| Payments | LemonSqueezy + NOWPayments | MoR billing + crypto fallback |
| Observability | PostHog + Sentry | Funnel analytics + error monitoring |
| Redis | Upstash | Session state, rate limiting |
| Python sidecar | FastAPI + catsim + sentence-transformers | IRT engine + embeddings + resume parsing |

---

## Key Database Tables

| Table | Purpose |
|---|---|
| `user`, `profile` | Auth + onboarding calibration (`aiCalibration` JSONB) |
| `attempt`, `item`, `response` | IRT assessment sessions; 120 calibrated items |
| `roadmap`, `roadmap_node` | AI-generated learning plans with per-node progress |
| `lesson`, `lesson_progress`, `quiz_submission` | 3-track curriculum, quiz scoring, completion state |
| `user_vocabulary` | FSRS vault — stability, difficulty, state, lapses, next review |
| `vocab_mining_source` | YouTube mining history per user |
| `speaking_session` | AI speaking partner transcripts and scores |
| `roadmap_catalog`, `roadmap_catalog_node` | 84 roadmap.sh roadmaps (CC BY 4.0) |
| `roadmap_catalog_content` | 451 resource links (articles, videos, courses) per node |
| `user_roadmap_node_progress` | Per-user node status on catalog roadmaps |
| `subscription`, `coupon` | LemonSqueezy billing state, coupon redemption |
| `admin_audit_log` | Full RBAC audit trail with actor/action/resource |
| `usage_log` | Per-user LLM usage tracking for budget enforcement |

---

## API Reference

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/english/upload-url` | Presigned R2 PUT URL for user audio recordings |
| POST | `/api/english/shadow/reference-audio` | ElevenLabs TTS → R2 cache, returns playback URL |
| POST | `/api/english/voice-session` | LiveKit room creation, returns connection token |
| GET | `/api/english/analyze-text` | Vocabulary and fluency analysis on arbitrary text |
| POST | `/api/interview-prep/run` | Triggers 6-agent prep pipeline, streams progress |
| POST | `/api/actions/foundation-check` | AI-scored foundation check (AI Engineer track) |
| POST | `/api/actions/foundation-check-ss` | Foundation check (Soft Skills track) |
| POST | `/api/actions/foundation-check-eng` | Foundation check (English Proficiency track) |
| POST | `/api/webhooks/lemonsqueezy` | Subscription lifecycle events |
| POST | `/api/webhooks/nowpayments` | Crypto payment confirmation |
| GET | `/api/openrouter/callback` | PKCE OAuth callback for BYOK key storage |

---

## Getting Started

### Prerequisites

- Node.js 20+, pnpm
- PostgreSQL (Neon recommended — free tier sufficient for development)
- Python 3.10+ (ML sidecar, optional for local dev without IRT)

### Setup

```bash
git clone https://github.com/BekOsu/gradifyhub.git
cd gradifyhub
pnpm install

cp apps/web/.env.example apps/web/.env.local
# Required: DATABASE_URL, BETTER_AUTH_SECRET, ANTHROPIC_API_KEY
# For payments: LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_VARIANT_PRO_MONTHLY, LEMONSQUEEZY_VARIANT_PRO_YEARLY
# For storage: CLOUDFLARE_R2_ACCESS_KEY, CLOUDFLARE_R2_SECRET_KEY, CLOUDFLARE_R2_BUCKET
# For email: RESEND_API_KEY
# For voice: LIVEKIT_API_KEY, LIVEKIT_API_SECRET, ELEVENLABS_API_KEY

pnpm db:migrate       # apply all 34 migrations
pnpm seed             # seed admin users + skill groups
pnpm seed:items       # seed 120 IRT assessment items
pnpm seed:lessons     # seed lesson content
pnpm dev              # start web at localhost:3000
```

### Key Commands

```bash
pnpm dev              # start all apps in watch mode
pnpm build            # production build check (run before every deploy)
pnpm lint             # ESLint + TypeScript strict
pnpm test             # Vitest unit tests
pnpm test:e2e         # Playwright end-to-end

pnpm db:generate      # create migration from schema diff
pnpm db:migrate       # apply migrations to Neon
pnpm db:studio        # Drizzle Studio — DB browser

pnpm seed             # admin users + skill groups
pnpm seed:items       # assessment item bank
pnpm seed:lessons     # lesson content
pnpm import:roadmaps  # re-import 84 roadmap.sh roadmaps (idempotent)
```

---

## Code Standards

- **TypeScript strict** — no `any` without a one-line justifying comment
- **No browser storage** — no `localStorage`, `sessionStorage`, or `IndexedDB` in user-facing code; all state is DB-backed or session cookie
- **DB transactions are isolated** — external calls (API, LLM, queue publish) happen outside `db.transaction()` blocks; no network I/O inside a transaction
- **Batch processing uses cursor pagination** — never unbounded `.findMany()` over user tables
- **Feature flags re-checked server-side** — `hasFeature(userId, flag)` called on every gated server action; client-side flag hints are advisory
- **All LLM calls through `lib/ai/client.ts`** — rate limiting, usage logging, and budget enforcement in one place; never call Anthropic or OpenAI SDKs directly
- **Webhook handlers are idempotent** — replays do not double-charge, double-credit, or double-send email
- **Webhook signatures verified** — no processing before signature check on all payment webhooks

---

## Deployment

- **Web + API:** Vercel (auto-deploy on push to `main`; PPR + Edge middleware)
- **Python sidecar:** Modal or Fly.io
- **Database:** Neon (serverless Postgres, pgvector enabled)
- **Storage:** Cloudflare R2 — `audio/user/` (7-day TTL), `audio/reference/` (no expiry)
- **Domain:** gradifyhub.com (Cloudflare Registrar, Vercel-managed SSL)
- **Monitoring:** PostHog (product analytics, funnels), Sentry (error tracking)

---

## License

Elastic License 2.0 — source available, non-compete, no commercial resale without permission.
