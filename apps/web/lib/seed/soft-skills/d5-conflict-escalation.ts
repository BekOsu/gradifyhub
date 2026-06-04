// Soft Skills — D5: Conflict, Pushback & Escalation (3 lessons)

export const D5_LESSONS = [
  // ────────────────────────────────────────────────────────────────────────
  // L1 (beginner, 15, order 1)
  // ────────────────────────────────────────────────────────────────────────
  {
    slug: "ss-pushing-back-with-evidence",
    title: "Pushing back on a tech decision (with evidence, not attitude)",
    description:
      "Learn the evidence-first pushback pattern: bring data, write before you talk, and frame disagreement as a question.",
    dimension: "ss-conflict-escalation",
    difficulty: "beginner",
    estimatedMinutes: 15,
    order: 1,
    content: `## Why it matters
Juniors who never push back become typists. Juniors who push back with attitude get a reputation. The middle path — pushing back with evidence — is what senior engineers actually do, and it is a learnable pattern, not a personality trait. Your lead is not always right. Sometimes they are guessing, sometimes they are missing context you have from your last project, sometimes they are pattern-matching on a stack they used three years ago. The team is better off if you say something. The question is how.

The default failure mode is silent agreement followed by quiet resentment. The second failure mode is loud disagreement in a meeting where everyone digs in. Both make you look junior. Evidence-based pushback, delivered in writing first, is how you change minds without burning capital.

## What to know
- The core phrase is "I'd love to understand why X over Y given [evidence]." This is a question, not an accusation. It forces the other person to defend their reasoning instead of their ego, and it signals that you have done homework.
- Bring three things every time: data (latency numbers, error rates, benchmarks), prior incidents (the last time we did this, X broke), and a concrete alternative. Pushback without an alternative is just complaining.
- Write first, sync second. A Slack thread or a short doc gives the other person time to think without losing face. Verbal pushback in a meeting puts them on the spot and they will defend the original decision harder.
- Separate the decision from the person. "I think Postgres fits better" is fine. "I think you are wrong about Mongo" is not.
- Accept that you will lose some of these. Pushback is not about winning, it is about making sure the decision was made with full information.

## How to use it
Your lead announces in standup: "We're switching the user service to MongoDB." You used Postgres on your last team and you think it is the right tool here. Do not say "actually" in the meeting. After standup, open a thread in the team channel: "Quick question on the Mongo switch — I'd love to understand the driver. From what I've seen, our access patterns are mostly relational (user, orders, addresses with foreign keys) and we already run Postgres in three other services. Is there a workload or scale concern I am missing? Happy to write up a short comparison if useful." That message gives your lead a graceful path: they can explain a reason you do not know about, or they can say "good point, let's revisit." Either outcome is a win.

## Assessment-style scenario
Your team lead tells the team in a planning meeting that you are migrating the analytics pipeline from Postgres to ClickHouse next sprint. You have concerns: the team has no ClickHouse experience, the current Postgres setup handles the load, and the lead has not shared benchmarks. What is the strongest first move?

A) Push back immediately in the meeting so the team hears your concerns.
B) Stay silent and bring it up in your next one-on-one in two weeks.
C) After the meeting, send a written message asking what driver led to the switch, share what you have seen with the current load, and offer to write up a comparison.
D) Refuse to work on the migration until benchmarks are shared.

The right answer is C. It is written (low-pressure), evidence-first (current load), curious (asks for the driver), and offers a concrete contribution (the comparison). It is not silent and it is not confrontational.

## Key Takeaways
- Use the question form: "I'd love to understand why X over Y given [evidence]."
- Bring data, prior incidents, and a concrete alternative — never just an objection.
- Write first, sync second. Async pushback gives everyone room to think.
- You will lose some of these and that is fine. The goal is informed decisions, not winning.`,
    quizzes: [
      {
        question:
          "Your lead announces a switch from Redis to Memcached in standup. You disagree. What is the best immediate move?",
        choices: [
          { id: "a", label: "Interrupt and explain why Redis is better.", correct: false },
          {
            id: "b",
            label:
              "Send a written message after the meeting asking what drove the choice, with the data you have on current Redis usage.",
            correct: true,
          },
          { id: "c", label: "Say nothing and start looking for a new job.", correct: false },
          { id: "d", label: "Wait three weeks and bring it up in your performance review.", correct: false },
        ],
        order: 1,
      },
      {
        question:
          "Which framing is most likely to get a senior engineer to actually reconsider a decision?",
        choices: [
          { id: "a", label: "\"You're wrong about this, we should use X.\"", correct: false },
          { id: "b", label: "\"I disagree with the direction.\"", correct: false },
          {
            id: "c",
            label:
              "\"I'd love to understand why X over Y given that our last incident was caused by the same pattern.\"",
            correct: true,
          },
          { id: "d", label: "\"Has anyone else noticed how bad this idea is?\"", correct: false },
        ],
        order: 2,
      },
      {
        question:
          "You want to push back on an architectural choice. What is the minimum you should bring with you?",
        choices: [
          { id: "a", label: "Strong opinions and a calm tone.", correct: false },
          {
            id: "b",
            label: "Data or prior incidents, plus a concrete alternative you are willing to own.",
            correct: true,
          },
          { id: "c", label: "A blog post from a famous engineer that agrees with you.", correct: false },
          { id: "d", label: "Backing from at least two other teammates before you say anything.", correct: false },
        ],
        order: 3,
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // L2 (intermediate, 20, order 2)
  // ────────────────────────────────────────────────────────────────────────
  {
    slug: "ss-when-to-escalate-vs-ship-and-learn",
    title: "When to escalate vs. when to ship and learn",
    description:
      "Apply the escalation matrix — reversible, blocking, cost — and use the \"unless I hear otherwise\" pattern to avoid stalling.",
    dimension: "ss-conflict-escalation",
    difficulty: "intermediate",
    estimatedMinutes: 20,
    order: 2,
    content: `## Why it matters
Junior engineers escalate too much or too little. Too much: every minor disagreement becomes a Slack to the manager, and you become the person who cannot resolve anything alone. Too little: a quietly bad decision ships and someone asks "why didn't you say something?" The middle is a discipline, not an instinct. You need a model for when a disagreement is worth pulling rank on, and a phrase that lets you move forward when it is not. Most teams do not teach this — you figure it out by getting it wrong twice.

## What to know
- The escalation matrix has three axes. Reversible: can we undo this in a day, a week, or never? Blocking: does this stop other people from working, or only inconvenience me? Cost: if we are wrong, do we lose an hour, a sprint, or a quarter? Escalate when the answer is irreversible, blocking, and high-cost. If two of three are low, ship and learn.
- Escalate to your manager, not your manager's manager. Skipping the chain burns trust permanently. Your manager will find out and remember. Only skip the chain if your manager is the problem, and even then, tell them first.
- The most useful phrase in your toolkit is "I'm going to do X unless I hear otherwise by Y." This converts an open disagreement into a deadline, respects the other person's time, and gives them an easy out if they have not thought about it.
- "Disagree and commit" applies after a real decision has been made. Before that, you have not finished the disagree step yet.
- Document the disagreement before you commit. A short note — "noting that I argued for X, going with Y as decided" — is factual, not passive-aggressive, and it protects everyone if the decision turns out badly.

## How to use it
You are reviewing a PR with synchronous DB writes inside a request handler that already has p99 latency problems. The author is a peer. You leave a comment, they push back, and you are two rounds deep with the review window closing in 24 hours. Apply the matrix: reversible? Yes, refactor later. Blocking? No, the feature ships either way. Cost? Maybe, only on a traffic spike. Two of three are low — ship it, log a follow-up ticket, and move on. If instead this were a schema change locking the data model for a year (irreversible, blocking the next three features, high cost), escalate to your tech lead the same day, with the matrix written out.

## Assessment-style scenario
A senior engineer rewrites the auth flow on a PR and you spot what looks like a session-fixation vulnerability. You comment, they say "this is fine, I've done it this way before." PR review window closes in 24 hours. What do you do?

A) Approve the PR — they are senior, they know better.
B) Block the PR and refuse to discuss further until they explain.
C) Apply the matrix (irreversible if it ships, blocking trust in auth, high cost) and escalate the same day: ping your tech lead with a one-paragraph summary and a link to the thread.
D) Wait two weeks and bring it up at the next architecture review.

The right answer is C. Auth security is the canonical case: irreversible (you cannot un-deploy a session hijack), high-cost (incident, possibly disclosure), and you have a specific concern, not a vague feeling. This is exactly what your tech lead is for.

## Key Takeaways
- Use the matrix: reversible, blocking, cost. Two of three low means ship and learn.
- Escalate to your manager, not over their head. Skipping the chain is a one-time mistake.
- "I'm going to do X unless I hear otherwise by Y" unblocks decisions without forcing escalation.
- Document the disagreement in writing before you commit. Short and factual, not passive-aggressive.`,
    quizzes: [
      {
        question:
          "Which scenario most clearly justifies escalating to your tech lead the same day?",
        choices: [
          { id: "a", label: "A code style disagreement on a PR.", correct: false },
          {
            id: "b",
            label:
              "A schema migration that locks in a data model for the next year, with one engineer disagreeing on the shape.",
            correct: true,
          },
          { id: "c", label: "A teammate naming a variable `data` instead of `payload`.", correct: false },
          { id: "d", label: "A library version bump in a dev dependency.", correct: false },
        ],
        order: 1,
      },
      {
        question:
          "You have raised a concern with a peer in a PR thread and they have pushed back. You are not convinced. Review window closes in a day. What pattern lets you avoid escalating but still move forward?",
        choices: [
          { id: "a", label: "Approve silently and complain in DMs to another teammate.", correct: false },
          { id: "b", label: "Leave the PR pending until someone else weighs in.", correct: false },
          {
            id: "c",
            label:
              "Write: \"I'm going to approve this with the follow-up ticket linked, unless I hear otherwise by EOD tomorrow.\"",
            correct: true,
          },
          { id: "d", label: "Email your skip-level manager with the full thread.", correct: false },
        ],
        order: 2,
      },
      {
        question:
          "Your direct manager made a call you disagree with. You think their manager would agree with you. What is the first move?",
        choices: [
          {
            id: "a",
            label:
              "Tell your manager you disagree, share your reasoning, and only consider going higher if they refuse to engage.",
            correct: true,
          },
          { id: "b", label: "Slack their manager directly to save time.", correct: false },
          { id: "c", label: "Bring it up in front of their manager in the next all-hands.", correct: false },
          { id: "d", label: "Quietly ignore the decision and do it your way.", correct: false },
        ],
        order: 3,
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // L3 (advanced, 25, order 3)
  // ────────────────────────────────────────────────────────────────────────
  {
    slug: "ss-disagree-and-commit",
    title: "Disagree-and-commit: the post-decision discipline",
    description:
      "What disagree-and-commit actually looks like in PR comments, retros, and the months after a decision goes the wrong way.",
    dimension: "ss-conflict-escalation",
    difficulty: "advanced",
    estimatedMinutes: 25,
    order: 3,
    content: `## Why it matters
"Disagree and commit," popularised inside Amazon, is one of the most quoted leadership phrases in tech. Most people get the first half right and the second half wrong. They disagree publicly, then commit only on the surface — the moment the decision wobbles, they pull the receipts and say "I told you so." This destroys trust faster than disagreeing in the first place. This lesson is about the months after a decision is made against you. Committing to a path you argued against separates senior engineers from talented juniors.

## What to know
- The Amazon framing has two halves that must both be true. Disagree: voice your concern clearly, in writing, with evidence, before the decision is final. Commit: once the call is made, execute as if it were your own idea. Half-commit is worse than not disagreeing at all, because now you have a record of disagreement plus a record of half-effort.
- In PR comments after a losing argument, the rule is no sniping. Do not write "as I mentioned before" with a passive-aggressive edge. Either review the PR on its merits or step away from reviewing it.
- Commit publicly, disagree privately — never the inverse. In team channels and standups, support the chosen approach. In one-on-ones with your manager, you can still flag the risks you saw, and you can ask "what would change our minds?" — that is healthy.
- Avoid "I told you so" entirely. If the decision fails as you predicted, the win is invisible. Anyone who matters already remembers your earlier comment. Saying it out loud signals that you are keeping score, and people stop bringing you into decisions because the cost of disagreeing with you is too high.
- When a losing decision starts to fail, help fix it as if you had built it. Propose the mitigation, do not just diagnose the failure. The phrase is "here is what I think we should do now," not "this is what I predicted."

## How to use it
Six months ago, the team picked a microservice architecture for a product you argued should stay monolithic. You documented your concerns, lost, and shipped the split anyway. Now the team is drowning in cross-service latency and on-call pages. Your prediction was right. The temptation — to forward your old doc to your manager, to bring it up in the retro — is real. Resist all of it. Instead, write a short proposal: "Given where we are, here are three options to reduce operational cost — consolidate A and B, add a synchronous fast path, or fold everything back." Treat the prediction as if it were someone else's. Your reputation is built more by how you behave when you are right than by how you behave when you disagree.

## Assessment-style scenario
The team chose an architecture you argued against. Three months in, it is failing exactly as you predicted in a written doc. Your manager is now asking the team for ideas. What is your move?

A) Forward your original doc to your manager so they know you saw this coming.
B) Bring it up in the next retro as a case study in why the team should listen to you more.
C) Write a short, forward-looking proposal with two or three options to address the current pain — without referencing your earlier objection.
D) Ask to be removed from the project since you never agreed with it.

The right answer is C. The forward-looking proposal is the move. Your manager already knows you predicted this; reminding them is a small win that costs a large amount of trust. Future decisions will quietly route around you.

## Key Takeaways
- Disagree fully before the decision, commit fully after. Half-commit is the worst option.
- No sniping in PR comments after a losing argument. Review on merits or step away.
- Public support, private flagging — never the inverse.
- Never say "I told you so." Help fix the failing decision as if it were your own.
- Your reputation is built by how you act when you are right and ignored, not when you are wrong and loud.`,
    quizzes: [
      {
        question:
          "A decision you argued against has gone live and is starting to fail in the way you predicted. What is the best move?",
        choices: [
          { id: "a", label: "Forward your original objection doc to leadership so credit is recorded.", correct: false },
          {
            id: "b",
            label:
              "Write a forward-looking proposal with concrete mitigations, without referencing the earlier disagreement.",
            correct: true,
          },
          { id: "c", label: "Bring it up in the next retro as a teaching moment.", correct: false },
          { id: "d", label: "Step back and let the team feel the consequences so they learn.", correct: false },
        ],
        order: 1,
      },
      {
        question:
          "Which behaviour best embodies disagree-and-commit after a losing argument on a PR?",
        choices: [
          { id: "a", label: "Approving the PR but adding \"as I mentioned in the doc\" to every comment.", correct: false },
          {
            id: "b",
            label:
              "Reviewing the PR on its merits without sniping, and supporting the approach in team channels.",
            correct: true,
          },
          { id: "c", label: "Refusing to review the PR at all so no one mistakes your stance.", correct: false },
          { id: "d", label: "Approving silently while telling teammates in DMs that it is going to fail.", correct: false },
        ],
        order: 2,
      },
      {
        question:
          "Your team chose an approach you disagreed with. In which combination of contexts is it appropriate to keep raising the risks?",
        choices: [
          { id: "a", label: "Standups and team channels, so the team stays alert.", correct: false },
          { id: "b", label: "Retros and demos in front of leadership.", correct: false },
          {
            id: "c",
            label:
              "In private one-on-ones with your manager, framed as \"what would change our minds\" — while supporting the approach publicly.",
            correct: true,
          },
          { id: "d", label: "PR comments, every time the code touches the contested area.", correct: false },
        ],
        order: 3,
      },
    ],
  },
] as const;
