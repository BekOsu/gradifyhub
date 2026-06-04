import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Zap } from "lucide-react";
import { getCurrentUser } from "~/lib/auth/session";
import { getRoadmapCatalogBySlug, getUserNodeProgress } from "@repo/db/queries/roadmap-catalog";
import { RoadmapViewer } from "./roadmap-viewer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const roadmap = await getRoadmapCatalogBySlug(slug);
  if (!roadmap) return {};
  return {
    title: `${roadmap.title} Roadmap — GradifyHub`,
    description: roadmap.description ?? `Learn ${roadmap.title} step by step.`,
  };
}

export default async function RoadmapCatalogSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const user = await getCurrentUser();
  const roadmap = await getRoadmapCatalogBySlug(slug);
  if (!roadmap) notFound();

  const progressMap = user
    ? await getUserNodeProgress(user.id, roadmap.id)
    : new Map<string, "done" | "in-progress" | "skip">();

  const initialProgress = Object.fromEntries(progressMap) as Record<string, "done" | "in-progress" | "skip">;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{roadmap.title}</h1>
        {roadmap.description && (
          <p className="mt-1 text-sm text-muted-foreground">{roadmap.description}</p>
        )}
      </div>

      {/* ── Platform CTA bridge ───────────────────────────────────────────── */}
      {user ? (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-brand-green/30 bg-brand-green/5 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Zap className="h-4 w-4 shrink-0 text-brand-green" />
            <p className="text-sm text-muted-foreground">
              This is the full {roadmap.title} path.{" "}
              <span className="text-foreground font-medium">Your personalised roadmap skips what you already know.</span>
            </p>
          </div>
          <Link
            href="/roadmap"
            className="shrink-0 rounded-full bg-brand-green px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            My roadmap →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold">
              This is the full {roadmap.title} path — {roadmap.nodeCount} topics.
            </p>
            <p className="text-sm text-muted-foreground">
              Take the free assessment and we&apos;ll build you a personalised version that skips what you already know and targets your actual gaps.
            </p>
          </div>
          <Link
            href="/sign-up"
            className="shrink-0 inline-flex rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
          >
            Get my personalised path →
          </Link>
        </div>
      )}

      <RoadmapViewer
        roadmap={{ id: roadmap.id, slug: roadmap.slug, title: roadmap.title, description: roadmap.description, nodeCount: roadmap.nodeCount }}
        nodes={roadmap.nodes}
        initialProgress={initialProgress}
        isLoggedIn={!!user}
      />

    </div>
  );
}
