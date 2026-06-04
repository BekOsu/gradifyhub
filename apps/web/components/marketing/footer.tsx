import Link from "next/link";
import { Zap } from "lucide-react";

const sections = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing",      href: "/pricing" },
      { label: "Roadmaps",     href: "/roadmaps" },
      { label: "Assessment",   href: "/sign-up?next=/onboarding" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Blog",         href: "/blog" },
      { label: "Community",    href: "/community" },
      { label: "Open metrics", href: "/open" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Privacy",  href: "/privacy" },
      { label: "Terms",    href: "/terms" },
      { label: "Refund",   href: "/refund" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t bg-background px-6 py-14">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-green text-white">
                <Zap className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold tracking-tight">GradifyHub</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The structured path from skill gaps to your next tech offer. Assessment → Roadmap → Proof → Hired.
            </p>
            <p className="text-xs text-muted-foreground">© 2026 GradifyHub</p>
            <p className="text-xs text-muted-foreground">
              Roadmap content from{" "}
              <a href="https://roadmap.sh" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
                roadmap.sh
              </a>{" "}
              (CC BY 4.0)
            </p>
          </div>

          {/* Link sections */}
          {sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {section.title}
              </p>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
