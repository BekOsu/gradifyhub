"use client";

import { Trash2 } from "lucide-react";
import { deleteWordAction } from "~/actions/english/vocab";

export function DeleteVocabButton({ userVocabId }: { userVocabId: string }) {
  const handleDelete = async () => {
    if (!confirm("Delete this word?")) return;
    await deleteWordAction(userVocabId);
  };

  return (
    <button
      onClick={handleDelete}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-700"
      title="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
