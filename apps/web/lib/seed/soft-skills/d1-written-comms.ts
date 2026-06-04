// Soft Skills — D1: Written Technical Communication (3 lessons)
export const D1_LESSONS = [
  {
    slug: "ss-pr-descriptions-merged-in-24-hours",
    title: "PR descriptions that get merged in 24 hours",
    description:
      "Use the Why/What/Test template so reviewers can skim, trust, and approve your pull request in a single sitting.",
    dimension: "ss-written-comms",
    difficulty: "beginner",
    estimatedMinutes: 15,
    order: 1,
    content: `## Why it matters
A pull request is a sales pitch to your reviewers. Every senior engineer has the same scarce resource: focused attention. If your PR description forces them to open the diff just to figure out what changed, you have already lost. Teams that ship fast have a culture of self-explaining PRs, and the engineers who write them are the ones who get promoted because their work is visibly easy to review. The cost of a bad description is not just slow merging. It is also bugs that slip through because the reviewer skimmed, rollbacks that take hours because nobody remembers what the change did, and trust that quietly erodes every time a teammate has to ask "what is this?"

## What to know
- The Why/What/Test template is the industry default. Why explains the user or business problem in one or two sentences. What lists the concrete changes as bullets. Test describes how you verified it works, including manual steps and screenshots.
- Reviewers skim the title and the first three lines before anything else. Put the most important context at the top. Never bury the rationale below a wall of bullet points.
- For any UI change, embed a Loom or a screenshot. A 30-second Loom replaces 200 words of explanation and prevents "what does this look like" comments.
- Use a checklist for risk surface: migration ran, feature flag added, telemetry wired, rollback plan documented. GitHub renders these as boxes, which reviewers actually tick.
- Link the ticket, the design doc, and the related PRs. Reviewers should never have to search Jira or Linear to understand context.
- Title format matters. Conventional Commits like feat(billing): add Stripe webhook retry queue gives reviewers a category at a glance.

## How to use it
Scenario: You added a retry queue to your Stripe webhook handler. The constraint is that you have 200 lines of changes across 6 files and one of them is a migration. A junior would write "added retry logic." A senior writes: Title: feat(payments): retry failed Stripe webhooks for up to 24h. Body: Why — we silently dropped 1.2 percent of webhooks last month per Datadog dashboard X, causing missed invoice events. What — added a retries table, a worker that picks up failed events, exponential backoff capped at 24h. Test — replayed three failed events from staging, attached Loom of the dashboard going green. Risk — migration is additive, rollback is safe, feature flagged behind payments.webhook_retries.

## Assessment-style scenario
Your PR has been sitting four days with no review. The diff is 600 lines. The title is "fixes." There is no body. A teammate finally pings you on Slack and asks what it does. What do you change next time, in order of impact? Walk through what you would rewrite first and why.

## Key Takeaways
- Lead with Why, then What, then Test. Reviewers decide whether to engage in the first three lines.
- Always embed a Loom or screenshot for UI work. Pixels beat prose.
- Use a risk checklist with migration, flag, telemetry, and rollback so reviewers see the blast radius instantly.
- Title with Conventional Commit prefixes so reviewers can triage from the inbox.
- A PR that takes you ten extra minutes to write often saves the reviewer an hour and gets merged the same day.`,
    quizzes: [
      {
        question:
          "Your PR has been open four days with no review. The title is 'fixes' and the body is empty. Which change next time will have the largest effect on review speed?",
        choices: [
          {
            id: "a",
            label: "Pinging the reviewer in Slack every morning until they look at it.",
            correct: false,
          },
          {
            id: "b",
            label:
              "Rewriting the title and body with Why/What/Test plus a Loom, so the reviewer can decide to engage in 30 seconds.",
            correct: true,
          },
          {
            id: "c",
            label: "Splitting the 600-line diff into one PR per file so each is shorter.",
            correct: false,
          },
          {
            id: "d",
            label: "Adding more unit tests so the reviewer trusts the code without reading it.",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "You are shipping a UI change that adjusts a checkout button's loading state. What single addition makes the description hardest to misread?",
        choices: [
          {
            id: "a",
            label: "A paragraph describing the new animation timing in milliseconds.",
            correct: false,
          },
          {
            id: "b",
            label: "A bullet list of every CSS class you touched.",
            correct: false,
          },
          {
            id: "c",
            label: "A short Loom or before/after screenshot embedded at the top of the body.",
            correct: true,
          },
          {
            id: "d",
            label: "A link to the Figma file the designer shared in the ticket.",
            correct: false,
          },
        ],
        order: 2,
      },
      {
        question:
          "Your PR adds a database migration plus a feature flag. Which structure best signals the blast radius to a senior reviewer skimming on mobile?",
        choices: [
          {
            id: "a",
            label:
              "A long prose paragraph at the end of the body explaining everything that could break.",
            correct: false,
          },
          {
            id: "b",
            label:
              "A checklist near the top with boxes for migration, flag, telemetry, and rollback plan.",
            correct: true,
          },
          {
            id: "c",
            label: "A comment inside the migration file pointing readers to the rollback steps.",
            correct: false,
          },
          {
            id: "d",
            label: "A label on the PR like 'risky' so reviewers know to be careful.",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },
  {
    slug: "ss-rfcs-engineers-will-read",
    title: "Writing an RFC engineers will read",
    description:
      "Structure a Request for Comments like Stripe, Linear, and Cloudflare so reviewers leave async plus-ones instead of meeting invites.",
    dimension: "ss-written-comms",
    difficulty: "intermediate",
    estimatedMinutes: 20,
    order: 2,
    content: `## Why it matters
RFCs are how serious engineering organizations make non-trivial decisions without endless meetings. Stripe, Linear, Cloudflare, and Shopify all publish public versions of their internal RFC culture, and the pattern is consistent: write the proposal down, circulate it, gather async comments, then merge. An RFC that engineers actually read converts a week of Slack debate into a one-day comment thread. An RFC that engineers skim and ignore creates the worst outcome in software: a half-decided architecture nobody owns. Senior engineers are measured on the quality of their RFCs because writing one well is a forcing function for thinking clearly about tradeoffs.

## What to know
- The standard RFC skeleton is: problem, goals, non-goals, proposed solution, alternatives considered, risks, rollout plan, open questions. Stripe and Linear use almost exactly this shape. The order is not negotiable because reviewers read top-down and bail early.
- Non-goals are the most underrated section. Listing what the proposal explicitly will not solve prevents scope creep in the comments and signals you have thought about boundaries.
- Alternatives Considered is where seniors prove rigor. Listing two or three rejected options with one sentence of why each was rejected stops the comment thread "have you thought about X?"
- ADRs are a lighter format for narrower technical decisions: context, decision, consequences. Use an ADR when the choice is local, like picking a date library. Use an RFC when the choice crosses teams or shapes the product.
- Async plus-ones happen when readers can leave the document with a clear "I agree" without scheduling a call. That requires a one-paragraph TL;DR at the top, clear ownership, and an explicit deadline like "comments by Friday, decision Monday."
- Length is a signal. A two-page RFC says you have a focused problem. A twelve-page RFC says you have not yet figured out what the problem is.

## How to use it
Scenario: You are proposing the team switch from REST to GraphQL for the mobile API. Constraint: three other teams own services that the mobile app consumes. A junior would write a long essay about why GraphQL is better. A senior writes: TL;DR — propose moving mobile to a single GraphQL gateway over the next two quarters to cut mobile payload by 40 percent. Problem — mobile app makes 11 REST calls on cold start, p95 is 3.2s. Goals — sub-1.5s cold start, one schema across teams. Non-goals — replacing the web REST API, rewriting backend services. Proposed solution — federation gateway in front of existing services. Alternatives — BFF per platform rejected because of duplication, gRPC rejected because of mobile tooling cost. Risks — N+1 query patterns, schema ownership across three teams. Rollout — gateway in shadow mode for one quarter, then cut over endpoint by endpoint. Decision deadline — two weeks. That document gets async plus-ones because every objection is already addressed.

## Assessment-style scenario
A staff engineer leaves a comment on your RFC: "this feels like a solution looking for a problem." Which section of your RFC failed, and what would you rewrite first to recover the conversation without becoming defensive?

## Key Takeaways
- Use the Stripe/Linear skeleton: problem, goals, non-goals, proposed solution, alternatives, risks, rollout, open questions.
- Always include non-goals and alternatives considered. They are how seniors signal rigor.
- Pick ADR for local technical decisions, RFC for cross-team or product-shaping ones.
- Add a TL;DR and an explicit decision deadline so readers can plus-one async.
- If your RFC is over ten pages, the problem is not yet sharp enough to propose a solution.`,
    quizzes: [
      {
        question:
          "A staff engineer comments on your RFC saying 'this feels like a solution looking for a problem.' Which section most likely failed and should be rewritten first?",
        choices: [
          {
            id: "a",
            label: "Proposed solution, because the design probably needs more detail.",
            correct: false,
          },
          {
            id: "b",
            label:
              "Problem statement and goals, because the reader cannot evaluate a solution without a sharp problem.",
            correct: true,
          },
          {
            id: "c",
            label: "Alternatives considered, because you did not list enough rejected options.",
            correct: false,
          },
          {
            id: "d",
            label: "Rollout plan, because the staff engineer is worried about migration risk.",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "You need to document the team's choice to switch from Moment to date-fns inside one service. Which format fits the decision best?",
        choices: [
          {
            id: "a",
            label: "A full RFC with problem, goals, non-goals, and alternatives.",
            correct: false,
          },
          {
            id: "b",
            label: "An ADR with context, decision, and consequences.",
            correct: true,
          },
          {
            id: "c",
            label: "A Notion page tagged 'architecture' with a free-form discussion.",
            correct: false,
          },
          {
            id: "d",
            label: "A Slack thread in the engineering channel, pinned for visibility.",
            correct: false,
          },
        ],
        order: 2,
      },
      {
        question:
          "Your RFC for moving mobile to GraphQL has been open for a week with no plus-ones, only clarification questions. What is the most likely structural cause?",
        choices: [
          {
            id: "a",
            label: "The proposal is technically wrong and the team disagrees with GraphQL.",
            correct: false,
          },
          {
            id: "b",
            label: "The document is missing a TL;DR, non-goals, and an explicit decision deadline so readers cannot leave an async plus-one.",
            correct: true,
          },
          {
            id: "c",
            label: "You did not schedule a meeting to walk people through it.",
            correct: false,
          },
          {
            id: "d",
            label: "You did not include enough diagrams of the proposed gateway.",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },
  {
    slug: "ss-technical-writing-for-non-engineers",
    title: "Technical writing for non-engineers",
    description:
      "Lead with TL;DR plus three bullets, calibrate tone for executives and customers, and surface risk in status updates without triggering panic.",
    dimension: "ss-written-comms",
    difficulty: "advanced",
    estimatedMinutes: 25,
    order: 3,
    content: `## Why it matters
The single largest career multiplier for senior engineers is the ability to write for non-engineers. The CEO does not want a technical deep dive. The customer does not want a changelog. The board does not want a roadmap. Each of them wants a different shape of the same truth, and your job is to translate without distorting. Engineers who cannot do this stall at senior. Engineers who can do this become staff, principal, and director, because every promotion past senior is gated on the ability to make complex work legible to people who do not share your vocabulary. This is also the skill that protects your team during outages, layoffs, and budget cycles, because the people deciding your fate read your words, not your code.

## What to know
- The TL;DR-first format with three bullets is the only structure that survives executive inboxes. One sentence of conclusion, then three bullets of supporting evidence. Anything longer gets skimmed for the first line and ignored.
- Customer-facing release notes follow a different shape: user benefit first, capability second, limitation or known issue third. Never lead with internal architecture changes. "We rebuilt our search backend" is wrong. "Search is now 3x faster and supports typos" is right.
- Weekly status updates should surface risk without triggering panic. The pattern is: on track items, at risk items with one-line cause and mitigation, blocked items with a clear ask. Executives trust people who name risk early and offer options, not people who reassure them and then miss the date.
- Tone calibration is concrete. For a CEO: present tense, active voice, no hedging, no jargon, numbers if available. For a customer: warm, plain English, no apology for things that are not broken. For a board: outcomes and dollars, not features and tickets.
- Slack replies to executives should fit in one phone screen. If it does not fit, the answer is "writing you a doc, link in 30 min" and then you send the doc.
- The biggest failure mode is hedging. "We think we should be mostly on track barring any unexpected issues" reads as "I do not know." Say "On track for May 30. One risk: vendor SLA. Mitigation: we have a fallback ready by May 23."

## How to use it
Scenario: Your CEO Slacks you "what's the status of the AI feature?" at 4:55pm on a Friday. Constraint: you have 60 seconds and one phone screen. A junior writes a three-paragraph reply about the embedding pipeline. A senior replies: "On track for June 10 launch. Three things: 1) Core model integration shipped Tuesday, demo in staging. 2) Risk is throughput at peak, we are load-testing Monday, will know by Wednesday. 3) Open question: do we launch to all users or 10 percent? Need your call by Wednesday." That reply gets a thumbs up in 30 seconds and ends the thread. Same facts, different shape, completely different outcome.

## Assessment-style scenario
Your team's quarterly project is now two weeks behind because a vendor missed a delivery. You need to send the weekly status update tonight to a VP who has been bullish on the timeline. Draft the first three lines in your head: how do you surface the slip, what mitigation do you offer, and what specific decision do you ask the VP to make?

## Key Takeaways
- Always lead with TL;DR plus three bullets for executive writing. One sentence of conclusion, three bullets of evidence.
- Customer release notes go user benefit, then capability, then limitation. Never internal architecture.
- Surface risk early with a one-line cause and a concrete mitigation. Executives trust namers, not reassurers.
- Calibrate tone per audience: present tense for CEOs, plain English for customers, dollars and outcomes for boards.
- If your Slack reply to an executive does not fit on one phone screen, send a doc instead and link it.`,
    quizzes: [
      {
        question:
          "Your CEO Slacks 'what's the status of the AI feature?' at 4:55pm Friday. Which reply gets a thumbs up and ends the thread?",
        choices: [
          {
            id: "a",
            label:
              "A three-paragraph explanation of the embedding pipeline, the model choice, and the team's velocity.",
            correct: false,
          },
          {
            id: "b",
            label:
              "'On track for June 10. Core integration shipped Tuesday. One risk: throughput at peak, load-testing Monday. One open question: launch to all users or 10 percent — need your call by Wednesday.'",
            correct: true,
          },
          {
            id: "c",
            label: "'Going well, will send a full update Monday morning.'",
            correct: false,
          },
          {
            id: "d",
            label:
              "'Mostly on track barring any unexpected issues — happy to grab 15 minutes next week to walk through it.'",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "You are writing the customer-facing release note for a rewritten search backend that is now 3x faster and tolerates typos. Which opening line is correct?",
        choices: [
          {
            id: "a",
            label: "'We've migrated our search to a new Elasticsearch cluster with HNSW indexing.'",
            correct: false,
          },
          {
            id: "b",
            label: "'Search is now up to 3x faster and forgives typos so you find what you meant.'",
            correct: true,
          },
          {
            id: "c",
            label: "'Our engineering team has been hard at work on search improvements.'",
            correct: false,
          },
          {
            id: "d",
            label: "'Search v2 is live. See the changelog for technical details.'",
            correct: false,
          },
        ],
        order: 2,
      },
      {
        question:
          "Your quarterly project is two weeks behind because a vendor missed a delivery. You are sending the weekly update to a VP. Which framing best surfaces the slip without triggering panic?",
        choices: [
          {
            id: "a",
            label:
              "Bury the slip in the middle of the document under 'detailed updates' so the VP reads context first.",
            correct: false,
          },
          {
            id: "b",
            label:
              "Open with 'At risk: launch slips two weeks due to vendor delay. Mitigation: parallel fallback in test by next Friday. Asking you to choose between the slip or scoping out feature X by Tuesday.'",
            correct: true,
          },
          {
            id: "c",
            label:
              "Open with 'We may be slightly delayed but the team is working hard to recover and remains optimistic about the original date.'",
            correct: false,
          },
          {
            id: "d",
            label: "Skip the status update this week and schedule a meeting to walk through it live.",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },
] as const;
