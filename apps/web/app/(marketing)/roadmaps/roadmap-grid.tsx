"use client";

import { useState } from "react";
import Link from "next/link";

type Roadmap = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  nodeCount: number;
};

type Category = "All" | "Role Based" | "Skill Based" | "Best Practices";

const CATEGORY_COLORS: Record<Exclude<Category, "All">, string> = {
  "Role Based":     "border-l-blue-500",
  "Skill Based":    "border-l-brand-green",
  "Best Practices": "border-l-violet-500",
};

const CATEGORY_BADGE: Record<Exclude<Category, "All">, string> = {
  "Role Based":     "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "Skill Based":    "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  "Best Practices": "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
};

const SLUG_CATEGORY: Record<string, Exclude<Category, "All">> = {
  // ── Role Based ──────────────────────────────────────────────────────────────
  "frontend":            "Role Based",
  "backend":             "Role Based",
  "full-stack":          "Role Based",
  "fullstack":           "Role Based",
  "devops":              "Role Based",
  "devsecops":           "Role Based",
  "data-analyst":        "Role Based",
  "ai-data-scientist":   "Role Based",
  "android":             "Role Based",
  "ios":                 "Role Based",
  "machine-learning":    "Role Based",
  "mlops":               "Role Based",
  "blockchain":          "Role Based",
  "qa":                  "Role Based",
  "software-architect":  "Role Based",
  "product-manager":     "Role Based",
  "engineering-manager": "Role Based",
  "cyber-security":      "Role Based",
  "game-developer":      "Role Based",
  "technical-writer":    "Role Based",
  "ux-design":           "Role Based",
  "prompt-engineering":  "Role Based",
  "data-science":        "Role Based",
  "data-engineering":    "Role Based",
  "cloud-architect":     "Role Based",
  // ── Skill Based ─────────────────────────────────────────────────────────────
  "react":              "Skill Based",
  "vue":                "Skill Based",
  "angular":            "Skill Based",
  "javascript":         "Skill Based",
  "typescript":         "Skill Based",
  "python":             "Skill Based",
  "java":               "Skill Based",
  "rust":               "Skill Based",
  "go":                 "Skill Based",
  "golang":             "Skill Based",
  "docker":             "Skill Based",
  "kubernetes":         "Skill Based",
  "aws":                "Skill Based",
  "linux":              "Skill Based",
  "git-github":         "Skill Based",
  "sql":                "Skill Based",
  "mongodb":            "Skill Based",
  "postgresql":         "Skill Based",
  "graphql":            "Skill Based",
  "nodejs":             "Skill Based",
  "node-js":            "Skill Based",
  "spring-boot":        "Skill Based",
  "asp-dot-net-core":   "Skill Based",
  "react-native":       "Skill Based",
  "flutter":            "Skill Based",
  "redis":              "Skill Based",
  "system-design":      "Skill Based",
  "design-system":      "Skill Based",
  "cpp":                "Skill Based",
  "csharp":             "Skill Based",
  "php":                "Skill Based",
  "ruby-on-rails":      "Skill Based",
  "swift":              "Skill Based",
  "kotlin":             "Skill Based",
  "terraform":          "Skill Based",
  "ci-cd":              "Skill Based",
  "computer-science":   "Skill Based",
  "data-structures":    "Skill Based",
  "express":            "Skill Based",
  "nextjs":             "Skill Based",
  "next-js":            "Skill Based",
  "nuxt":               "Skill Based",
  "svelte":             "Skill Based",
  "elixir":             "Skill Based",
  "scala":              "Skill Based",
  "r":                  "Skill Based",
  "supabase":           "Skill Based",
  "firebase":           "Skill Based",
  "kafka":              "Skill Based",
  "nginx":              "Skill Based",
  "network":            "Skill Based",
  "prompting":          "Skill Based",
  // ── Best Practices ──────────────────────────────────────────────────────────
  "code-review":             "Best Practices",
  "api-security":            "Best Practices",
  "aws-best-practices":      "Best Practices",
  "backend-performance":     "Best Practices",
  "frontend-performance":    "Best Practices",
  "design-patterns":         "Best Practices",
  "software-design-architecture": "Best Practices",
  "technical-interview-prep":     "Best Practices",
};

function getCategory(slug: string): Exclude<Category, "All"> {
  return SLUG_CATEGORY[slug] ?? "Skill Based";
}

const CATEGORIES: Category[] = ["All", "Role Based", "Skill Based", "Best Practices"];

const CATEGORY_DESCRIPTIONS: Record<Exclude<Category, "All">, string> = {
  "Role Based":     "End-to-end paths for specific engineering roles and job titles.",
  "Skill Based":    "Deep-dive paths for individual languages, frameworks, and tools.",
  "Best Practices": "Quality, security, and performance standards every engineer should know.",
};

export function RoadmapGrid({ roadmaps }: { roadmaps: Roadmap[] }) {
  const [active, setActive] = useState<Category>("All");

  const categorized = CATEGORIES.slice(1).map((cat) => ({
    label: cat,
    items: roadmaps.filter((r) => getCategory(r.slug) === cat),
  }));

  const filtered =
    active === "All"
      ? categorized
      : categorized.filter((c) => c.label === active);

  const totalShown = filtered.reduce((n, c) => n + c.items.length, 0);

  return (
    <div className="space-y-10">
      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((cat) => {
          const count =
            cat === "All"
              ? roadmaps.length
              : roadmaps.filter((r) => getCategory(r.slug) === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                active === cat
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {cat}
              <span className={`rounded-full px-1.5 py-px text-[11px] font-semibold ${
                active === cat ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
        <span className="ml-auto text-xs text-muted-foreground">
          {totalShown} roadmaps
        </span>
      </div>

      {/* Sections */}
      {filtered.map(({ label, items }) => {
        if (items.length === 0) return null;
        const cat = label as Exclude<Category, "All">;
        return (
          <section key={label} className="space-y-4">
            <div className="flex items-baseline gap-3">
              <h2 className="text-base font-semibold">{label}</h2>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${CATEGORY_BADGE[cat]}`}>
                {items.length}
              </span>
              {active === "All" && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {CATEGORY_DESCRIPTIONS[cat]}
                </span>
              )}
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((r) => (
                <Link
                  key={r.id}
                  href={`/roadmaps/${r.slug}`}
                  className={`group flex flex-col gap-1.5 rounded-lg border-l-2 border border-border bg-background px-4 py-3.5 transition-all hover:shadow-sm hover:border-l-2 ${CATEGORY_COLORS[cat]}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold leading-snug group-hover:text-brand-green transition-colors">
                      {r.title}
                    </p>
                    <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {r.nodeCount}
                    </span>
                  </div>
                  {r.description && (
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {r.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
