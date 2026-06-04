// Soft Skills — D2: Discovery & Scoping (3 lessons)

export const D2_LESSONS = [
  // ────────────────────────────────────────────────────────────────────────
  // L1 (beginner): Running a discovery call without losing them
  // ────────────────────────────────────────────────────────────────────────
  {
    slug: "ss-discovery-call-without-losing-them",
    title: "Running a discovery call without losing them",
    description:
      "Use the 5-question discovery framework to surface real problems in 30 minutes — without demoing your way into the wrong scope.",
    dimension: "ss-discovery-scoping",
    difficulty: "beginner",
    estimatedMinutes: 15,
    order: 1,
    content: `## Why it matters
Most junior engineers blow the first call by demoing too early or nodding through vague requests. A stakeholder says "we want AI in our product" and an hour later you are scoping a chatbot they will never use. Discovery is not a sales pitch and it is not a requirements dump — it is a structured conversation that surfaces the real problem, the people who feel it, and the constraints that will kill bad ideas before you write code. Senior engineers run discovery with a framework so the stakeholder feels heard, you leave with enough signal to write a brief, and nobody is surprised in week three.

## What to know
- The 5-Question Discovery Framework, asked in order: (1) What is the problem you are trying to solve? (2) Who feels it and how often? (3) What have you already tried? (4) What is the constraint — budget, timeline, team, regulation? (5) What does success look like in 90 days?
- Active listening cues that buy you trust: reflect back in their words ("so the support team is drowning in tier-1 tickets"), pause for three seconds before responding, take notes the stakeholder can see, and label the emotion ("sounds frustrating") before solving.
- When to demo vs. ask: demo only after question 5, and only if a demo answers a specific objection ("can it actually read our PDFs?"). Demoing before discovery anchors the stakeholder on your solution instead of their problem.

## How to use it
Constraint: a B2B SaaS founder messages you "we want AI in our product, can you scope it this week?" You have a 30-minute call booked. A junior engineer opens with a Loom of their last project. A senior engineer opens with question one and shuts up. The senior keeps a single notebook page open with the five questions written down and writes the stakeholder's answer in their own words, not paraphrased. By minute 20 the senior has learned the real problem is not "AI in the product" but "our onboarding team is spending six hours per customer manually configuring integrations" — which is a workflow problem, not a model problem. The senior ends with "before I scope, can I send you a one-page brief tomorrow confirming what I heard?" That sentence buys 24 hours to think and a written artifact to anchor the next conversation.

## Assessment-style scenario
A client says: "We want AI in our product." You have 30 minutes. List the first five questions you ask, in order, and explain what each one is designed to surface. A weak answer jumps to "what model do you want to use" or "what is your tech stack." A strong answer starts with the problem, not the solution, and ends with a success metric you could measure in 90 days.

## Key Takeaways
- Run the 5-Question Discovery Framework in order — problem, people, prior attempts, constraints, success — before proposing anything.
- Reflect the stakeholder's words back to them so they feel heard and so you catch misinterpretations early.
- Never demo before question five; demos anchor the conversation on your solution instead of their problem.
- End every discovery call with a commitment to send a written one-page brief within 24 hours.`,
    quizzes: [
      {
        question:
          "A stakeholder opens a 30-minute discovery call with 'we want AI in our product.' What is the strongest first move?",
        choices: [
          {
            id: "a",
            label: "Share a Loom of a similar AI project you shipped last quarter",
            correct: false,
          },
          {
            id: "b",
            label: "Ask 'what is the problem you are trying to solve?' and take notes in their words",
            correct: true,
          },
          {
            id: "c",
            label: "Walk them through your preferred LLM provider and pricing",
            correct: false,
          },
          {
            id: "d",
            label: "Propose a two-week proof of concept on the spot to show momentum",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "You are 20 minutes into a discovery call. The stakeholder says 'support tickets are eating my team alive.' What should you do next?",
        choices: [
          {
            id: "a",
            label: "Pitch a chatbot built on RAG with their knowledge base",
            correct: false,
          },
          {
            id: "b",
            label: "Reflect it back ('the support team is drowning in tier-1 tickets — is that right?') then ask who feels it and how often",
            correct: true,
          },
          {
            id: "c",
            label: "Open your laptop and demo a chatbot you built last month",
            correct: false,
          },
          {
            id: "d",
            label: "Ask which ticketing system they use so you can scope the integration",
            correct: false,
          },
        ],
        order: 2,
      },
      {
        question:
          "Which question from the 5-Question Discovery Framework is most likely to kill a bad idea before you write code?",
        choices: [
          {
            id: "a",
            label: "What is your tech stack?",
            correct: false,
          },
          {
            id: "b",
            label: "What is the constraint — budget, timeline, team, regulation?",
            correct: true,
          },
          {
            id: "c",
            label: "Have you used Claude or GPT before?",
            correct: false,
          },
          {
            id: "d",
            label: "Do you want a web app or a mobile app?",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // L2 (intermediate): Writing a project brief that prevents scope creep
  // ────────────────────────────────────────────────────────────────────────
  {
    slug: "ss-project-brief-prevents-scope-creep",
    title: "Writing a project brief that prevents scope creep",
    description:
      "Turn a 30-minute discovery call into a one-page brief with written sign-off — the cheapest insurance policy against scope creep.",
    dimension: "ss-discovery-scoping",
    difficulty: "intermediate",
    estimatedMinutes: 20,
    order: 2,
    content: `## Why it matters
Scope creep does not happen in week four — it happens on day one, when nothing is written down. A stakeholder says "a chatbot" and you both nod, except they are imagining a voice agent that handles refunds and you are imagining a FAQ widget on a marketing site. The brief is the artifact that forces both of you to agree on the same picture in writing, before anyone commits engineering time. A good brief fits on one page, takes 90 minutes to write after discovery, and earns its keep the first time a stakeholder says "I thought that was included." Senior engineers treat the brief as a contract — not legally, but operationally — and refuse to start work until it is signed off in writing.

## What to know
- The YC one-pager structure, in order: Problem (one sentence), Scope (3–5 bullets of what is in), Out-of-Scope (3–5 bullets of what is explicitly out), Success Metric (one measurable number), Timeline (milestones with dates), Risks (3 bullets with mitigations).
- The Out-of-Scope section is the single most important block — it is where you write down everything the stakeholder mentioned but you are not building. "Voice input," "multilingual support," "Salesforce integration" — name them so they cannot be quietly assumed in.
- Written sign-off means a reply email or Slack message containing the brief or a link to it, with the words "approved" or "looks good, proceed." Verbal sign-off in a call does not count and will not protect you in week three.

## How to use it
Constraint: a stakeholder says "we want a chatbot delivered in 2 weeks." Junior move: open a repo and start wiring up a Next.js app. Senior move: write a one-page brief. Problem: "Support team handles 200 tier-1 tickets per week; 60% are password resets and order-status lookups that a self-serve assistant could resolve." Scope: web-based chat widget on the help center, answers from existing FAQ markdown, hands off to human agent on three failed attempts, English only, deployed to staging by day 10. Out-of-Scope: voice input, Spanish, Salesforce sync, mobile app, payment refunds, account changes. Success Metric: 40% deflection rate on password-reset tickets measured over the first 14 days post-launch. Timeline: day 3 brief signed, day 7 prototype on staging, day 12 stakeholder review, day 14 production. Risks: FAQ content is stale (mitigation: stakeholder owns content refresh by day 5), staging access blocked by IT (mitigation: ticket filed day 1), success metric unmeasurable (mitigation: instrument deflection events on day 7). Send the brief, ask for written approval, and do not write a line of code until the reply arrives.

## Assessment-style scenario
A stakeholder pings you on Friday: "Quick favor — can you build us a chatbot? We need it in two weeks for a board demo." Write the one-page brief. A weak answer skips the Out-of-Scope section or sets a vague success metric like "improve customer experience." A strong answer names three things you are explicitly not building, sets one measurable success metric with a number and a deadline, and ends with a sentence asking for written approval before work starts.

## Key Takeaways
- Use the YC one-pager structure: Problem, Scope, Out-of-Scope, Success Metric, Timeline, Risks — on one page, written within 24 hours of discovery.
- The Out-of-Scope section is the single most important block; name everything the stakeholder mentioned that you are not building.
- Require written sign-off (email or Slack reply with "approved") before you write code; verbal approval does not protect you.
- A measurable success metric with a number and a deadline kills more scope creep than any contract clause.`,
    quizzes: [
      {
        question:
          "A stakeholder asks for 'a chatbot in 2 weeks for a board demo.' You finish discovery. What is the next move before writing code?",
        choices: [
          {
            id: "a",
            label: "Scaffold a Next.js repo and start wiring the chat UI to save time",
            correct: false,
          },
          {
            id: "b",
            label: "Write a one-page brief with Problem, Scope, Out-of-Scope, Success Metric, Timeline, Risks — then get written sign-off",
            correct: true,
          },
          {
            id: "c",
            label: "Send a calendar invite for a weekly sync and start building in parallel",
            correct: false,
          },
          {
            id: "d",
            label: "Ask the stakeholder to write a PRD and wait for it before doing anything",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "Which block of the YC one-pager brief is most effective at preventing scope creep three weeks into the project?",
        choices: [
          {
            id: "a",
            label: "Problem statement",
            correct: false,
          },
          {
            id: "b",
            label: "Out-of-Scope — explicitly naming what you are not building",
            correct: true,
          },
          {
            id: "c",
            label: "Timeline with milestone dates",
            correct: false,
          },
          {
            id: "d",
            label: "Risks and mitigations section",
            correct: false,
          },
        ],
        order: 2,
      },
      {
        question:
          "You send the brief on Tuesday. The stakeholder replies 'sounds great, let's chat Thursday.' What should you do?",
        choices: [
          {
            id: "a",
            label: "Start coding — they said it sounds great",
            correct: false,
          },
          {
            id: "b",
            label: "Reply asking for written approval ('reply with approved to proceed') and hold off on code until you get it",
            correct: true,
          },
          {
            id: "c",
            label: "Assume sign-off after 48 hours of silence and begin development",
            correct: false,
          },
          {
            id: "d",
            label: "Cancel Thursday's call and ship a prototype to impress them",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // L3 (advanced): Cutting scope without burning the relationship
  // ────────────────────────────────────────────────────────────────────────
  {
    slug: "ss-cutting-scope-without-burning-relationship",
    title: "Cutting scope without burning the relationship",
    description:
      "Use the 'yes-and-won't-do' pattern to trade scope for timeline and surface trade-offs in the stakeholder's own language — money, time, risk.",
    dimension: "ss-discovery-scoping",
    difficulty: "advanced",
    estimatedMinutes: 25,
    order: 3,
    content: `## Why it matters
Every project hits the moment when the stakeholder adds requirements and the timeline has not moved. Junior engineers say "yes" and miss the deadline, or say "no" and damage the relationship. Senior engineers do neither — they reframe the conversation so the stakeholder picks the trade-off themselves. The skill is not refusal; it is making the cost of each new requirement visible in the stakeholder's own currency, so cutting scope becomes their idea, not yours. Done well, you ship on time, the stakeholder feels in control, and the relationship gets stronger because they saw you protect their outcome instead of their comfort.

## What to know
- The "yes, and what we won't do" pattern: never say no. Say "yes, we can add Salesforce sync — and to fit the two-week timeline, we will not ship the mobile view or the multilingual support we agreed to in the brief. Which would you like to trade?" The stakeholder cannot accept all four; the math forces the choice.
- Trading scope for timeline: the only three levers in any project are scope, timeline, and quality. Quality is non-negotiable, so every new requirement must be paid for in either scope (cut something) or timeline (extend the deadline). Name the trade explicitly; never let it stay implicit.
- Surface trade-offs in the stakeholder's language: $, time, or risk. A CFO hears "this adds $12K in engineering time and pushes the board demo to week four." A CTO hears "this adds a dependency on a third-party API with a 99.5% SLA, so we inherit their downtime." A founder hears "this is two more weeks before you can show traction to investors." Same trade-off, three translations — pick the one your stakeholder will feel.

## How to use it
Constraint: two weeks into a three-week build, the stakeholder messages "great progress — we also need Salesforce sync, a Spanish version, an admin dashboard, and a weekly email digest before launch. Still on track for Friday?" Junior move: panic-code through the weekend and ship something broken. Senior move: reply within an hour with the trade explicit. "Happy to add these — let's look at what fits. We have one week left. Salesforce sync is roughly three engineering days because of their OAuth flow. Spanish is two days including QA. Admin dashboard is four days. Weekly email digest is one day. That is ten days of work in five working days, so we need to trade. Three options: (A) ship Friday with original scope plus the email digest only — adds one day, we cut buffer; (B) ship Friday with Salesforce sync and email, push Spanish and dashboard to v1.1 in week five; (C) move launch to the following Friday and ship everything, which costs one week and pushes the board demo. Which trade fits your business?" The stakeholder now owns the decision. You did not say no. You did not silently miss the deadline. You translated four new requirements into engineering days, mapped them to their calendar, and gave three options framed in time and risk. Whatever they pick, the relationship survives because they chose it.

## Assessment-style scenario
Two weeks into a three-week build, the stakeholder adds four new requirements. You have five working days left. Draft the reply. A weak answer says "yes, we will try" or "no, that is out of scope per the brief." A strong answer names the engineering cost of each new item in days, then offers two or three concrete trades framed in the stakeholder's language — money, time, or risk — and ends with a question that forces them to choose.

## Key Takeaways
- Never say no — use "yes, and what we won't do" to make the trade-off visible and force the stakeholder to choose.
- The only three levers are scope, timeline, and quality; every new requirement must be paid for in scope or timeline, never quality.
- Translate trade-offs into the stakeholder's own language — dollars for a CFO, risk and dependencies for a CTO, time-to-market for a founder.
- End every scope-trade conversation with two or three concrete options and a question that puts the decision back in their hands.`,
    quizzes: [
      {
        question:
          "Two weeks into a three-week build, the stakeholder adds four new requirements. What is the strongest response?",
        choices: [
          {
            id: "a",
            label: "Reply 'sorry, that's out of scope per the brief' and link to the signed brief",
            correct: false,
          },
          {
            id: "b",
            label: "Reply 'yes, we'll try' and code through the weekend to make it work",
            correct: false,
          },
          {
            id: "c",
            label: "Estimate each requirement in engineering days, then offer 2–3 concrete trades framed in time and risk, ending with a question that forces them to choose",
            correct: true,
          },
          {
            id: "d",
            label: "Schedule a meeting next week to discuss it after the current deadline passes",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "Your stakeholder is the company CFO. You need to push back on a 4-day add-on. Which framing lands hardest?",
        choices: [
          {
            id: "a",
            label: "'This adds technical complexity to the codebase and increases maintenance burden.'",
            correct: false,
          },
          {
            id: "b",
            label: "'This adds roughly $12K in engineering cost and pushes the board demo to week four.'",
            correct: true,
          },
          {
            id: "c",
            label: "'This requires a new OAuth flow with a third-party SLA we do not control.'",
            correct: false,
          },
          {
            id: "d",
            label: "'This is not in the original brief so I cannot do it.'",
            correct: false,
          },
        ],
        order: 2,
      },
      {
        question:
          "Which sentence is the strongest application of the 'yes-and-won't-do' pattern?",
        choices: [
          {
            id: "a",
            label: "'No, Salesforce sync is out of scope — we agreed on this in the brief.'",
            correct: false,
          },
          {
            id: "b",
            label: "'Yes, we can add Salesforce sync — and to keep the Friday launch, we will cut the mobile view or push Spanish to v1.1. Which trade works?'",
            correct: true,
          },
          {
            id: "c",
            label: "'Sure, we'll add it and see how the timeline shakes out.'",
            correct: false,
          },
          {
            id: "d",
            label: "'Yes, but only if you sign a change order first.'",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },
] as const;
