export type IdentityLevel = "Beginner" | "Intermediate" | "Advanced";

export function scoreToIdentityLevel(avgScore: number): IdentityLevel {
  if (avgScore <= 40) return "Beginner";
  if (avgScore <= 70) return "Intermediate";
  return "Advanced";
}
