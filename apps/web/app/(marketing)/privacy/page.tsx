import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — GradifyHub",
  description: "How GradifyHub collects, uses, and protects your data.",
};

const sections = [
  {
    heading: "1. Who We Are",
    body: "GradifyHub is an AI-powered career acceleration platform. This policy explains how we handle personal data collected through the platform.",
  },
  {
    heading: "2. Data We Collect",
    body: "We collect: account information (name, email, password hash); profile data you provide (role, experience, goals); assessment responses and scores; lesson progress and quiz results; resume content; payment transaction records (we do not store card numbers); and usage analytics.",
  },
  {
    heading: "3. How We Use Your Data",
    body: "We use your data to: operate and personalise the platform; generate your skill roadmap and lesson recommendations; process payments; send transactional emails (assessment results, payment receipts, streak reminders); improve our AI models on an aggregated, anonymised basis; and comply with legal obligations.",
  },
  {
    heading: "4. Data Sharing",
    body: "We do not sell your personal data. We share data only with service providers necessary to operate the platform (Neon for database hosting, Anthropic for AI processing, Resend for email, LemonSqueezy and NOWPayments for billing). Each provider is bound by data processing agreements.",
  },
  {
    heading: "5. Cookies and Analytics",
    body: "We use session cookies for authentication and PostHog for product analytics. PostHog data is pseudonymous. You can opt out of analytics tracking in your account settings.",
  },
  {
    heading: "6. Data Retention",
    body: "We retain your account data for as long as your account is active. You may request deletion at any time. Billing records are retained for 7 years as required by applicable law.",
  },
  {
    heading: "7. Your Rights",
    body: "Depending on your jurisdiction you may have the right to access, correct, export, or delete your personal data. To exercise these rights email privacy@gradifyhub.com. We will respond within 30 days.",
  },
  {
    heading: "8. Security",
    body: "We use TLS for data in transit, encryption at rest on our database, and HMAC-verified webhooks. No system is perfectly secure; we will notify you promptly in the event of a breach affecting your data.",
  },
  {
    heading: "9. Children",
    body: "GradifyHub is not directed at children under 16. If you believe a child has provided us with personal data, contact privacy@gradifyhub.com and we will delete it promptly.",
  },
  {
    heading: "10. Changes to This Policy",
    body: "We may update this policy at any time. The updated date at the top of this page will reflect when changes were last made. Continued use of the platform after the updated date constitutes acceptance.",
  },
  {
    heading: "11. Contact",
    body: "Privacy questions or requests? Email privacy@gradifyhub.com.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-background text-foreground">
      <article className="mx-auto max-w-2xl px-6 py-24">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">GradifyHub</p>
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: April 2026</p>
        <div className="mt-14 space-y-10">
          {sections.map((s) => (
            <div key={s.heading}>
              <h2 className="text-base font-semibold">{s.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
