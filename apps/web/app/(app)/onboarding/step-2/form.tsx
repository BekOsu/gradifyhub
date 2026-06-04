"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveOnboardingStep1, saveOnboardingStep2 } from "~/actions/profile";
import { YEARS_OF_EXPERIENCE } from "@repo/contracts/profile";
import { getGoalLabel } from "~/lib/journey/goals";

// ── Background categories ─────────────────────────────────────────────────

const ROLE_SEP = " – ";

const ROLE_CATEGORIES = [
  {
    value: "Student",
    label: "Student",
    sublabel: "University, bootcamp, or self-taught",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
  },
  {
    value: "Software developer",
    label: "Developer",
    sublabel: "Web, mobile, backend, or full-stack",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
  },
  {
    value: "IT administrator",
    label: "IT / Operations",
    sublabel: "SysAdmin, DevOps, networking, infra",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
        <circle cx="12" cy="10" r="2"/>
      </svg>
    ),
  },
  {
    value: "Data analyst",
    label: "Data / Analytics",
    sublabel: "SQL, BI, data science, ML research",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    value: "Product designer",
    label: "Design / Product",
    sublabel: "UI/UX, product management, research",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/>
        <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.47-1.125"/>
        <path d="M22 12c0-5.523-4.477-10-10-10"/>
      </svg>
    ),
  },
  {
    value: "Career changer",
    label: "Career changer",
    sublabel: "Moving into tech from another industry",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
      </svg>
    ),
  },
  {
    value: "Researcher",
    label: "Research / Academia",
    sublabel: "PhD student, postdoc, professor, lab researcher",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/>
        <path d="M5.58 16.5h12.85"/>
      </svg>
    ),
  },
  {
    value: "Business professional",
    label: "Business / Finance",
    sublabel: "Finance, consulting, strategy, operations",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
  },
  {
    value: "Other background",
    label: "Other",
    sublabel: "Doesn't fit any of the above",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>
      </svg>
    ),
  },
] as const;

type RoleCategoryValue = (typeof ROLE_CATEGORIES)[number]["value"];

const STUDENT_YEARS = [
  { value: "1st year", label: "1st year" },
  { value: "2nd year", label: "2nd year" },
  { value: "3rd year", label: "3rd year" },
  { value: "4th year", label: "4th year" },
  { value: "5th+ year", label: "5th + year" },
  { value: "Just graduated", label: "Just graduated" },
] as const;

const STUDENT_FIELDS = [
  { value: "Computer Science", label: "Computer Science" },
  { value: "Information Technology", label: "IT / Systems" },
  { value: "Engineering", label: "Engineering" },
  { value: "Math / Physics", label: "Math / Physics" },
  { value: "Business", label: "Business" },
  { value: "Other field", label: "Other" },
] as const;

const WORK_SITUATIONS = [
  { value: "Employed full-time", label: "Full-time" },
  { value: "Part-time or freelance", label: "Part-time / freelance" },
  { value: "Looking for work", label: "Looking for work" },
  { value: "Taking a break", label: "Taking a break" },
] as const;

// ── Pace tiers ────────────────────────────────────────────────────────────

const TIERS = [
  { id: "casual",    label: "Casual",    sub: "~1 hr / day",  detail: "At your own pace", hoursPerDay: "1", daysPerWeek: "5" },
  { id: "regular",   label: "Regular",   sub: "~2 hrs / day", detail: "Steady progress",  hoursPerDay: "2", daysPerWeek: "5" },
  { id: "intensive", label: "Intensive", sub: "~4 hrs / day", detail: "Fast-track",        hoursPerDay: "4", daysPerWeek: "5" },
  { id: "bootcamp",  label: "Bootcamp",  sub: "~7 hrs / day", detail: "Full commitment",   hoursPerDay: "7", daysPerWeek: "5" },
] as const;

type TierId = (typeof TIERS)[number]["id"];

const BASE_WEEKS: Record<TierId, number>  = { casual: 16, regular: 10, intensive: 7, bootcamp: 6 };
const EXP_MODIFIER: Record<string, number> = { "<1": 1.3, "1-3": 1.0, "3-5": 0.85, "5-10": 0.7, "10+": 0.6 };

function computeWeeks(tierId: TierId, yearsOfExp: string): number {
  return Math.max(6, Math.min(20, Math.round(BASE_WEEKS[tierId] * (EXP_MODIFIER[yearsOfExp] ?? 1.0))));
}

const TIMELINE_WEEKS: [string, number][] = [
  ["2 weeks", 2], ["4 weeks", 4], ["6 weeks", 6],
  ["2 months", 8.6], ["3 months", 12.9], ["4 months", 17.1],
  ["6 months", 25.7], ["9 months", 38.6], ["12 months", 52.1], ["18 months", 78.3],
];

function closestTimeline(weeks: number): string {
  let best = TIMELINE_WEEKS[0]![0];
  let bestDiff = Math.abs(TIMELINE_WEEKS[0]![1] - weeks);
  for (const [label, w] of TIMELINE_WEEKS) {
    const diff = Math.abs(w - weeks);
    if (diff < bestDiff) { best = label; bestDiff = diff; }
  }
  return best;
}

function addWeeks(weeks: number): Date {
  return new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function detectTier(hoursPerDay: string, daysPerWeek: string): TierId | null {
  return (TIERS.find((t) => t.hoursPerDay === hoursPerDay && t.daysPerWeek === daysPerWeek)?.id as TierId) ?? null;
}

function detectCategory(currentRole: string): RoleCategoryValue | null {
  const first = currentRole.split(ROLE_SEP)[0]?.toLowerCase() ?? "";
  return ROLE_CATEGORIES.find((c) => first === c.value.toLowerCase())?.value ?? null;
}

function detectStudentStatus(currentRole: string): string | null {
  if (!currentRole.toLowerCase().startsWith("student")) return null;
  return currentRole.split(ROLE_SEP)[1] ?? null;
}

function detectStudentField(currentRole: string): string | null {
  if (!currentRole.toLowerCase().startsWith("student")) return null;
  return currentRole.split(ROLE_SEP)[2] ?? null;
}

function detectWorkSituation(currentRole: string): string | null {
  const cat = detectCategory(currentRole);
  if (!cat || cat === "Student" || cat === "Other background") return null;
  const val = currentRole.split(ROLE_SEP)[1] ?? null;
  const known = ["Employed full-time", "Part-time or freelance", "Looking for work", "Taking a break"];
  return val && known.includes(val) ? val : null;
}

function detectOtherDescription(currentRole: string): string {
  if (!currentRole.toLowerCase().startsWith("other background")) return "";
  return currentRole.split(ROLE_SEP)[1] ?? "";
}

// ── Language suggestions per goal track ───────────────────────────────────

const TRACK_LANGUAGES: Record<string, string[]> = {
  ai_ml_engineer:      ["Python", "TypeScript", "JavaScript", "Java", "Go", "R", "SQL", "Julia", "Bash"],
  ml_engineer:         ["Python", "Julia", "R", "SQL", "Bash"],
  backend_engineer:    ["Python", "TypeScript", "Java", "Go", "Rust", "PHP", "Ruby", "C#"],
  frontend_engineer:   ["TypeScript", "JavaScript", "Dart"],
  full_stack_engineer: ["TypeScript", "JavaScript", "Python", "Java", "Go"],
  mobile_engineer:     ["Swift", "Kotlin", "Dart", "TypeScript"],
  data_analyst:        ["Python", "R", "SQL", "Julia", "Bash"],
  devops_engineer:     ["Python", "Go", "Bash", "TypeScript"],
  qa_engineer:         ["Python", "TypeScript", "JavaScript", "Java"],
};

const DEFAULT_LANGUAGES = ["Python", "TypeScript", "JavaScript", "Java", "Go", "SQL", "Bash"];

const LANGUAGE_DESCRIPTIONS: Record<string, string> = {
  Python:     "General-purpose, widely used for AI/ML, data, and backend",
  TypeScript: "JavaScript with type safety — preferred for large codebases",
  JavaScript: "Browser and Node.js runtime — essential for frontend",
  Java:       "Enterprise-grade, strongly typed — used in large systems",
  Go:         "Fast, compiled language — ideal for microservices and DevOps",
  PHP:        "Server-side scripting language — powers web servers",
  Ruby:       "Expressive, dynamic language — great for rapid development",
  "C#":       "Enterprise .NET language — Windows and cloud applications",
  Rust:       "Systems language with memory safety — high performance",
  Swift:      "Apple's language — iOS, macOS, and Apple platform development",
  Kotlin:     "Modern JVM language — official Android development language",
  Dart:       "Google's language — Flutter cross-platform app development",
  Julia:      "High-performance language — scientific computing and ML",
  R:          "Statistical computing language — data science and analysis",
  SQL:        "Database query language — essential for data management",
  Bash:       "Shell scripting — automation and DevOps operations",
};

// ── AI calibration ────────────────────────────────────────────────────────

const EXPERIENCE_FLAGS: {
  key: keyof Pick<AiCalibrationState, "calledLlmApi" | "builtRag" | "builtAgents" | "shippedToProduction">;
  label: string;
  description: string;
}[] = [
  { key: "calledLlmApi",        label: "Called an LLM API",        description: "OpenAI, Anthropic, etc." },
  { key: "builtRag",            label: "Built a RAG system",        description: "With embeddings + retrieval" },
  { key: "builtAgents",         label: "Built an AI agent",         description: "Tool use, planning, memory" },
  { key: "shippedToProduction", label: "Shipped AI to production",  description: "Real users, not just local" },
];

const INTENT_OPTIONS = [
  { value: "get_hired",     label: "Land an AI engineering job" },
  { value: "freelance",     label: "Get freelance AI clients" },
  { value: "build_product", label: "Build my own AI product" },
  { value: "upskill",       label: "Level up at my current company" },
];

const PAIN_POINT_OPTIONS = [
  { value: "dont_know_where_to_start", label: "Don't know where to start" },
  { value: "too_theoretical",          label: "Too much theory, not enough hands-on" },
  { value: "need_portfolio",           label: "Need portfolio projects to show employers" },
  { value: "stuck_on_agents",          label: "Know the basics but stuck on agents and production" },
];

type AiCalibrationState = {
  calledLlmApi: boolean;
  builtRag: boolean;
  builtAgents: boolean;
  shippedToProduction: boolean;
  intent: string;
  painPoint: string;
};

function AiCalibrationSection({
  state,
  onChange,
}: {
  state: AiCalibrationState;
  onChange: (patch: Partial<AiCalibrationState>) => void;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 flex flex-col gap-4">
      <div>
        <p className="text-sm font-semibold text-foreground">Calibrate your AI level</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Optional — helps sharpen your assessment and roadmap.</p>
      </div>

      <div>
        <p className="text-xs font-medium text-foreground mb-2">What have you already built?</p>
        <div className="grid grid-cols-2 gap-2">
          {EXPERIENCE_FLAGS.map((f) => {
            const active = state[f.key];
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => onChange({ [f.key]: !active })}
                className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all duration-150 ${
                  active
                    ? "border-brand-green/40 bg-brand-green/5 ring-1 ring-brand-green/30"
                    : "border-border bg-background hover:border-border/80 hover:bg-muted/40"
                }`}
              >
                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                  active ? "border-brand-green bg-brand-green" : "border-input bg-background"
                }`}>
                  {active && (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </span>
                <div>
                  <p className="text-xs font-medium text-foreground leading-tight">{f.label}</p>
                  <p className="text-[10px] text-muted-foreground">{f.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-foreground mb-2">What&apos;s your main goal?</p>
        <div className="grid grid-cols-2 gap-2">
          {INTENT_OPTIONS.map((opt) => {
            const active = state.intent === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ intent: active ? "" : opt.value })}
                className={`rounded-xl border px-3 py-2.5 text-left text-xs transition-all duration-150 ${
                  active
                    ? "border-brand-green/40 bg-brand-green/5 font-medium text-brand-green ring-1 ring-brand-green/30"
                    : "border-border bg-background text-foreground hover:border-border/80 hover:bg-muted/40"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-foreground mb-2">What&apos;s blocking you most right now?</p>
        <div className="flex flex-col gap-2">
          {PAIN_POINT_OPTIONS.map((opt) => {
            const active = state.painPoint === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ painPoint: active ? "" : opt.value })}
                className={`rounded-xl border px-3 py-2.5 text-left text-xs transition-all duration-150 ${
                  active
                    ? "border-brand-green/40 bg-brand-green/5 font-medium text-brand-green ring-1 ring-brand-green/30"
                    : "border-border bg-background text-foreground hover:border-border/80 hover:bg-muted/40"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Shared pill button ────────────────────────────────────────────────────

function PillButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-150 ${
        selected
          ? "border-brand-green/50 bg-brand-green/10 text-brand-green shadow-sm"
          : "border-border bg-background text-foreground hover:border-border/80 hover:bg-muted/60"
      }`}
    >
      {selected && (
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      )}
      {children}
    </button>
  );
}

// ── Language chip ─────────────────────────────────────────────────────────

function LangChip({
  label,
  selected,
  onClick,
  description,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  description?: string;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-150 ${
          selected
            ? "border-brand-green/40 bg-brand-green/10 text-brand-green shadow-sm"
            : "border-border bg-background text-foreground hover:border-border/80 hover:bg-muted/60"
        }`}
      >
        {selected && (
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
        {label}
      </button>
      {description && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
          <div className="whitespace-nowrap bg-foreground text-background rounded-md px-3 py-2 text-[11px] font-medium shadow-lg border border-foreground/10">
            {description}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 h-1.5 w-1.5 bg-foreground" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
        </div>
      )}
    </div>
  );
}

// ── Default values type ───────────────────────────────────────────────────

type DefaultValues = {
  currentRole: string;
  yearsOfExperience: string;
  targetTimeline: string;
  hoursPerDay: string;
  daysPerWeek: string;
} | null;

// ── Form ──────────────────────────────────────────────────────────────────

export function Step2Form({
  defaultValues,
  defaultGoal,
  defaultKnownStack,
  defaultAiCalibration,
  editMode = false,
}: {
  defaultValues: DefaultValues;
  defaultGoal: string | null;
  defaultKnownStack?: { languages: string[]; frameworks: string[]; custom?: string } | null;
  defaultAiCalibration?: AiCalibrationState | null;
  editMode?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Background state
  const [roleCategory, setRoleCategory] = useState<RoleCategoryValue | null>(
    defaultValues?.currentRole ? detectCategory(defaultValues.currentRole) : null,
  );
  const [studentStatus, setStudentStatus] = useState<string | null>(
    defaultValues?.currentRole ? detectStudentStatus(defaultValues.currentRole) : null,
  );
  const [studentField, setStudentField] = useState<string | null>(
    defaultValues?.currentRole ? detectStudentField(defaultValues.currentRole) : null,
  );
  const [workSituation, setWorkSituation] = useState<string | null>(
    defaultValues?.currentRole ? detectWorkSituation(defaultValues.currentRole) : null,
  );
  const [otherDescription, setOtherDescription] = useState(
    defaultValues?.currentRole ? detectOtherDescription(defaultValues.currentRole) : "",
  );

  // Experience + pace state
  const [yearsOfExp, setYearsOfExp] = useState(defaultValues?.yearsOfExperience ?? "");
  const [tierId, setTierId] = useState<TierId | null>(
    defaultValues ? detectTier(defaultValues.hoursPerDay, defaultValues.daysPerWeek) : null,
  );

  // Language state
  const goalKey = defaultGoal ?? "";
  const suggestedLanguages = TRACK_LANGUAGES[goalKey] ?? DEFAULT_LANGUAGES;
  const [languages, setLanguages] = useState<string[]>(defaultKnownStack?.languages ?? []);
  const [customLang, setCustomLang] = useState("");
  const [extraLanguages, setExtraLanguages] = useState<string[]>([]);

  // AI calibration state
  const isAiTrack = defaultGoal === "ai_ml_engineer" || defaultGoal === "ml_engineer";
  const [aiCalib, setAiCalib] = useState<AiCalibrationState>({
    calledLlmApi:        defaultAiCalibration?.calledLlmApi        ?? false,
    builtRag:            defaultAiCalibration?.builtRag            ?? false,
    builtAgents:         defaultAiCalibration?.builtAgents         ?? false,
    shippedToProduction: defaultAiCalibration?.shippedToProduction ?? false,
    intent:              defaultAiCalibration?.intent              ?? "",
    painPoint:           defaultAiCalibration?.painPoint           ?? "",
  });

  const tier = TIERS.find((t) => t.id === tierId) ?? null;

  // Build the encoded role string
  let effectiveRole = "";
  if (roleCategory === "Student") {
    effectiveRole = ["Student", studentStatus, studentField].filter(Boolean).join(ROLE_SEP);
  } else if (roleCategory === "Other background") {
    effectiveRole = ["Other background", otherDescription.trim() || null].filter(Boolean).join(ROLE_SEP);
  } else if (roleCategory) {
    effectiveRole = [roleCategory, workSituation].filter(Boolean).join(ROLE_SEP);
  }

  const allSuggestedLangs = [...suggestedLanguages, ...extraLanguages.filter(l => !suggestedLanguages.includes(l))];

  const canSubmit =
    !!roleCategory &&
    (roleCategory !== "Student" || !!studentStatus) &&
    !!yearsOfExp &&
    !!tierId;

  function addCustomLang(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const val = customLang.trim();
    if (!val) return;
    if (!allSuggestedLangs.includes(val)) setExtraLanguages((p) => [...p, val]);
    if (!languages.includes(val)) setLanguages((p) => [...p, val]);
    setCustomLang("");
  }

  const goalLabel = getGoalLabel(defaultGoal);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!roleCategory)  { setError("Please select your background."); return; }
    if (roleCategory === "Student" && !studentStatus) { setError("Please select what year you're in."); return; }
    if (!yearsOfExp)    { setError("Please select your years of experience."); return; }
    if (!tier)          { setError("Please select a study pace."); return; }
    setError(null);
    setLoading(true);

    try {
      const weeks = computeWeeks(tier.id, yearsOfExp);
      const result1 = await saveOnboardingStep1({
        currentRole: effectiveRole,
        yearsOfExperience: yearsOfExp,
        targetTimeline: closestTimeline(weeks),
        hoursPerDay: tier.hoursPerDay,
        daysPerWeek: tier.daysPerWeek,
      });

      if (!result1.success) {
        setError(result1.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }

      // Save languages and AI calibration if there's anything to persist
      const calibrationFilled =
        isAiTrack &&
        (aiCalib.calledLlmApi || aiCalib.builtRag || aiCalib.builtAgents ||
          aiCalib.shippedToProduction || aiCalib.intent || aiCalib.painPoint);

      if (defaultGoal && (languages.length > 0 || calibrationFilled)) {
        const result2 = await saveOnboardingStep2({
          goal: defaultGoal,
          knownStack: { languages, frameworks: [], custom: undefined },
          ...(calibrationFilled
            ? {
                aiCalibration: {
                  calledLlmApi:        aiCalib.calledLlmApi,
                  builtRag:            aiCalib.builtRag,
                  builtAgents:         aiCalib.builtAgents,
                  shippedToProduction: aiCalib.shippedToProduction,
                  intent:              (aiCalib.intent || "upskill") as "get_hired" | "freelance" | "build_product" | "upskill",
                  painPoint:           (aiCalib.painPoint || "dont_know_where_to_start") as "dont_know_where_to_start" | "too_theoretical" | "need_portfolio" | "stuck_on_agents",
                },
              }
            : {}),
        });

        if (!result2.success) {
          setError(result2.error ?? "Something went wrong.");
          setLoading(false);
          return;
        }
      }

      router.push(editMode ? "/onboarding/step-3?edit=1" : "/onboarding/step-3");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">

      {/* ── Header ── */}
      <div>
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">Step 2 of 3</span>
          <span className="font-semibold text-foreground">Your background</span>
        </div>
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-0.5 w-2/3 rounded-full bg-brand-green transition-all duration-500" />
        </div>
        <h1 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
          {editMode
            ? "Update your background"
            : `Calibrating your ${goalLabel} roadmap`}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
          {editMode
            ? "Update your background so your assessment and roadmap stay calibrated."
            : "Tell us where you're coming from. We'll skip what you already know and build from your actual gaps."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-9">

        {/* ── Section 1: Background ── */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">What best describes your background?</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Shapes how your assessment results are interpreted and what your roadmap prioritises.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ROLE_CATEGORIES.map((cat) => {
              const isSelected = roleCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => {
                    setRoleCategory(cat.value);
                    setStudentStatus(null);
                    setStudentField(null);
                    setWorkSituation(null);
                    setOtherDescription("");
                  }}
                  className={`relative flex flex-col gap-2.5 rounded-2xl border p-3.5 text-left transition-all duration-150 ${
                    isSelected
                      ? "border-brand-green/40 bg-brand-green/5 ring-1 ring-brand-green/30 shadow-sm"
                      : "border-border bg-card hover:border-border/80 hover:bg-muted/40 hover:shadow-sm"
                  }`}
                >
                  {isSelected && (
                    <span className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-green">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </span>
                  )}
                  <span className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                    isSelected ? "bg-brand-green/10 text-brand-green" : "bg-muted text-muted-foreground"
                  }`}>
                    {cat.icon}
                  </span>
                  <div>
                    <p className={`text-sm font-semibold leading-tight ${isSelected ? "text-brand-green" : "text-foreground"}`}>
                      {cat.label}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{cat.sublabel}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sub-questions */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
            roleCategory ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}>
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              {roleCategory === "Student" ? (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold text-foreground">
                      Where are you in your studies?{" "}
                      <span className="font-normal text-destructive text-[10px]">required</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {STUDENT_YEARS.map((y) => (
                        <PillButton
                          key={y.value}
                          selected={studentStatus === y.value}
                          onClick={() => setStudentStatus(studentStatus === y.value ? null : y.value)}
                        >
                          {y.label}
                        </PillButton>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold text-foreground">
                      What&apos;s your field?{" "}
                      <span className="font-normal text-muted-foreground text-[10px]">optional</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {STUDENT_FIELDS.map((f) => (
                        <PillButton
                          key={f.value}
                          selected={studentField === f.value}
                          onClick={() => setStudentField(studentField === f.value ? null : f.value)}
                        >
                          {f.label}
                        </PillButton>
                      ))}
                    </div>
                  </div>
                </div>
              ) : roleCategory === "Other background" ? (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold text-foreground">
                    Briefly describe your background{" "}
                    <span className="font-normal text-muted-foreground text-[10px]">optional</span>
                  </p>
                  <input
                    type="text"
                    value={otherDescription}
                    onChange={(e) => setOtherDescription(e.target.value)}
                    maxLength={60}
                    placeholder="e.g. journalist, legal professional, real estate agent…"
                    className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold text-foreground">
                    What&apos;s your current situation?{" "}
                    <span className="font-normal text-muted-foreground text-[10px]">optional</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {WORK_SITUATIONS.map((s) => (
                      <PillButton
                        key={s.value}
                        selected={workSituation === s.value}
                        onClick={() => setWorkSituation(workSituation === s.value ? null : s.value)}
                      >
                        {s.label}
                      </PillButton>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Section 2: Years of experience ── */}
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Years of experience in tech</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Used to calibrate roadmap difficulty — more experience means less beginner content.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {YEARS_OF_EXPERIENCE.map((v) => {
              const isSelected = yearsOfExp === v;
              const label = v === "<1" ? "< 1 year" : v === "10+" ? "10+ years" : `${v} years`;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setYearsOfExp(v)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-150 ${
                    isSelected
                      ? "border-brand-green/40 bg-brand-green/10 text-brand-green shadow-sm"
                      : "border-border bg-background text-foreground hover:border-border/80 hover:bg-muted/60"
                  }`}
                >
                  {isSelected && (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Section 3: Study pace ── */}
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">How much time can you commit?</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Sets your target timeline.{!yearsOfExp && " Select experience above to see your ready-by date."}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {TIERS.map((t) => {
              const isSelected = tierId === t.id;
              const weeks = yearsOfExp ? computeWeeks(t.id, yearsOfExp) : null;
              const readyDate = weeks ? formatDate(addWeeks(weeks)) : null;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTierId(t.id)}
                  className={`flex flex-col gap-1.5 rounded-2xl border p-4 text-left transition-all duration-150 ${
                    isSelected
                      ? "border-brand-green/40 bg-brand-green/5 ring-1 ring-brand-green/30 shadow-sm"
                      : "border-border bg-card hover:border-border/80 hover:bg-muted/40 hover:shadow-sm"
                  }`}
                >
                  <p className={`text-sm font-bold ${isSelected ? "text-brand-green" : "text-foreground"}`}>{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.sub}</p>
                  <p className={`text-[11px] ${isSelected ? "text-brand-green/70" : "text-muted-foreground/60"}`}>{t.detail}</p>
                  <div className="mt-2 border-t border-border/50 pt-2">
                    {readyDate ? (
                      <p className={`text-[11px] font-semibold ${isSelected ? "text-brand-green" : "text-muted-foreground"}`}>
                        Ready {readyDate}
                      </p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground/30">—</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Section 4: Languages ── */}
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Languages you already know</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Optional — we&apos;ll skip beginner content for these and focus on advanced use.
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
            <div className="flex flex-wrap gap-2">
              {allSuggestedLangs.map((lang) => (
                <LangChip
                  key={lang}
                  label={lang}
                  selected={languages.includes(lang)}
                  onClick={() =>
                    setLanguages((prev) =>
                      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
                    )
                  }
                  description={LANGUAGE_DESCRIPTIONS[lang]}
                />
              ))}
              <input
                type="text"
                value={customLang}
                onChange={(e) => setCustomLang(e.target.value)}
                onKeyDown={addCustomLang}
                placeholder="+ Add language"
                className="rounded-full border border-dashed border-border bg-background px-3 py-1.5 text-xs text-muted-foreground outline-none placeholder:text-muted-foreground/60 focus:border-brand-green focus:text-foreground"
              />
            </div>
            {languages.length === 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                Nothing selected — that&apos;s fine. We&apos;ll start from the fundamentals.
              </p>
            )}
          </div>
        </div>

        {/* ── Section 5: AI calibration (AI track only) ── */}
        {isAiTrack && (
          <AiCalibrationSection
            state={aiCalib}
            onChange={(patch) => setAiCalib((prev) => ({ ...prev, ...patch }))}
          />
        )}

        {error && (
          <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between border-t border-border/60 pt-5">
          <Link
            href={editMode ? "/onboarding/step-1?edit=1" : "/onboarding/step-1"}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back
          </Link>
          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-green/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" aria-hidden="true">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Saving…
              </>
            ) : (
              <>{editMode ? "Save and continue" : "Continue"} →</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
