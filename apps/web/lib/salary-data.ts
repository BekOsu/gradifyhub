type RegionalSalaryRange = {
  min: number;
  max: number;
  currency: string;
  period: "year";
  source: string;
};

type Region = "US" | "EU" | "AE" | "SA";

export const REGIONAL_SALARY_DATA: Record<string, Record<string, RegionalSalaryRange>> = {
  ai_ml_engineer: {
    US: {
      min: 120000,
      max: 200000,
      currency: "USD",
      period: "year",
      source: "LinkedIn Salary Insights 2026",
    },
    EU: {
      min: 90000,
      max: 160000,
      currency: "EUR",
      period: "year",
      source: "LinkedIn Salary Insights 2026",
    },
    AE: {
      min: 250000,
      max: 540000,
      currency: "AED",
      period: "year",
      source: "UAE Salary Market Data 2026 (Glassdoor, ERI, JobSeekers.ae)",
    },
    SA: {
      min: 140000,
      max: 230000,
      currency: "SAR",
      period: "year",
      source: "LinkedIn Salary Insights 2026",
    },
  },
};

export function detectRegion(timezone?: string): Region {
  if (!timezone) return "US";
  const tzLower = timezone.toLowerCase();
  if (tzLower.includes("london") || tzLower.includes("paris") || tzLower.includes("berlin") || tzLower.includes("europe")) return "EU";
  if (tzLower.includes("dubai") || tzLower.includes("abu") || tzLower.includes("uae")) return "AE";
  if (tzLower.includes("riyadh") || tzLower.includes("saudi")) return "SA";
  return "US";
}
