import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy — GradifyHub",
  description: "GradifyHub refund and cancellation policy.",
};

const sections = [
  {
    heading: "1. Cancellation",
    body: "You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of the current billing period — you retain full access until then.",
  },
  {
    heading: "2. Refund Eligibility",
    body: "We offer a 7-day refund window on new subscriptions. If you subscribed within the last 7 days and are not satisfied, email support@gradifyhub.com and we will issue a full refund, no questions asked.",
  },
  {
    heading: "3. Renewals",
    body: "Renewal charges are not refundable unless there was a billing error on our part. To avoid renewal charges, cancel at least 24 hours before your next billing date.",
  },
  {
    heading: "4. Crypto Payments",
    body: "Payments made via NOWPayments (cryptocurrency) are processed on-chain and cannot be reversed once confirmed. Refunds for crypto payments are issued as platform credit equivalent to the USD value at the time of payment.",
  },
  {
    heading: "5. Exceptions",
    body: "We reserve the right to deny refunds if we detect abuse of the refund policy (e.g. repeated subscribe-refund cycles) or if the account has been suspended for Terms of Service violations.",
  },
  {
    heading: "6. How to Request",
    body: "Email support@gradifyhub.com with subject line 'Refund Request' and include your account email and order ID. We process refunds within 5–10 business days.",
  },
  {
    heading: "7. Contact",
    body: "Billing questions? Email support@gradifyhub.com.",
  },
];

export default function RefundPage() {
  return (
    <div className="bg-background text-foreground">
      <article className="mx-auto max-w-2xl px-6 py-24">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">GradifyHub</p>
        <h1 className="text-3xl font-bold tracking-tight">Refund Policy</h1>
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
