import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, XCircle, Map, Brain, Briefcase, Shield, Lock, Circle } from "lucide-react";
import { HeroCta } from "~/components/marketing/hero-cta";
import { JourneySteps } from "~/components/marketing/journey-steps";
import { RevealSection } from "~/components/ui/reveal-section";
import { getOptionalUser } from "~/lib/auth/session";

export const metadata: Metadata = {
  title: "GradifyHub — Land your next tech role, with proof.",
  description:
    "Adaptive assessment finds your skill gaps. A personalised roadmap fills them. Verified projects prove it to employers. The structured path to your next developer role.",
};

const painPoints = [
  {
    problem: "Overpaying for courses that don't lead to jobs",
    solutionTitle: "Personalised AI Roadmap",
    solutionDesc: "Built from your Assessment, not a generic template. Every lesson targets a real hiring gap.",
    icon: Map,
  },
  {
    problem: "Studying hard but not retaining it",
    solutionTitle: "Adaptive quizzes + Ladunni",
    solutionDesc: "Test as you learn, get unstuck instantly. Ladunni knows exactly where you are in the material.",
    icon: Brain,
  },
  {
    problem: "No idea what employers actually want",
    solutionTitle: "Live job market signals",
    solutionDesc: "Roadmaps stay aligned to real hiring demand. What you learn is what companies are actually hiring for.",
    icon: Briefcase,
  },
  {
    problem: "Can't prove your skills to recruiters",
    solutionTitle: "Verified portfolio artifacts",
    solutionDesc: "GitHub-linked projects that show execution, not just knowledge. Proof that travels with your resume.",
    icon: Shield,
  },
];

const assessmentStrengths = [
  "Strong Python fundamentals",
  "LLM API experience",
  "System design awareness",
];
const assessmentGaps = [
  "RAG & retrieval pipelines",
  "Agentic patterns",
  "Evaluation frameworks",
];

const roadmapPhases = [
  {
    name: "Foundation",
    skills: [
      { label: "Python for AI", status: "done" as const },
      { label: "LLM Fundamentals", status: "active" as const },
      { label: "Prompting Basics", status: "locked" as const },
    ],
  },
  {
    name: "Core Skills",
    skills: [
      { label: "RAG & Retrieval", status: "locked" as const },
      { label: "Agentic Patterns", status: "locked" as const },
      { label: "System Design", status: "locked" as const },
    ],
  },
  {
    name: "Production",
    skills: [
      { label: "Evaluation", status: "locked" as const },
      { label: "Tooling", status: "locked" as const },
      { label: "Deployment", status: "locked" as const },
    ],
  },
];

const stats = [
  { value: "130+", label: "Roadmaps available" },
  { value: "7", label: "Career stages covered" },
  { value: "Free", label: "No card to start" },
  { value: "AI", label: "Assessment · Roadmap · Interview Prep" },
];

export default async function HomePage() {
  const user = await getOptionalUser();

  return (
    <div className="bg-background text-foreground">

      {/* ── Hero ── */}
      <section className="relative flex min-h-[68vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center" aria-hidden>
          <div className="h-[600px] w-[600px] rounded-full bg-brand-green/8 blur-[140px] animate-glow-pulse" />
        </div>
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.018]"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        <div className="mx-auto max-w-2xl">
          <div
            className="mb-6 inline-flex animate-fade-up items-center gap-2 rounded-full border border-brand-green/20 bg-brand-green/5 px-3.5 py-1.5 text-xs font-semibold text-brand-green"
            style={{ animationDelay: "0ms" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
            AI-powered career acceleration
          </div>

          <h1
            className="animate-fade-up text-[2.6rem] font-bold leading-[1.12] tracking-tight sm:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            Land your next tech role.{" "}
            <span className="text-brand-green">With skills you can prove.</span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-lg animate-fade-up text-base text-muted-foreground sm:text-lg"
            style={{ animationDelay: "180ms" }}
          >
            Adaptive Assessment finds your gaps. A personalised Roadmap fills them.
            Verified projects prove it to employers.
          </p>

          <div
            className="mt-8 flex animate-fade-up flex-col items-center gap-3 sm:flex-row sm:justify-center"
            style={{ animationDelay: "280ms" }}
          >
            <HeroCta label="Start your Assessment" initialIsLoggedIn={!!user} />
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              See how it works
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <p
            className="mt-5 animate-fade-up text-xs text-muted-foreground/70"
            style={{ animationDelay: "360ms" }}
          >
            No credit card needed to begin
          </p>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y bg-muted/30 px-6 py-4">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-0">
          {stats.map(({ value, label }, i) => (
            <div
              key={label}
              className={`flex flex-col items-center px-8 py-3 text-center ${
                i < stats.length - 1 ? "border-r border-border/60" : ""
              }`}
            >
              <span className="text-base font-bold tracking-tight text-foreground">{value}</span>
              <span className="mt-0.5 text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Assessment sample ── */}
      <section className="border-b px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <RevealSection className="mb-10 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Your Assessment result
            </p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              What your Assessment looks like
            </h2>
          </RevealSection>
          <RevealSection delay={60}>
            <div className="mx-auto max-w-lg rounded-2xl border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green/10 px-2.5 py-1 text-xs font-semibold text-brand-green">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                  Assessment complete
                </span>
                <span className="inline-flex rounded-full border bg-muted/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Example
                </span>
              </div>
              <p className="mb-4 text-sm font-medium">
                You are at <span className="font-bold text-foreground">Intermediate</span> level in AI Engineering
              </p>
              <div className="mb-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  Technical — Intermediate
                </span>
                <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600 dark:text-red-400">
                  Professional — Beginner
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Strengths</p>
                  <ul className="space-y-1.5">
                    {assessmentStrengths.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-sm text-foreground/80">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-green" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Gaps</p>
                  <ul className="space-y-1.5">
                    {assessmentGaps.map((g) => (
                      <li key={g} className="flex items-start gap-2 text-sm text-foreground/80">
                        <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground">Takes 12 minutes. No account needed to start.</p>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-full bg-brand-green px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-all duration-200 hover:bg-brand-green/90 active:scale-[0.98]"
              >
                Run your Assessment →
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── Roadmap sample ── */}
      <section className="border-b px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <RevealSection className="mb-10 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Your personalised Roadmap
            </p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              What your Roadmap looks like
            </h2>
          </RevealSection>
          <RevealSection delay={60}>
            <div className="mx-auto max-w-lg rounded-2xl border bg-card p-6 shadow-sm">
              <div className="mb-4 flex justify-end">
                <span className="inline-flex rounded-full border bg-muted/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Example
                </span>
              </div>
              <div className="space-y-5">
                {roadmapPhases.map((phase, pi) => (
                  <div key={phase.name}>
                    <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Phase {pi + 1} — {phase.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {phase.skills.map((skill) => (
                        <span
                          key={skill.label}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                            skill.status === "done"
                              ? "border-brand-green/30 bg-brand-green/10 text-brand-green"
                              : skill.status === "active"
                              ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "border-border bg-muted/30 text-muted-foreground opacity-60"
                          }`}
                        >
                          {skill.status === "done" && <CheckCircle2 className="h-3 w-3" />}
                          {skill.status === "active" && <Circle className="h-3 w-3 fill-current" />}
                          {skill.status === "locked" && <Lock className="h-3 w-3" />}
                          {skill.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground">Generated from your Assessment. Unique to your starting point.</p>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-full bg-brand-green px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-all duration-200 hover:bg-brand-green/90 active:scale-[0.98]"
              >
                Get your Roadmap →
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── Pain points ── */}
      <section className="border-b px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <RevealSection className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              The problem
            </p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              What&apos;s holding you back?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Real frustrations developers face — and how GradifyHub solves them.
            </p>
          </RevealSection>

          <div className="grid gap-4 sm:grid-cols-2">
            {painPoints.map((item, i) => (
              <RevealSection key={item.problem} delay={i * 60}>
                <div className="group rounded-2xl border bg-card p-6 shadow-sm transition-all duration-200 hover:border-border/80 hover:shadow-md">
                  <div className="mb-5 flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="flex items-start gap-2 text-sm text-muted-foreground">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                      <span className="italic">&ldquo;{item.problem}&rdquo;</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.solutionTitle}</p>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                        {item.solutionDesc}
                      </p>
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="border-b px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <RevealSection className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              How it works
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              An interactive path to your next offer.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
              Explore each stage to see exactly how GradifyHub adapts to your goals.
            </p>
          </RevealSection>
          <RevealSection delay={80}>
            <JourneySteps />
          </RevealSection>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-24">
        <RevealSection>
          <div className="mx-auto max-w-2xl rounded-3xl border bg-foreground px-8 py-16 text-center text-background shadow-xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-background/50">
              Get started today
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-background">
              Start your journey today.
            </h2>
            <p className="mx-auto mt-4 max-w-sm text-sm text-background/60 leading-relaxed">
              Join developers who use GradifyHub to assess, learn, and get hired.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-xl bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-background/90 hover:shadow-md active:scale-[0.98]"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-xl border border-background/20 px-6 py-3 text-sm font-medium text-background/70 transition-colors hover:border-background/40 hover:text-background"
              >
                View Pro plan
              </Link>
            </div>
            <p className="mt-5 text-xs text-background/40">No credit card required.</p>
          </div>
        </RevealSection>
      </section>

    </div>
  );
}