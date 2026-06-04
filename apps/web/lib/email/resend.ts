import { Resend } from "resend";
import {
  welcomeEmail,
  welcomeDiscountEmail,
  assessmentCompleteEmail,
  paymentSuccessEmail,
  streakReminderEmail,
} from "./templates";

// Use verified domain in prod; fall back to resend.dev for local dev without domain
const FROM = process.env.RESEND_FROM_EMAIL ?? "GradifyHub <noreply@gradifyhub.com>";

function getErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return undefined;
  }

  const { code } = error;
  return typeof code === "string" ? code : undefined;
}

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendVerificationEmail({
  to,
  url,
}: {
  to: string;
  url: string;
}) {
  const resend = getResend();

  console.log("[Resend] ========== VERIFICATION EMAIL ==========");
  console.log("[Resend] TO:", to);
  console.log("[Resend] FROM:", FROM);
  console.log("[Resend] URL:", url);
  console.log("[Resend] API Key present:", !!process.env.RESEND_API_KEY);
  console.log("[Resend] API Key starts with:", process.env.RESEND_API_KEY?.substring(0, 10));
  console.log("[Resend] Starting send...");

  const startTime = Date.now();
  const { error, data } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Verify your email for GradifyHub",
    html: `
      <h2>Verify Your Email</h2>
      <p>Welcome to GradifyHub! Click the link below to verify your email address.</p>
      <p><a href="${url}">Verify Email</a></p>
      <p>Or copy this link: ${url}</p>
      <p>This link expires in 24 hours.</p>
    `,
    text: `Verify your email: ${url}`,
  });

  const duration = Date.now() - startTime;
  console.log("[Resend] Request completed in", duration, "ms");

  if (error) {
    console.error("[Resend] ❌ FAILED to send verification email");
    console.error("[Resend] Error message:", error.message);
    console.error("[Resend] Error code:", getErrorCode(error));
    console.error("[Resend] Full error:", JSON.stringify(error, null, 2));
    throw new Error(`Email verification failed: ${error.message}`);
  }

  console.log("[Resend] ✅ Verification email sent successfully");
  console.log("[Resend] Email ID:", data?.id);
  console.log("[Resend] ========================================");
}

export async function sendPasswordResetEmail({
  to,
  url,
}: {
  to: string;
  url: string;
}) {
  const resend = getResend();
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your password",
    text: `Click the link to reset your password: ${url}\n\nThis link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.`,
  });
  if (error) {
    console.error("[Resend] failed to send password reset email:", error);
    throw new Error(error.message);
  }
}

export async function sendWelcomeDiscountEmail({
  to,
  name,
  couponCode,
  discountPct,
}: {
  to: string;
  name: string;
  couponCode: string;
  discountPct: number;
}) {
  const resend = getResend();
  const { subject, html, text } = welcomeDiscountEmail({ name, couponCode, discountPct });
  const { error } = await resend.emails.send({ from: FROM, to, subject, html, text });
  if (error) {
    console.error("[Resend] failed to send welcome discount email:", error);
    // Don't throw — non-critical
  }
}

export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  const resend = getResend();
  const { subject, html, text } = welcomeEmail({ name });
  const { error } = await resend.emails.send({ from: FROM, to, subject, html, text });
  if (error) {
    console.error("[Resend] failed to send welcome email:", error);
    throw new Error(error.message);
  }
}

export async function sendAssessmentCompleteEmail({
  to,
  name,
  topSkill,
  nextStep,
}: {
  to: string;
  name: string;
  topSkill: string;
  nextStep: string;
}) {
  const resend = getResend();
  const { subject, html, text } = assessmentCompleteEmail({ name, topSkill, nextStep });
  const { error } = await resend.emails.send({ from: FROM, to, subject, html, text });
  if (error) {
    console.error("[Resend] failed to send assessment complete email:", error);
    throw new Error(error.message);
  }
}

export async function sendPaymentSuccessEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  const resend = getResend();
  const { subject, html, text } = paymentSuccessEmail({ name });
  const { error } = await resend.emails.send({ from: FROM, to, subject, html, text });
  if (error) {
    console.error("[Resend] failed to send payment success email:", error);
    throw new Error(error.message);
  }
}

export async function sendStreakReminderEmail({
  to,
  name,
  streak,
}: {
  to: string;
  name: string;
  streak: number;
}) {
  const resend = getResend();
  const { subject, html, text } = streakReminderEmail({ name, streak });
  const { error } = await resend.emails.send({ from: FROM, to, subject, html, text });
  if (error) {
    console.error("[Resend] failed to send streak reminder email:", error);
    throw new Error(error.message);
  }
}
