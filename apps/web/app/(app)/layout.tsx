import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { AppSidebar } from "~/components/app/sidebar";
import { JourneyStepperBand } from "~/components/app/journey-stepper-band";
import { getCurrentUser } from "~/lib/auth/session";
import { db } from "@repo/db/client";
import { subscription, streak, profile } from "@repo/db/schema";
import { eq } from "@repo/db/drizzle";
import { seedSkillGroups } from "~/lib/seed/skill-groups";
import { getJourneyUnlocks } from "~/lib/journey/unlocks";
import { getGoalLabel, goalToTrackSlug } from "~/lib/journey/goals";
import { AppLayoutWrapper } from "./app-layout-wrapper";

function toSidebarPlan(plan: string | null | undefined): "free" | "pro" {
  if (plan === "pro") return plan;
  return "free";
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isOnboarding = pathname.startsWith("/onboarding");

  // Onboarding gets a clean full-screen canvas — no sidebar, no journey band.
  if (isOnboarding) {
    return <>{children}</>;
  }

  // Fast early-exit: no cookie → definitely not onboarded.
  const cookieStore = await cookies();
  if (cookieStore.get("onboarded")?.value !== "1") {
    redirect("/onboarding/step-1");
  }

  await seedSkillGroups().catch((e) => console.error("seedSkillGroups failed", e));

  const [userSub, userStreak, journeyUnlocks, userProfile] = await Promise.all([
    db.query.subscription.findFirst({ where: eq(subscription.userId, user.id) }),
    db.query.streak.findFirst({ where: eq(streak.userId, user.id) }),
    getJourneyUnlocks(user.id),
    db.query.profile.findFirst({
      where: eq(profile.userId, user.id),
      columns: { goal: true, onboardedAt: true },
    }),
  ]);

  // DB-level gate: cookie can be stale (old session, manual set, etc.).
  // onboardedAt is the canonical source of truth for completed onboarding.
  // If the DB says not onboarded, clear the cookie before redirecting so
  // middleware doesn't immediately bounce the user back to /dashboard.
  if (!userProfile?.onboardedAt) {
    redirect("/api/reset-onboarding");
  }

  const goalTrack = userProfile.goal ? getGoalLabel(userProfile.goal) : undefined;
  const primaryTrackSlug = goalToTrackSlug(userProfile.goal) ?? undefined;

  return (
    <AppLayoutWrapper>
      <div className="flex min-h-screen">
        <AppSidebar
          user={{ name: user.name ?? null, email: user.email, image: user.image ?? null }}
          plan={toSidebarPlan(userSub?.plan)}
          streakDays={userStreak?.currentStreak ?? 0}
          userRole={user.role}
          journeyUnlocks={journeyUnlocks}
          goalTrack={goalTrack}
          primaryTrackSlug={primaryTrackSlug}
        />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-5xl">
            <JourneyStepperBand unlocks={journeyUnlocks} />
            {children}
          </div>
        </main>
      </div>
    </AppLayoutWrapper>
  );
}