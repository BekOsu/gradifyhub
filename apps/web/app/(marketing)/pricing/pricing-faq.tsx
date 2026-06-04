"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "How does billing work?",
    a: "Pro is billed monthly at $10/mo. You'll be charged on the same day each month and can cancel at any time from your account settings.",
  },
  {
    q: "Can I cancel or change my plan at any time?",
    a: "Yes. Cancellations take effect at the end of the current billing period — you keep full Pro access until then.",
  },
  {
    q: "What tech stacks are supported?",
    a: "GradifyHub supports any tech role — frontend, backend, full-stack, data engineering, DevOps, AI engineering, and more. Your roadmap is built around the stack you choose and what the job market currently demands.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "We don't offer a time-limited trial, but we do offer a 7-day money-back guarantee on new Pro subscriptions. If you're not satisfied, email us and we'll refund you, no questions asked.",
  },
  {
    q: "What does the free plan include?",
    a: "The free plan includes one adaptive assessment, two AI-generated roadmaps, up to 2 lessons per day, the AI resume builder, and 2 AI quizzes per day. You can use GradifyHub indefinitely on the free plan — Pro just removes all limits.",
  },
  {
    q: "Do unused streak freezes roll over?",
    a: "Streak freezes are a Pro feature. They don't expire — use them whenever you need a day off.",
  },
];

export function PricingFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-2xl">
      <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight">FAQ</h2>
      <div className="divide-y">
        {faqs.map((faq, i) => (
          <div key={faq.q}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-medium"
            >
              <span>{faq.q}</span>
              {open === i ? (
                <Minus className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </button>
            {open === i && (
              <p className="pb-5 text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
