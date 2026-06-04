import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@repo/db/client";
import * as schema from "@repo/db/schema";
import { eq } from "@repo/db/drizzle";
import { sendPasswordResetEmail, sendVerificationEmail } from "~/lib/email/resend";

const trustedOrigins = [
  process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS
    ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",").map((o) => o.trim())
    : []),
];

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => {
      try {
        console.log("[Auth] Sending password reset email to:", user.email);
        await sendPasswordResetEmail({ to: user.email, url });
        console.log("[Auth] Password reset email sent successfully");
      } catch (error) {
        console.error(
          "[Auth] Password reset email failed for",
          user.email,
          ":",
          error instanceof Error ? error.message : String(error)
        );
        // Don't throw — allow password reset to complete and show confirmation
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async (data: { user: { email: string }; url: string }) => {
      try {
        console.log("[Auth] Sending verification email on signup to:", data.user.email);
        await sendVerificationEmail({ to: data.user.email, url: data.url });
        console.log("[Auth] Verification email sent successfully");
      } catch (error) {
        console.error(
          "[Auth] Verification email failed for",
          data.user.email,
          ":",
          error instanceof Error ? error.message : String(error)
        );
        // Don't throw — allow signup to complete
      }
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
      skillGroupId: {
        type: "string",
        defaultValue: null,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (user.email.toLowerCase() === process.env.SUPERADMIN_EMAIL?.toLowerCase()) {
            await db.update(schema.user)
              .set({ role: "superadmin" })
              .where(eq(schema.user.id, user.id));
          }
        },
      },
    },
  },
});

export async function checkEmailExists(email: string): Promise<boolean> {
  const existingUser = await db.query.user.findFirst({
    where: eq(schema.user.email, email.toLowerCase()),
  });
  return !!existingUser;
}