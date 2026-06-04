# GradifyHub

**AI-powered career acceleration platform.** Takes tech learners from adaptive assessment → personalized roadmap → curated lessons → mock interview → verified resume → job offer.

Live: [gradifyhub.com](https://gradifyhub.com)

---

## What this is

GradifyHub is a full-stack SaaS platform built around three hard problems:

1. **Measuring what a learner actually knows** — not self-reported, not a static quiz. An IRT-calibrated adaptive assessment across 9 technical and communication dimensions, with per-user difficulty banding based on prior experience signals.
2. **Mapping that to what the market actually wants** — real-time job ETL from Greenhouse, Lever, Ashby, and Adzuna; salary bands and required-skill frequency extracted per role.
3. **Proving what they can do** — GitHub artifact verification, public portfolio share URLs, and a resume builder that generates structured output from AI intake conversations.

---

## Core AI/ML Engineering

### Multi-Agent Assessment Pipeline

The assessment uses a LangGraph.js multi-agent pipeline:

- **Orchestrator** fans out to parallel domain-specialist agents (technical depth, communication clarity, soft-skill signals)
- Each agent scores responses on its dimension and returns structured output (Zod-validated via Vercel AI SDK `generateObject`)
- **Synthesizer** merges dimension scores into a theta estimate (Rasch-compatible) and generates a plain-language skill profile
- Results feed directly into the roadmap generator as structured prompt context

The item bank (120 calibrated items across 9 dimensions, 3 difficulty bands per dimension) is stored in Postgres and selected via a difficulty-banding algorithm keyed to the user's `aiCalibration` profile built during onboarding.

### FSRS Spaced-Repetition Engine (English Immersion)

The English track uses FSRS v5 (Free Spaced Repetition Scheduler) over SM-2:
- ±5.1% vs ±16.2% retention accuracy; 25% fewer review sessions for the same retention target
- Per-card state machine: `new → learning → review → relearning`
- Stability, difficulty, and lapse counts tracked per vocabulary item
- Grades 1–4 map to FSRS scheduling intervals; next review date computed on submit

### YouTube Vocabulary Mining

Users paste a YouTube URL; the platform:
1. Fetches transcript via `youtube-transcript` and splits it into context-window-sized chunks
2. Runs `aiGenerateObject` with a structured extraction schema to identify vocabulary items, definitions, and example sentences
3. Presents items in an accept/skip UI; accepted items enter the FSRS vault with full scheduling state

### AI Shadowing Coach

- Reference audio generated via ElevenLabs TTS, cached to Cloudflare R2 (`audio/reference/` prefix, no expiry)
- User recordings uploaded via presigned PUT URL to R2 (`audio/user/` prefix, 7-day TTL)
- Whisper transcribes user audio; `evaluateShadowing()` calls `aiGenerateObject` with a scoring schema (accuracy / pacing / clarity / naturalness + 3 named improvement suggestions)
- Both ElevenLabs TTS call and R2 PUT are wrapped in `fetchWithRetry` (3 attempts, 1/2/3s backoff on 5xx)

### Interview Prep Pipeline

Six-agent LangGraph pipeline triggered on session start:

1. **Job parser** — extracts required skills, seniority signals, and company context from a job description
2. **Resume parser** — extracts candidate strengths, gaps, and STAR stories from uploaded CV
3. **Gap analyzer** — cross-references job vs resume, identifies 3–5 high-value prep areas
4. **Question generator** — writes 8 role-specific behavioral and technical questions
5. **Rubric builder** — generates scoring rubrics per question
6. **Session assembler** — packages everything into a practice session with live AI feedback

Each step wrapped in `withTimeout` (15–20s per step) to surface failures as user-visible errors rather than hanging requests.

---

## Architecture

```
apps/web/                    # Next.js 15 — App Router + Server Actions
├─ app/
│  ├─ (marketing)/           # Landing, pricing, about, blog
│  ├─ (app)/                 # Dashboard, roadmap, lessons, resume, English immersion
│  ├─ (auth)/                # Sign-in, sign-up, onboarding
│  └─ api/                   # Webhooks, upload URLs, voice sessions
├─ actions/                  # Server actions by domain
├─ lib/
│  ├─ ai/                    # AI client wrapper — rate limits, usage logging, budget enforcement
│  ├─ billing/               # hasFeature() — re-checked server-side on every gated action
│  ├─ english/               # Transcript extraction, vocab extraction, FSRS engine, shadowing eval
│  └─ srs/                   # FSRS algorithm (fsrs.ts + schedule.ts)
└─ inngest/                  # Background jobs (event-driven)

packages/
├─ db/                       # Drizzle schema + query builders (user-scoped)
├─ contracts/                # Zod schemas shared client/server
└─ ui/                       # shadcn/ui primitives + design tokens

apps/ml/                     # Python FastAPI sidecar
├─ irt/                      # catsim IRT engine (Rasch model, adaptive item selection)
├─ embeddings/               # BGE-M3 via sentence-transformers + pgvector
└─ reranker/                 # Cross-encoder reranking for semantic search
```

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions) |
| Language | TypeScript strict |
| Database | PostgreSQL (Neon) + pgvector |
| ORM | Drizzle |
| Auth | Better Auth |
| UI | Tailwind CSS + shadcn/ui |
| AI SDK | Vercel AI SDK + LangGraph.js |
| Primary LLM | Claude Sonnet 4.5 |
| High-volume LLM | Claude Haiku 4.5 |
| Spaced repetition | ts-fsrs v5 |
| Voice | LiveKit + OpenAI Realtime |
| Background jobs | Inngest |
| Storage | Cloudflare R2 |
| Email | Resend |
| Payments | LemonSqueezy + NOWPayments |
| Observability | PostHog + Sentry |
| Python sidecar | FastAPI + catsim + sentence-transformers |

---

## Key Database Tables

| Table | Purpose |
|---|---|
| `user`, `profile` | Auth + onboarding calibration (`aiCalibration` JSONB) |
| `attempt`, `item`, `response` | IRT assessment sessions |
| `roadmap` | AI-generated personalized learning plan |
| `lesson`, `lessonProgress`, `quizSubmission` | 3-track curriculum (67 lessons) |
| `userVocabulary` | FSRS vocab vault (stability, difficulty, state, lapses) |
| `vocabMiningSource` | YouTube mining history |
| `speakingSession` | AI speaking partner session logs |
| `roadmapCatalog`, `roadmapCatalogNode` | 84 roadmap.sh roadmaps (CC BY 4.0) |
| `subscription`, `coupon` | LemonSqueezy billing |
| `adminAuditLog` | RBAC audit trail |

---

## API Reference

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/english/upload-url` | Presigned R2 PUT URL for user audio |
| POST | `/api/english/shadow/reference-audio` | ElevenLabs TTS → R2, returns playback URL |
| POST | `/api/english/voice-session` | LiveKit room creation, returns token |
| POST | `/api/interview-prep/run` | Triggers 6-agent prep pipeline |
| POST | `/api/actions/foundation-check` | AI-scored foundation check (3 tracks) |
| POST | `/api/webhooks/lemonsqueezy` | Subscription lifecycle events |
| POST | `/api/webhooks/nowpayments` | Crypto payment confirmation |

---

## Getting Started

### Prerequisites

- Node.js 20+, pnpm
- PostgreSQL (Neon recommended)
- Python 3.10+ (ML sidecar, optional for local dev)

### Setup

```bash
git clone https://github.com/BekOsu/gradifyhub.git
cd gradifyhub
pnpm install

cp apps/web/.env.example apps/web/.env.local
# Fill in: DATABASE_URL, BETTER_AUTH_SECRET, ANTHROPIC_API_KEY,
#          LEMONSQUEEZY_API_KEY, CLOUDFLARE_R2_*, RESEND_API_KEY

pnpm db:migrate    # apply all migrations
pnpm seed          # seed assessment items + skill groups
pnpm dev           # start web at localhost:3000
```

### Commands

```bash
pnpm dev            # start all apps in watch mode
pnpm build          # production build check
pnpm lint           # ESLint + TypeScript strict
pnpm db:generate    # create migration from schema diff
pnpm db:migrate     # apply migrations
pnpm db:studio      # Drizzle Studio (DB browser)
pnpm seed:items     # push assessment item bank to DB
pnpm seed:lessons   # push lesson content to DB
```

---

## Deployment

- **Web + API:** Vercel (auto-deploy on push to `main`)
- **Python sidecar:** Modal or Fly.io
- **Database:** Neon (serverless Postgres, pgvector enabled)
- **Storage:** Cloudflare R2 — `audio/user/` (7-day TTL), `audio/reference/` (no expiry)
- **Domain:** gradifyhub.com

---

## License

MIT