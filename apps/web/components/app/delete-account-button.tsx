"use client";

import { useState, useTransition } from "react";
import { deleteMyAccount } from "~/actions/profile";

export function DeleteAccountButton() {
  const [confirmed, setConfirmed] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    startTransition(async () => {
      await deleteMyAccount();
    });
  }

  return (
    <div className="space-y-3">
      {confirmed && (
        <p className="text-sm text-destructive font-medium">
          Are you sure? This will permanently delete your account and all data. Click again to confirm.
        </p>
      )}
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
          confirmed
            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            : "border border-destructive text-destructive hover:bg-destructive/10"
        }`}
      >
        {isPending ? "Deleting…" : confirmed ? "Yes, delete my account" : "Delete my account"}
      </button>
      {confirmed && (
        <button
          onClick={() => setConfirmed(false)}
          className="ml-2 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Cancel
        </button>
      )}
    </div>
  );
}

