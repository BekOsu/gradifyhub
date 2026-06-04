import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Zap, Rocket, Lightbulb } from "lucide-react";

export const metadata: Metadata = {
  title: "Inspire — GradifyHub Community",
  description: "Daily inspiration, coding challenges, and creative project ideas for developers.",
};

const TYPE_META = {
  daily:     { icon: Sparkles,  label: "Daily Inspiration", color: "text-amber-500",   bg: "bg-amber-50 ring-amber-200" },
  challenge: { icon: Zap,       label: "Challenge",         color: "text-purple-500",  bg: "bg-purple-50 ring-purple-200" },
  project:   { icon: Rocket,    label: "Project Idea",      color: "text-blue-500",    bg: "bg-blue-50 ring-blue-200" },
  tip:       { icon: Lightbulb, label: "Dev Tip",           color: "text-green-500",   bg: "bg-green-50 ring-green-200" },
};

// Static seed content shown before DB has any data
const SEED_POSTS = [
  {
    id: "seed-1",
    type: "daily" as const,
    title: "Ship something small today",
    body: "The best antidote to imposter syndrome is momentum. Pick the tiniest feature you've been procrastinating on and ship it before lunch. Done is better than perfect.",
    tags: ["mindset", "productivity"],
  },
  {
    id: "seed-2",
    type: "challenge" as const,
    title: "Build a CLI tool in 2 hours",
    body: "Challenge: build a command-line tool that does one thing really well. Ideas — a smart file renamer, a local bookmark manager, or a timer with Pomodoro support. Share your GitHub link!",
    tags: ["cli", "typescript", "challenge"],
  },
  {
    id: "seed-3",
    type: "project" as const,
    title: "AI-powered study buddy",
    body: "Idea: build a personal study assistant that ingests a PDF / docs and lets you chat with it. Use embeddings + RAG. Great portfolio piece for AI/ML roles. Stack: Next.js + LangChain + Pinecone.",
    tags: ["ai", "rag", "nextjs", "portfolio"],
  },
  {
    id: "seed-4",
    type: "tip" as const,
    title: "Use `console.time` for quick benchmarks",
    body: "Instead of reaching for a profiler, drop `console.time('label')` and `console.timeEnd('label')` around the code you want to measure. Quick, zero-dependency, works anywhere.",
    tags: ["javascript", "debugging", "performance"],
  },
  {
    id: "seed-5",
    type: "challenge" as const,
    title: "Recreate a Stripe component from scratch",
    body: "Pick any UI element from stripe.com — a card, a badge, an input — and rebuild it pixel-perfect with Tailwind. You'll learn way more than following a tutorial.",
    tags: ["css", "tailwind", "challenge", "ui"],
  },
  {
    id: "seed-6",
    type: "project" as const,
    title: "Developer metrics dashboard",
    body: "Pull your GitHub commits, PR reviews, and streak data into a personal dashboard. Show it off in interviews to prove you ship consistently. Bonus: add a public shareable URL.",
    tags: ["github", "dashboard", "portfolio"],
  },
  {
    id: "seed-7",
    type: "daily" as const,
    title: "Read one RFC or spec today",
    body: "HTTP/2, WebSockets, the OpenAI function-calling spec — pick one RFC or spec you use daily and actually read the intro section. Understanding the 'why' makes debugging 10x faster.",
    tags: ["learning", "deep-dive"],
  },
  {
    id: "seed-8",
    type: "tip" as const,
    title: "Git aliases that save 20 min/day",
    body: "Add `git config --global alias.lg \"log --oneline --graph --all --decorate\"` and `alias.st status -sb`. Small wins compound into big time savings.",
    tags: ["git", "productivity", "devtools"],
  },
];

export default function InspirePage() {
  const daily = SEED_POSTS.filter((p) => p.type === "daily");
  const challenges = SEED_POSTS.filter((p) => p.type === "challenge");
  const projects = SEED_POSTS.filter((p) => p.type === "project");
  const tips = SEED_POSTS.filter((p) => p.type === "tip");

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      {/* Header */}
      <div>
        <Link href="/community" className="text-sm text-muted-foreground hover:text-foreground">
          ← Community
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100">
            <Sparkles className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Inspire</h1>
            <p className="text-sm text-muted-foreground">
              Daily sparks to keep you building, learning, and growing.
            </p>
          </div>
        </div>
      </div>

      {/* Sections */}
      {[
        { label: "✨ Daily Inspiration", posts: daily },
        { label: "⚡ Challenges", posts: challenges },
        { label: "🚀 Project Ideas", posts: projects },
        { label: "💡 Dev Tips", posts: tips },
      ].map(({ label, posts }) => (
        <section key={label}>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
            {label}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {posts.map((post) => {
              const { icon: Icon, label: typeLabel, color, bg } = TYPE_META[post.type];
              return (
                <article
                  key={post.id}
                  className="flex flex-col gap-3 rounded-xl border bg-background p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${bg} ${color}`}>
                      <Icon className="h-3 w-3" />
                      {typeLabel}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold leading-snug">{post.title}</h3>
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{post.body}</p>
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/community/topics/${tag}`}
                        className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted/80"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      {/* CTA */}
      <div className="rounded-xl border bg-gradient-to-br from-brand-green/5 to-background p-6 text-center">
        <p className="text-sm font-semibold">Have a creative idea to share?</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Post it in the community — your spark might be exactly what someone else needs today.
        </p>
        <Link
          href="/community"
          className="mt-4 inline-flex rounded-full bg-brand-green px-5 py-2 text-sm font-semibold text-white hover:bg-brand-green/90"
        >
          Share in Community
        </Link>
      </div>
    </div>
  );
}

