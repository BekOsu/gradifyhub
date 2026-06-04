import Link from "next/link";
import { getTracks } from "@repo/db/queries/tracks";
import { TrackToggle } from "~/components/admin/track-toggle";
import { TrackDeleteButton } from "~/components/admin/track-delete-button";
import { RefreshMarketDataButton } from "~/components/admin/refresh-market-data-button";

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function AdminTracksPage() {
  const tracks = await getTracks();
  const enabledCount = tracks.filter((t) => t.enabled).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tracks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Disabled tracks show as &quot;Coming soon&quot; in the onboarding goal picker.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshMarketDataButton />
          <Link
            href="/admin/tracks/new"
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
          >
            + Add track
          </Link>
        </div>
      </div>

      <div className="rounded-xl border">
        <div className="border-b bg-muted/30 px-5 py-3">
          <p className="text-sm font-semibold">
            {enabledCount} of {tracks.length} tracks enabled
          </p>
        </div>

        {tracks.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            No tracks yet.{" "}
            <Link href="/admin/tracks/new" className="underline hover:text-foreground">
              Create the first one
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {tracks.map((track) => (
              <div key={track.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold truncate ${track.enabled ? "text-foreground" : "text-muted-foreground"}`}>
                      {track.label}
                    </p>
                    {track.recommended && (
                      <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">{track.description}</p>
                  {/* liveJobData status */}
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${track.liveJobData ? "bg-green-500" : "bg-muted-foreground/40"}`} />
                    <p className="text-[11px] text-muted-foreground">
                      {track.liveJobData
                        ? `${(track.liveJobData as { jobCount: number; companies: string[]; fetchedAt: string }).jobCount} jobs · ${(track.liveJobData as { jobCount: number; companies: string[]; fetchedAt: string }).companies.length} companies · refreshed ${formatRelativeTime((track.liveJobData as { fetchedAt: string }).fetchedAt)}`
                        : "No job data yet"}
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground/60 font-mono">{track.value}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!track.enabled && (
                    <span className="text-xs text-muted-foreground italic hidden sm:block">
                      Shows &quot;Coming soon&quot;
                    </span>
                  )}
                  <TrackToggle trackId={track.id} enabled={track.enabled} />
                  <Link
                    href={`/admin/tracks/${track.id}/edit`}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                  >
                    Edit
                  </Link>
                  <TrackDeleteButton trackId={track.id} trackLabel={track.label} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
