"use client";

import { createAuthClient } from "better-auth/react";

const configuredBaseURL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || undefined;

function resolveAuthClientBaseURL() {
  if (typeof window === "undefined") return configuredBaseURL;
  if (!configuredBaseURL) return undefined;

  try {
    const configured = new URL(configuredBaseURL);
    // In browser, only use explicit baseURL when it matches current origin.
    // Otherwise fall back to same-origin to avoid preview<->prod CORS issues.
    return configured.origin === window.location.origin ? configured.origin : undefined;
  } catch {
    return undefined;
  }
}

const authClientBaseURL = resolveAuthClientBaseURL();

type AuthResponse = { error: { message: string; code?: string } | null };

// Destructure immediately so TypeScript doesn't need to name the complex client type.
const {
  signIn,
  signUp,
  signOut,
  useSession,
  sendVerificationEmail,
  requestPasswordReset,
  resetPassword,
  updateUser: _updateUser,
  changePassword: _changePassword,
} = createAuthClient({
  baseURL: authClientBaseURL,
});

export { signIn, signUp, signOut, useSession, sendVerificationEmail, requestPasswordReset, resetPassword };

// Explicit types to avoid TS2742: Better Auth's inferred return types reference internal .mjs paths
export async function updateUser(data: { name?: string; image?: string }): Promise<AuthResponse> {
  // @ts-expect-error -- return type references non-portable internal path
  return _updateUser(data);
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}): Promise<AuthResponse> {
  // @ts-expect-error -- return type references non-portable internal path
  return _changePassword(data);
}
