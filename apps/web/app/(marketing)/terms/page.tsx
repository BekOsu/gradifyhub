import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — GradifyHub",
  description: "Terms governing your use of the GradifyHub platform.",
};

const sections = [
  {
    heading: "1. Acceptance of Terms",
    body: "By accessing or using GradifyHub you agree to be bound by these Terms. If you do not agree, do not use the platform.",
  },
  {
    heading: "2. Description of Service",
    body: "GradifyHub provides AI-assisted career acceleration tools including adaptive skill assessments, personalised learning roadmaps, lesson delivery, resume building, and job-match features. The service is provided on an as-is basis and may change without notice.",
  },
  {
    heading: "3. Accounts",
    body: "You must provide accurate information when creating an account. You are responsible for all activity under your account. Notify us immediately at hello@gradifyhub.com if you suspect unauthorised access.",
  },
  {
    heading: "4. Payment Terms",
    body: "Paid plans are billed monthly or annually via LemonSqueezy or NOWPayments. Subscriptions renew automatically unless cancelled before the renewal date. Prices are listed in USD and exclude any applicable taxes.",
  },
  {
    heading: "5. Prohibited Conduct",
    body: "You may not: scrape or bulk-download platform content; attempt to reverse-engineer the AI models; share account credentials; use the service for any unlawful purpose; or interfere with platform integrity.",
  },
  {
    heading: "6. Intellectual Property",
    body: 'All platform content, software, and AI-generated outputs are owned by or licensed to GradifyHub. You retain ownership of content you create (e.g. your resume), and grant GradifyHub a limited licence to process it to provide the service.',
  },
  {
    heading: "7. Disclaimer of Warranties",
    body: 'The platform is provided "as is" without warranties of any kind, express or implied, including fitness for a particular purpose, accuracy of AI-generated advice, or guaranteed employment outcomes.',
  },
  {
    heading: "8. Limitation of Liability",
    body: "To the maximum extent permitted by law, GradifyHub shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.",
  },
  {
    heading: "9. Termination",
    body: "We may suspend or terminate your account for breach of these Terms. You may cancel at any time from your account settings. On termination, your access ends at the close of the current billing period.",
  },
  {
    heading: "10. Governing Law",
    body: "These Terms are governed by the laws of the jurisdiction in which GradifyHub is registered. Any disputes shall be resolved in the competent courts of that jurisdiction.",
  },
  {
    heading: "11. Changes to Terms",
    body: "We may update these Terms at any time. Continued use after the effective date constitutes acceptance. Material changes will be notified by email.",
  },
  {
    heading: "12. Contact",
    body: "Questions about these Terms? Email hello@gradifyhub.com.",
  },
];

export default function TermsPage() {
  return (
    <div className="bg-background text-foreground">
      <article className="mx-auto max-w-2xl px-6 py-24">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">GradifyHub</p>
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
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
