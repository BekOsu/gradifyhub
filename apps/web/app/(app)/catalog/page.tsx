import Link from "next/link";
import { requireAuth } from "~/lib/auth/session";
import { getRoadmapCatalogList } from "@repo/db/queries/roadmap-catalog";
import { BookOpen } from "lucide-react";

export default async function RoadmapCatalogPage() {
  await requireAuth();
  const roadmaps = await getRoadmapCatalogList();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roadmaps</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Structured learning paths for modern engineering roles.
            {roadmaps.length > 0 && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {roadmaps.length} roadmaps
              </span>
            )}
          </p>
        </div>
      </div>

      {roadmaps.length === 0 ? (
        <div className="rounded-xl border border-border bg-muted/20 p-10 text-center">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-medium">Roadmap catalog is being imported. Check back shortly.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roadmaps.map((roadmap) => (
            <Link
              key={roadmap.id}
              href={`/roadmaps/${roadmap.slug}`}
              className="group flex flex-col rounded-xl border p-5 transition-all hover:border-foreground/20 hover:shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-tight">{roadmap.title}</h3>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {roadmap.nodeCount} topics
                </span>
              </div>

              {roadmap.description && (
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {roadmap.description}
                </p>
              )}

              <div className="mt-auto flex items-center justify-between pt-4">
                <span className="text-xs font-medium text-primary transition-colors group-hover:text-primary/80">
                  View roadmap →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Roadmaps sourced from{" "}
        <a
          href="https://roadmap.sh"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-foreground"
        >
          roadmap.sh
        </a>{" "}
        (CC BY 4.0)
      </p>
    </div>
  );
}
