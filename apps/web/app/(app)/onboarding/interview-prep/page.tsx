import { requireAuth } from "~/lib/auth/session";
import { InterviewPrepForm } from "./form";

export default async function InterviewPrepPage() {
  await requireAuth();
  return <InterviewPrepForm />;
}
