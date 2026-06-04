"use server";

import { checkEmailExists } from "~/lib/auth/auth";

export async function validateEmailNotRegistered(email: string): Promise<{ available: boolean; error?: string }> {
  if (!email) {
    return { available: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { available: false, error: "Invalid email format" };
  }

  const exists = await checkEmailExists(email);

  if (exists) {
    return {
      available: false,
      error: "Email already registered. Please sign in instead.",
    };
  }

  return { available: true };
}
