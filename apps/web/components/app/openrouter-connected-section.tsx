"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { disconnectOpenRouterAction, updateBudgetAction } from "~/actions/openrouter";

function formatMicroUsd(microUsd: number): string {
  return `$${(microUsd / 1_000_000).toFixed(4)}`;
}

interface Props {
  currentBudgetCents: number | null;
  monthlySpendMicroUsd: number;
}

export function OpenRouterConnectedSection({ currentBudgetCents, monthlySpendMicroUsd }: Props) {
  const router = useRouter();
  const [isPendingDisconnect, startDisconnect] = useTransition();
  const [isPendingBudget, startBudget] = useTransition();
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [budgetInput, setBudgetInput] = useState(
    currentBudgetCents !== null ? String(currentBudgetCents / 100) : "",
  );
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [budgetSaved, setBudgetSaved] = useState(false);

  function handleDisconnect() {
    if (!confirmDisconnect) {
      setConfirmDisconnect(true);
      return;
    }
    startDisconnect(async () => {
      await disconnectOpenRouterAction();
      router.refresh();
    });
  }

  function handleBudgetSave() {
    setBudgetError(null);
    setBudgetSaved(false);

    const raw = budgetInput.trim();
    let budgetCents: number | null = null;

    if (raw !== "") {
      const dollars = parseFloat(raw);
      if (isNaN(dollars) || dollars < 0) {
        setBudgetError("Enter a valid dollar amount (e.g. 10.00) or leave blank for no cap.");
        return;
      }
      budgetCents = Math.round(dollars * 100);
    }

    startBudget(async () => {
      const result = await updateBudgetAction({ monthlyBudgetCents: budgetCents });
      if (result.success) {
        setBudgetSaved(true);
        setTimeout(() => setBudgetSaved(false), 3000);
      } else {
        setBudgetError(result.error ?? "Failed to save budget.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Budget control */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Monthly spend cap
        </label>
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="No cap"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="w-36 rounded-lg border bg-background pl-7 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={handleBudgetSave}
            disabled={isPendingBudget}
            className="rounded-full border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-50"
          >
            {isPendingBudget ? "Saving…" : budgetSaved ? "Saved" : "Save"}
          </button>
        </div>
        {budgetError && <p className="text-xs text-destructive">{budgetError}</p>}
        <p className="text-xs text-muted-foreground">
          Leave blank for no cap. Current month: {formatMicroUsd(monthlySpendMicroUsd)}
        </p>
      </div>

      {/* Disconnect */}
      <div className="space-y-2 border-t pt-4">
        {confirmDisconnect && (
          <p className="text-sm text-destructive font-medium">
            This removes your OpenRouter connection. LLM features will stop working until you
            reconnect or upgrade. Click again to confirm.
          </p>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDisconnect}
            disabled={isPendingDisconnect}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
              confirmDisconnect
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "border border-destructive text-destructive hover:bg-destructive/10"
            }`}
          >
            {isPendingDisconnect
              ? "Disconnecting…"
              : confirmDisconnect
              ? "Yes, disconnect"
              : "Disconnect"}
          </button>
          {confirmDisconnect && (
            <button
              onClick={() => setConfirmDisconnect(false)}
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
