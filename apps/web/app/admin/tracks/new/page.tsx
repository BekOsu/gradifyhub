import Link from "next/link";
import { TrackForm } from "~/components/admin/track-form";

export default function AdminTrackNewPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/tracks" className="text-sm text-muted-foreground hover:text-foreground">
          ← Tracks
        </Link>
        <h1 className="mt-2 text-2xl font-bold">New track</h1>
      </div>
      <TrackForm mode="create" />
    </div>
  );
}
