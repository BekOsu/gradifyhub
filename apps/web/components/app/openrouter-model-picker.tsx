"use client";

import { useState, useTransition } from "react";
import { setModelPreferenceAction } from "~/actions/openrouter";
import { TASK_LABELS, TASK_DEFAULTS } from "~/lib/openrouter/models";

interface ModelOption {
  id: string;
  name: string;
}

interface ModelPickerRowProps {
  feature: string;
  currentModelId: string;
  models: ModelOption[];
}

function ModelPickerRow({ feature, currentModelId, models }: ModelPickerRowProps) {
  const [value, setValue] = useState(currentModelId);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const modelId = e.target.value;
    setValue(modelId);
    setSaved(false);
    setError(null);
    startTransition(async () => {
      const result = await setModelPreferenceAction({ feature, modelId });
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(result.error ?? "Failed to save.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <label className="text-sm font-medium">
        {TASK_LABELS[feature] ?? feature}
      </label>
      <div className="flex items-center gap-2">
        <select
          value={value}
          onChange={handleChange}
          disabled={isPending}
          className="rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 max-w-xs"
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}{TASK_DEFAULTS[feature] === m.id ? " (Recommended)" : ""}
            </option>
          ))}
        </select>
        {isPending && <span className="text-xs text-muted-foreground">Saving…</span>}
        {saved && <span className="text-xs text-green-600">Saved</span>}
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    </div>
  );
}

interface OpenRouterModelPickerProps {
  features: string[];
  currentPreferences: Record<string, string>;
  models: ModelOption[];
}

export function OpenRouterModelPicker({
  features,
  currentPreferences,
  models,
}: OpenRouterModelPickerProps) {
  if (models.length === 0) return null;

  return (
    <div className="space-y-4 border-t pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Per-feature model
      </p>
      <div className="space-y-3">
        {features.map((feature) => (
          <ModelPickerRow
            key={feature}
            feature={feature}
            currentModelId={currentPreferences[feature] ?? models[0]?.id ?? ""}
            models={models}
          />
        ))}
      </div>
    </div>
  );
}

