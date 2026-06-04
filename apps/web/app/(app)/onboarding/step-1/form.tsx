"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveOnboardingStep2 } from "~/actions/profile";
import { assignStudentToGroup } from "~/actions/tutor";
import type { TrackMarketData } from "@repo/db/queries/tracks";

// ── Icon map ──────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ReactNode> = {
  brain: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
    </svg>
  ),
  server: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
    </svg>
  ),
  monitor: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
    </svg>
  ),
  layers: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
    </svg>
  ),
  smartphone: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>
    </svg>
  ),
  cloud: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>
    </svg>
  ),
  "bar-chart": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  "shield-check": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  code: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  "message-square": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  "book-open": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
};

function trackIcon(key: string): React.ReactNode {
  return ICON_MAP[key] ?? ICON_MAP["code"];
}

// ── Skill group matching ──────────────────────────────────────────────────

const TRACK_GROUP_KEYWORDS: Record<string, string[]> = {
  backend_engineer:    ["backend"],
  frontend_engineer:   ["frontend"],
  full_stack_engineer: ["full", "stack"],
  mobile_engineer:     ["mobile"],
  ai_ml_engineer:      ["ai", "ml", "machine"],
  data_analyst:        ["data"],
  devops_engineer:     ["devops", "dev ops"],
  qa_engineer:         ["qa", "quality"],
};

function findMatchingGroupId(trackValue: string, groups: SkillGroup[]): string | null {
  const keywords = TRACK_GROUP_KEYWORDS[trackValue] ?? [];
  const matched = groups.find((g) =>
    keywords.some((kw) => g.name.toLowerCase().includes(kw))
  );
  return matched?.id ?? groups[0]?.id ?? null;
}

// ── Legacy goal normalization ─────────────────────────────────────────────

const LEGACY_GOAL_MAP: Record<string, string> = {
  land_first_ai_role:       "ai_ml_engineer",
  ml_research_to_production:"ai_ml_engineer",
  software_to_ai:           "ai_ml_engineer",
  freelance_ai_engineer:    "ai_ml_engineer",
};

// ── Types ─────────────────────────────────────────────────────────────────

type SkillGroup = {
  id: string;
  name: string;
  approvalRequired: boolean;
  createdAt: Date;
};

type TrackItem = {
  value: string;
  label: string;
  description: string;
  icon: string;
  enabled: boolean;
  recommended: boolean;
  marketData: TrackMarketData | null;
};

// ── Condensed market stats ────────────────────────────────────────────────

function MarketStatsPanel({
  data,
  label,
  icon,
}: {
  data: TrackMarketData;
  label: string;
  icon: string;
}) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: data.salaryRange.currency,
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="rounded-2xl border border-brand-green/20 bg-brand-green/5 p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
          {trackIcon(icon)}
        </span>
        <p className="text-sm font-semibold text-brand-green">{label}</p>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          Salary range
        </p>
        <p className="text-2xl font-bold text-foreground leading-tight">
          {fmt(data.salaryRange.min)} – {fmt(data.salaryRange.max)}
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          per {data.salaryRange.period} · {data.salaryRange.source}
        </p>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
          Job titles
        </p>
        <div className="flex flex-wrap gap-1.5">
          {data.roleNames.slice(0, 3).map((r) => (
            <span
              key={r}
              className="rounded-full border border-brand-green/20 bg-background/70 px-2.5 py-0.5 text-[11px] font-medium text-foreground"
            >
              {r}
            </span>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{data.hiringContext}</p>
    </div>
  );
}

// ── Form ──────────────────────────────────────────────────────────────────

export function Step1Form({
  defaultGoal,
  editMode = false,
  skillGroups,
  tracks,
}: {
  defaultGoal: string | null;
  editMode?: boolean;
  skillGroups: SkillGroup[];
  tracks: TrackItem[];
}) {
  const router = useRouter();

  const trackValues = new Set(tracks.map((t) => t.value));
  const normalizedDefault =
    defaultGoal && trackValues.has(defaultGoal)
      ? defaultGoal
      : defaultGoal
      ? (LEGACY_GOAL_MAP[defaultGoal] ?? null)
      : null;

  const [selectedTrackValue, setSelectedTrackValue] = useState<string | null>(normalizedDefault);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTrack = tracks.find((t) => t.value === selectedTrackValue) ?? null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedTrackValue) {
      setError("Please choose your engineering track.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const result = await saveOnboardingStep2({ goal: selectedTrackValue });
      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }

      const skillGroupId = findMatchingGroupId(selectedTrackValue, skillGroups);
      if (skillGroupId) {
        try {
          await assignStudentToGroup(skillGroupId);
        } catch {
          // non-critical — group assignment failure shouldn't block progression
        }
      }

      router.push(editMode ? "/onboarding/step-2?edit=1" : "/onboarding/step-2");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">

      {/* ── Progress ── */}
      <div>
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">Step 1 of 3</span>
          <span className="font-semibold text-foreground">Your identity</span>
        </div>
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-0.5 w-1/3 rounded-full bg-brand-green transition-all duration-500" />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="lg:grid lg:grid-cols-5 lg:gap-16 lg:items-start">

          {/* ── LEFT: Declaration copy (desktop) ── */}
          <div className="lg:col-span-2 lg:sticky lg:top-8 flex flex-col gap-6">

            {/* Mobile: heading above cards */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Who are you becoming?
              </h1>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Choose your engineering track. Your roadmap, assessment, and lessons are
                built around this single choice.
              </p>
            </div>

            {/* Market stats — visible once a track is selected */}
            {selectedTrack?.marketData && (
              <MarketStatsPanel
                data={selectedTrack.marketData}
                label={selectedTrack.label}
                icon={selectedTrack.icon}
              />
            )}

            {!selectedTrack && (
              <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Select a track to see salary range, job titles, and what you&apos;ll learn.
                </p>
              </div>
            )}
          </div>

          {/* ── RIGHT: Track cards ── */}
          <div className="mt-8 lg:mt-0 lg:col-span-3 flex flex-col gap-3">

            {tracks.map((t) => {
              const isSelected = selectedTrackValue === t.value;
              const isDisabled = !t.enabled;
              return (
                <button
                  key={t.value}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (!isDisabled) setSelectedTrackValue(t.value);
                  }}
                  className={`relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-150 ${
                    isDisabled
                      ? "cursor-not-allowed border-border/40 bg-muted/20 opacity-50"
                      : isSelected
                      ? "border-brand-green/40 bg-brand-green/5 ring-1 ring-brand-green/30 shadow-sm"
                      : "border-border bg-card hover:border-brand-green/30 hover:bg-muted/30 hover:shadow-sm"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      isSelected && !isDisabled
                        ? "bg-brand-green/10 text-brand-green"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {trackIcon(t.icon)}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold leading-tight ${
                        isSelected && !isDisabled ? "text-brand-green" : "text-foreground"
                      }`}
                    >
                      {t.label}
                    </p>
                    <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                      {t.description}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {t.recommended && !isDisabled && !isSelected && (
                      <span className="rounded-full bg-brand-green/10 border border-brand-green/20 px-2.5 py-0.5 text-[10px] font-semibold text-brand-green">
                        Popular
                      </span>
                    )}
                    {isDisabled && (
                      <span className="rounded-full border border-border/40 bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Soon
                      </span>
                    )}
                    {isSelected && !isDisabled && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-green">
                        <svg
                          width="9"
                          height="9"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </div>
                </button>
              );
            })}

            {error && (
              <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-5">
              <Link
                href={editMode ? "/account/settings" : "/dashboard"}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                ← {editMode ? "Back to settings" : "Back to dashboard"}
              </Link>
              <button
                type="submit"
                disabled={loading || !selectedTrackValue}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-green/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-spin"
                      aria-hidden="true"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Saving…
                  </>
                ) : selectedTrack ? (
                  `I'm becoming an ${selectedTrack.label} →`
                ) : (
                  "Choose your track →"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
