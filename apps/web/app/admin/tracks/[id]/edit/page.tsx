import Link from "next/link";
import { notFound } from "next/navigation";
import { getTracks } from "@repo/db/queries/tracks";
import { TrackForm } from "~/components/admin/track-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminTrackEditPage({ params }: Props) {
  const { id } = await params;
  const tracks = await getTracks();
  const track = tracks.find((t) => t.id === id);
  if (!track) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/tracks" className="text-sm text-muted-foreground hover:text-foreground">
          ← Tracks
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Edit — {track.label}</h1>
      </div>
      <TrackForm
        mode="edit"
        initial={{
          id: track.id,
          value: track.value,
          label: track.label,
          description: track.description,
          icon: track.icon,
          recommended: track.recommended,
          order: track.order,
          languages: (track.languages as string[]) ?? [],
          dimensions: (track.dimensions as { key: string; label: string }[]) ?? [],
        }}
      />
    </div>
  );
}
