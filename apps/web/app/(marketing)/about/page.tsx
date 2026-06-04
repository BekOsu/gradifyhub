import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — GradifyHub",
  description:
    "GradifyHub is the structured path from skill gaps to job offers — adaptive assessment, AI-powered roadmaps, and proof that gets developers hired.",
};

const painPoints = [
  {
    label: "No clear starting point",
    desc: "You've watched hours of tutorials but still aren't sure what you actually know — or where the gaps are.",
  },
  {
    label: "Scattered resources, no direction",
    desc: "YouTube, Udemy, Reddit, bootcamps — everyone says something different. There's no single path that makes sense for you.",
  },
  {
    label: "Can't prove what you know",
    desc: "You can build things, but your CV is a list of buzzwords. Recruiters can't tell your skills apart from anyone else's.",
  },
];

const forWho = [
  {
    who: "Self-taught developers",
    detail: "You've been building side projects and grinding tutorials. You need structure, a skills baseline, and a credible way to show your work.",
  },
  {
    who: "Bootcamp graduates",
    detail: "You finished the course but feel lost on what to do next. GradifyHub picks up where your bootcamp left off — with a job-market-aligned path.",
  },
  {
    who: "CS students going industry",
    detail: "Academic knowledge doesn't always translate to employer expectations. We bridge the gap between what you studied and what companies actually hire for.",
  },
  {
    who: "Career-changers into tech",
    detail: "Switching from another field? We assess where you genuinely are, skip what you already know, and focus your time on the skills that move the needle.",
  },
];

const steps = [
  {
    step: "01",
    name: "Assessment",
    desc: "Take an adaptive diagnostic that finds exactly where you stand — across every skill a hiring manager cares about. No guessing, no generic results.",
  },
  {
    step: "02",
    name: "Roadmap",
    desc: "Your Roadmap is built from your Assessment results and live hiring demand. It skips what you already know and focuses on the gaps that matter most right now.",
  },
  {
    step: "03",
    name: "Lessons & daily practice",
    desc: "Short, focused lessons with embedded quizzes and an AI-generated daily practice quiz. Active recall, not passive watching.",
  },
  {
    step: "04",
    name: "Hands-on projects",
    desc: "Build real projects linked to your GitHub. Not toy examples — things you can point to in an interview and explain in depth.",
  },
  {
    step: "05",
    name: "Mock Interviews",
    desc: "An AI interviewer asks the questions real companies ask. It scores your answers, explains every gap, and runs you through it again until you're ready.",
  },
  {
    step: "06",
    name: "Resume with proof",
    desc: "Your resume auto-populates with verified skills and projects. Every claim on your CV links back to real evidence — not just a list of buzzwords.",
  },
  {
    step: "07",
    name: "Job matching",
    desc: "A live feed of roles ranked by your skill fit. Apply to jobs where you're already a strong match — not jobs you're hoping you can bluff your way into.",
  },
];

const beliefs = [
  {
    title: "Assess before you teach",
    desc: "Giving everyone the same curriculum wastes their time. We find out what you know first, then build a path around what you don't.",
  },
  {
    title: "Learning should end with proof",
    desc: "A completion certificate means nothing. Every path on GradifyHub ends with something a recruiter can actually verify.",
  },
  {
    title: "Job market data, not guesses",
    desc: "What to learn next should be driven by what employers are hiring for right now — not by what was popular two years ago.",
  },
  {
    title: "Respect the learner's time",
    desc: "We don't pad courses to inflate hours. We skip what you already know, cut what the market doesn't need, and move fast.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground">

      {/* ── Hero ── */}
      <section className="border-b px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Our mission
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            The structured path from skill gaps to job offers.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Most developers don&apos;t fail to get hired because they can&apos;t code.
            They fail because they can&apos;t show what they know in a way a recruiter
            understands. GradifyHub is built to close that gap — with an adaptive
            learning system that ends with proof, not just progress bars.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
            >
              Start free Assessment →
            </Link>
            <Link
              href="/roadmaps"
              className="inline-flex rounded-full border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              Browse Roadmap
            </Link>
          </div>
        </div>
      </section>

      {/* ── The problem ── */}
      <section className="border-b bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 text-xl font-semibold">Why most learning platforms don&apos;t get you hired</h2>
          <p className="mb-10 text-sm text-muted-foreground">
            Udemy gives you 40-hour courses. YouTube gives you tutorials. Bootcamps give you a cohort.
            None of them give you a calibrated starting point, a path aligned to what employers want right now,
            or any way to prove your skills to someone making a hiring decision.
          </p>
          <div className="grid gap-5 sm:grid-cols-3">
            {painPoints.map((p) => (
              <div key={p.label} className="rounded-xl border bg-background p-5">
                <p className="mb-2 text-sm font-semibold">{p.label}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who this is for ── */}
      <section className="border-b px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 text-xl font-semibold">Who GradifyHub is for</h2>
          <p className="mb-10 text-sm text-muted-foreground">
            We built this for developers who are serious about getting hired — not for casual learners
            collecting certificates.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            {forWho.map((f) => (
              <div key={f.who} className="rounded-xl border p-5">
                <p className="mb-1.5 text-sm font-semibold">{f.who}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-b px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 text-xl font-semibold">How it works</h2>
          <p className="mb-10 text-sm text-muted-foreground">
            Seven steps. One outcome: a developer who can get in the room and prove it.
          </p>
          <div className="space-y-px">
            {steps.map((s) => (
              <div
                key={s.step}
                className="flex gap-5 rounded-xl px-4 py-5 transition-colors hover:bg-muted/40"
              >
                <span className="mt-0.5 shrink-0 font-mono text-xs font-bold text-brand-green">
                  {s.step}
                </span>
                <div>
                  <p className="text-sm font-semibold">{s.name}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What we believe ── */}
      <section className="border-b bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-xl font-semibold">What we believe about learning</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {beliefs.map((b) => (
              <div key={b.title} className="rounded-xl border bg-background p-5">
                <p className="mb-2 text-sm font-semibold">{b.title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-foreground px-6 py-20 text-background">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Start with where you actually are.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-background/70">
            Take the free Assessment. No credit card. No pitch. Just an honest
            look at where you stand and what to do next.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/sign-up"
              className="inline-flex rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-background/90 hover:shadow-md"
            >
              Start your Assessment →
            </Link>
            <Link
              href="/pricing"
              className="inline-flex rounded-full border border-background/30 px-6 py-3 text-sm font-medium text-background/80 transition-colors hover:border-background/60 hover:text-background"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
