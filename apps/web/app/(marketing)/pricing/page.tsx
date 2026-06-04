import type { Metadata } from "next";
import {
  ClipboardCheck,
  Map,
  BookOpen,
  Brain,
  MessageSquare,
  FileText,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import { PricingCards } from "./pricing-cards";
import { PricingCtaButtons } from "./pricing-cta-buttons";
import { PricingFaq } from "./pricing-faq";
import { getOptionalUser } from "~/lib/auth/session";

export const metadata: Metadata = {
  title: "Pricing — GradifyHub",
  description: "Free to start. Upgrade when you're ready.",
};

type Feature = {
  label: string;
  free: boolean | string;
  pro: boolean | string;
};

type FeatureGroup = {
  heading: string;
  rows: Feature[];
};

const featureGroups: FeatureGroup[] = [
  {
    heading: "Core",
    rows: [
      { label: "Assessment (adaptive skill assessment)", free: true, pro: true },
      { label: "Personalised Roadmap", free: true, pro: true },
      { label: "Lessons per day", free: "2", pro: "Unlimited" },
      { label: "Roadmap generations", free: "2 total", pro: "Unlimited" },
      { label: "Roadmap regeneration", free: false, pro: true },
    ],
  },
  {
    heading: "AI features",
    rows: [
      { label: "AI quiz generator", free: "2 / day", pro: "Unlimited" },
      { label: "Ladunni sessions", free: false, pro: "Unlimited" },
      { label: "Chat history", free: false, pro: "Full history" },
      { label: "Advanced Roadmap generation", free: false, pro: true },
    ],
  },
  {
    heading: "Growth tools",
    rows: [
      { label: "Gig & job match feed", free: false, pro: true },
      { label: "Company intel briefings", free: false, pro: true },
      { label: "Streak freeze", free: false, pro: true },
      { label: "Priority lesson queue", free: false, pro: true },
    ],
  },
  {
    heading: "Career acceleration",
    rows: [
      { label: "Mock interviews", free: false, pro: true },
      { label: "AI resume builder", free: true, pro: true },
      { label: "Resume PDF export", free: false, pro: true },
    ],
  },
];

const tierNames = ["Free", "Pro"] as const;

const painPoints = [
  {
    problem: "Overpaying for courses that don't lead to jobs",
    solutionTitle: "Personalised Roadmap",
    solutionDesc: "Built from your Assessment, not a generic template. Every Tariq targets a real hiring gap.",
  },
  {
    problem: "Studying hard but not retaining it",
    solutionTitle: "Adaptive quizzes + Ladunni",
    solutionDesc: "Test as you learn, get unstuck instantly. Ladunni knows exactly where you are.",
  },
  {
    problem: "No idea what employers actually want",
    solutionTitle: "Live job market signals",
    solutionDesc: "Roadmaps stay aligned to real hiring demand. What you learn is what companies are hiring for.",
  },
  {
    problem: "Can't prove your skills to recruiters",
    solutionTitle: "Verified portfolio artifacts",
    solutionDesc: "GitHub-linked projects that show execution, not just knowledge. Proof that travels with your resume.",
  },
];

const proFeatures = [
  {
    icon: ClipboardCheck,
    title: "Assessment",
    desc: "Know exactly where your gaps are before spending a single minute on the wrong topic.",
  },
  {
    icon: Map,
    title: "Unlimited Roadmap",
    desc: "Generate and regenerate your learning path as your goals evolve.",
  },
  {
    icon: BookOpen,
    title: "Full Lesson Library",
    desc: "No daily caps. Work at your own pace through every lesson.",
  },
  {
    icon: Brain,
    title: "Ladunni + Quizzes",
    desc: "Get unstuck instantly. Test what you just learned before moving on.",
  },
  {
    icon: MessageSquare,
    title: "Interview Prep",
    desc: "Practice with AI before the real thing — technical, behavioural, system design.",
  },
  {
    icon: FileText,
    title: "AI Resume Builder",
    desc: "Export a polished, role-targeted resume that matches what recruiters scan for.",
  },
  {
    icon: Briefcase,
    title: "Company Intel Briefings",
    desc: "Know what each company actually tests for before you apply.",
  },
  {
    icon: TrendingUp,
    title: "Job & Gig Match Feed",
    desc: "See roles that match your current skill level — updated from live job data.",
  },
];

const toolkitRows = [
  { tool: "Coursera Plus", cost: "$59/mo" },
  { tool: "ChatGPT Plus", cost: "$20/mo" },
  { tool: "LeetCode Premium", cost: "$35/mo" },
  { tool: "Resume AI tools", cost: "$20/mo" },
  { tool: "Career coaching", cost: "$100+/hr" },
];

const featureCategories = [
  { icon: ClipboardCheck, label: "Assessment" },
  { icon: Map, label: "Roadmap" },
  { icon: BookOpen, label: "Lessons" },
  { icon: Brain, label: "Ladunni" },
  { icon: MessageSquare, label: "Interviews" },
  { icon: FileText, label: "Resume" },
];

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === "string") return <span className="text-sm">{value}</span>;
  if (value) return <span className="text-foreground">✓</span>;
  return <span className="text-muted-foreground/30">—</span>;
}

export default async function PricingPage() {
  const user = await getOptionalUser();
  const isLoggedIn = !!user;

  return (
    <div className="bg-background text-foreground">

      {/* ── Hero ── */}
      <section className="border-b px-6 py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-green">
            GradifyHub Pro
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Stop guessing.{" "}
            <span className="text-brand-green">Start proving.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base text-muted-foreground">
            The fastest path from where you are now to a tech role offer.
            Assessment → Roadmap → Tariq → portfolio → job.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-full bg-brand-green px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Upgrade for just $10/month →
            </a>
            <a
              href={isLoggedIn ? "/dashboard" : "/sign-up"}
              className="inline-flex rounded-full border px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              Try for free
            </a>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            No credit card required · Cancel anytime
          </p>

          {/* Feature category icons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            {featureCategories.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className="h-4 w-4 text-brand-green" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-b bg-muted/20 px-6 py-5">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center divide-x divide-border">
          {[
            { value: "130+", label: "Available Roadmap" },
            { value: "7 stages", label: "Complete career path" },
            { value: "Free to start", label: "No card required" },
            { value: "AI-powered", label: "Assessment · Roadmap · Interview Prep" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center px-8 py-2 text-center">
              <span className="text-base font-bold tracking-tight">{value}</span>
              <span className="mt-0.5 text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pain points ── */}
      <section className="border-b px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              What&apos;s slowing you down?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Real frustrations developers deal with — and how GradifyHub Pro fixes them.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {painPoints.map((item) => (
              <div key={item.problem} className="rounded-xl border bg-background p-6 space-y-4">
                <p className="text-sm italic text-red-500/80">
                  <span className="mr-2 not-italic font-semibold text-red-500">✕</span>
                  &ldquo;{item.problem}&rdquo;
                </p>
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <span className="text-brand-green">✓</span>
                    {item.solutionTitle}
                  </p>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {item.solutionDesc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What You Get with Pro ── */}
      <section className="border-b bg-muted/20 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              What You Get with Pro
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Every feature designed to accelerate your path to a hired offer.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {proFeatures.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border bg-background p-5 space-y-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-green/10">
                  <Icon className="h-5 w-5 text-brand-green" />
                </div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Replace your toolkit ── */}
      <section className="border-b px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Replace your entire toolkit.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Everything developers pay for separately — in one subscription.
            </p>
          </div>
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tool</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground">Monthly cost</th>
                </tr>
              </thead>
              <tbody>
                {toolkitRows.map(({ tool, cost }) => (
                  <tr key={tool} className="border-b">
                    <td className="px-5 py-4 text-foreground/80">{tool}</td>
                    <td className="px-5 py-4 text-right text-muted-foreground">{cost}</td>
                  </tr>
                ))}
                <tr className="border-b bg-muted/10">
                  <td className="px-5 py-4 font-medium">Total without GradifyHub</td>
                  <td className="px-5 py-4 text-right font-semibold text-muted-foreground line-through">$134+/mo</td>
                </tr>
                <tr className="bg-brand-green/5">
                  <td className="px-5 py-4 font-bold">GradifyHub Pro</td>
                  <td className="px-5 py-4 text-right text-lg font-bold text-brand-green">$10/mo</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Save over $120/mo. No contracts, cancel any time.
          </p>
        </div>
      </section>

      {/* ── Pricing cards ── */}
      <section id="pricing" className="border-b px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            For almost the price of a coffee
          </p>
          <PricingCards initialIsLoggedIn={isLoggedIn} />
        </div>
      </section>

      {/* ── Feature comparison ── */}
      <section className="border-b px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-xl font-semibold tracking-tight">
            Compare features across plans
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="pb-6 text-left font-normal text-muted-foreground" />
                  {tierNames.map((name) => (
                    <th key={name} className="pb-6 text-center">
                      <span className="block font-semibold">{name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureGroups.map((group) => (
                  <>
                    <tr key={group.heading} className="border-t">
                      <td
                        colSpan={3}
                        className="pb-3 pt-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                      >
                        {group.heading}
                      </td>
                    </tr>
                    {group.rows.map((feature) => (
                      <tr key={feature.label} className="border-t border-border/50">
                        <td className="py-3.5 pr-6 text-foreground/80">{feature.label}</td>
                        <td className="py-3.5 text-center">
                          <Cell value={feature.free} />
                        </td>
                        <td className="py-3.5 text-center">
                          <Cell value={feature.pro} />
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            All plans are billed monthly. No contracts, cancel any time.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-b px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <PricingFaq />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-foreground px-6 py-20 text-background">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Start Learning Smarter Today
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-background/70">
            Join developers who use GradifyHub to assess, learn, and get hired faster.
          </p>
          <PricingCtaButtons initialIsLoggedIn={isLoggedIn} />
          <p className="mt-4 text-xs text-background/50">No credit card required · Cancel anytime</p>
        </div>
      </section>

    </div>
  );
}
