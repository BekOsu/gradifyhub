"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { phase, roadmap } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { getUserRoadmap } from "@repo/db/queries/roadmap";

const ProfileSignalsSchema = z.object({
  technicalLevel: z.enum(["beginner", "intermediate", "advanced", "expert"]).catch("intermediate"),
  cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).catch("B1"),
  workStyle: z.string().max(80).catch(""),
  roadmapHint: z.string().max(200).catch(""),
});

// ── HITL #1 — Confirm assessment profile ─────────────────────────────────
// Called from the results page. Persists user-confirmed signals to a cookie
// that /roadmap/generate reads when building the personalised roadmap.

export async function confirmAssessmentProfile(formData: FormData) {
  await requireAuth();

  const signals = ProfileSignalsSchema.parse({
    technicalLevel: String(formData.get("technicalLevel") ?? "").trim(),
    cefrLevel: String(formData.get("cefrLevel") ?? "").trim(),
    workStyle: String(formData.get("workStyle") ?? "").trim(),
    roadmapHint: String(formData.get("roadmapHint") ?? "").trim(),
  });

  const cookieStore = await cookies();
  cookieStore.set("profile_signals", JSON.stringify(signals), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours — consumed by /roadmap/generate
  });

  redirect("/roadmap/generate");
}

// ── HITL #2 — Confirm roadmap ────────────────────────────────────────────
// Called from the roadmap review banner. Removes phases the user already
// knows, then marks the roadmap as confirmed via cookie.

export async function confirmRoadmap(
  roadmapId: string,
  phaseIdsToRemove: string[]
) {
  const user = await requireAuth();

  const existing = await getUserRoadmap(user.id);
  if (!existing || existing.id !== roadmapId) {
    return { success: false, error: "Roadmap not found." };
  }

  if (phaseIdsToRemove.length > 0) {
    // Must keep at least one phase
    const remaining = existing.phases.filter(
      (p) => !phaseIdsToRemove.includes(p.id)
    );
    if (remaining.length === 0) {
      return { success: false, error: "Keep at least one phase." };
    }

    // Delete selected phases (skills cascade-delete via FK)
    for (const phaseId of phaseIdsToRemove) {
      await db.delete(phase).where(eq(phase.id, phaseId));
    }

    // Ensure the first remaining phase is active
    const firstRemaining = remaining[0];
    if (firstRemaining && firstRemaining.status !== "active") {
      await db
        .update(phase)
        .set({ status: "active" })
        .where(eq(phase.id, firstRemaining.id));
    }

    // Recalculate total weeks
    const newTotalWeeks = remaining.reduce((sum, p) => sum + p.weeks, 0);
    await db
      .update(roadmap)
      .set({ totalWeeks: newTotalWeeks })
      .where(eq(roadmap.id, roadmapId));
  }

  // Mark roadmap as confirmed so the banner doesn't re-appear
  const cookieStore = await cookies();
  cookieStore.set(`roadmap_confirmed_${roadmapId}`, "1", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return { success: true };
}
