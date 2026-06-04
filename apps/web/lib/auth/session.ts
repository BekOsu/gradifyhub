import { auth } from "./auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user ?? null;
}

// Safe version for marketing/public pages — never throws, returns null on any error
export async function getOptionalUser() {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}