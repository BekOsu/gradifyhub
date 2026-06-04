import type { Metadata } from "next";
import Link from "next/link";
import { getRoadmapCatalogList } from "@repo/db/queries/roadmap-catalog";
import { RoadmapGrid } from "./roadmap-grid";

export const metadata: Metadata = {
  title: "Developer Roadmaps — GradifyHub",
  description:
    "Structured learning paths for every engineering role and skill. Browse roadmaps for frontend, backend, DevOps, AI, and 80+ more specializations.",
};

export default async function RoadmapsCatalogPage() {
  const roadmaps = await getRoadmapCatalogList();

  return (
    <div className="mx-auto max-w-6xl px-6 py-14 space-y-12">

      {/* Hero */}
      <div className="max-w-2xl space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Developer Roadmaps
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Structured paths for every engineering specialization — from first principles
          to production-ready. Browse {roadmaps.length}+ community-driven roadmaps,
          track topics as you go, and build a clear picture of what you know and what
          to learn next.
        </p>
        <div className="flex items-center gap-4 pt-1">
          <Link
            href="/sign-up"
            className="inline-flex rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
          >
            Sign up to track progress →
          </Link>
          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>

      {/* Categorised grid */}
      <RoadmapGrid roadmaps={roadmaps} />

    </div>
  );
}
