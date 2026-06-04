import { redirect } from "next/navigation";
import { ProcessingClient } from "./processing-client";

export default async function ProcessingPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string; cv?: "pdf" | "docx" | "text" }>;
}) {
  const { session, cv } = await searchParams;
  if (!session) redirect("/onboarding/interview-prep");
  return <ProcessingClient sessionId={session} cvExtractionSource={cv} />;
}
