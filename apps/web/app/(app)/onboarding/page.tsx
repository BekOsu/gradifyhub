import { redirect } from "next/navigation";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  redirect(edit === "1" ? "/onboarding/step-1?edit=1" : "/onboarding/step-1");
}
