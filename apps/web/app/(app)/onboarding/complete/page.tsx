"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { completeOnboarding } from "~/actions/profile";

export default function OnboardingCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editMode = searchParams.get("edit") === "1";
  const [message, setMessage] = useState(
    editMode ? "Saving your updated preferences and checking your roadmap…" : "Setting up your account…"
  );

  useEffect(() => {
    completeOnboarding().then((result) => {
      if (result && !result.success) {
        router.push(editMode ? "/onboarding/step-1?edit=1" : "/onboarding/step-1");
      } else {
        if (editMode && result?.assessmentNeedsRefresh) {
          setMessage("Preferences updated — please run a fresh diagnostic so we can generate an accurate new roadmap.");
          setTimeout(() => {
            router.push("/assessment?refresh=preferences");
          }, 150);
          return;
        }

        if (editMode && result?.roadmapNeedsRefresh) {
          setMessage("Preferences updated — generating a fresh roadmap for your new track, timeline, and study pace…");
          setTimeout(() => {
            router.push("/roadmap/generate?refresh=preferences");
          }, 150);
          return;
        }

        router.push(editMode ? "/settings?updated=preferences" : "/assessment/foundation-check");
      }
    });
  }, [editMode, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="max-w-md text-center text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
