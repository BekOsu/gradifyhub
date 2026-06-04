// Soft Skills — D4: Code Review & Feedback (3 lessons)
export const D4_LESSONS = [
  {
    slug: "ss-reviewing-pr-well-in-10-minutes",
    title: "Reviewing a PR well in 10 minutes",
    description:
      "A triage-first approach to code review that catches the bugs that matter, skips what the linter owns, and leaves the author with a clear next step.",
    dimension: "ss-code-review",
    difficulty: "beginner",
    estimatedMinutes: 15,
    order: 1,
    content: `## Why it matters
Code review is the single highest-leverage thing engineers do for each other, and the single most common place teams waste hours. A bad review nitpicks formatting, ignores a security hole, and ends with "looks good?" leaving the author unsure whether to merge. A good review takes ten minutes, catches the one bug that matters, and ends with an unambiguous next step. The difference is not seniority. The difference is a small set of habits anyone can adopt on their next PR. When you review well, you save the author a production incident, you teach by example, and you build the trust that lets your own PRs move fast. When you review badly, you become the bottleneck everyone routes around.

## What to know
- Comment on three things only: correctness (does it do what the description says?), security (auth, input validation, secrets, SQL injection), and breaking changes (API shape, database migrations, anything downstream depends on). Everything else is secondary.
- Do not comment on style. If your team has a linter and a formatter, style is already decided. Comments like "use const here" or "prefer arrow function" are noise that buries the one comment that matters.
- Use the approve-with-suggestions pattern: if the PR is correct and safe, approve it and leave non-blocking suggestions in the same review. This unblocks the author immediately and trusts them to act on the suggestions or push back.
- End every review with a clear next step. Either "approved, merge when CI is green," "approved with two suggestions, your call," or "requesting changes — see comment on line 47." Never end with ambiguity.
- Phrase comments as questions, not statements. "What happens if userId is null here?" lands very differently from "this will crash if userId is null." The question invites the author to think; the statement invites them to defend.

## How to use it
You have ten PRs in your queue and one hour. You cannot give each PR six minutes of equal attention — that produces shallow reviews on every one. Instead, triage. Spend the first five minutes scanning all ten: read the title, the description, and the diff size. Sort them into three buckets. Bucket one: small, low-risk changes (config tweaks, copy edits, dependency bumps) — approve these in under two minutes each unless something jumps out. Bucket two: medium changes touching business logic — give these the full ten-minute correctness-security-breaking pass. Bucket three: large changes or anything touching auth, payments, or migrations — these need real time, and if you cannot give them thirty minutes today, say so in a comment and pick them up tomorrow rather than rubber-stamp them.

## Assessment-style scenario
You open a PR titled "fix typo in error message." The diff is three lines. The author is a senior engineer. You also notice they renamed a function from getUserById to fetchUser in the same commit. What do you do?

The rename is a scope creep that may break callers. Approve the typo fix, but leave one comment: "The rename to fetchUser is unrelated to the typo fix and changes the public API of this module — can we split it into a second PR so it gets its own review and shows up clearly in git blame?" That is the approve-with-suggestions pattern doing its job: you unblock the small fix, you flag the real risk, and you leave the next step to the author.

## Key Takeaways
- Review for correctness, security, and breaking changes. Let the linter handle style.
- Approve-with-suggestions unblocks the author and trusts them with the small stuff.
- Always end with an unambiguous next step.
- Phrase comments as questions to invite thinking instead of defense.
- Triage your queue before you review — not every PR deserves the same depth.`,
    quizzes: [
      {
        question:
          "You are reviewing a PR that adds a new payment endpoint. The code is correct, but the variable names use camelCase where your codebase prefers snake_case. There is also a missing input validation on the amount field that could allow negative charges. What is the right review action?",
        choices: [
          {
            id: "a",
            label: "Request changes for both the naming convention and the missing validation, since consistency matters.",
            correct: false,
          },
          {
            id: "b",
            label: "Approve-with-suggestions: block on the missing validation, leave the naming as a non-blocking comment and trust the linter or the author to handle it.",
            correct: true,
          },
          {
            id: "c",
            label: "Approve the PR and mention both issues in Slack later so the author can fix them in a follow-up.",
            correct: false,
          },
          {
            id: "d",
            label: "Request changes and ask the author to also add unit tests for the naming convention.",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "Which review comment best follows the question-not-statement rule?",
        choices: [
          {
            id: "a",
            label: "This is wrong, you need to handle the null case.",
            correct: false,
          },
          {
            id: "b",
            label: "Please fix the null handling here before I can approve.",
            correct: false,
          },
          {
            id: "c",
            label: "What happens here if the response body is empty? I want to make sure we do not crash the consumer.",
            correct: true,
          },
          {
            id: "d",
            label: "Null handling missing.",
            correct: false,
          },
        ],
        order: 2,
      },
      {
        question:
          "You have ten PRs and one hour. One of them is a 600-line refactor of your authentication module. You realistically have fifteen minutes left after the other nine. What is the correct move?",
        choices: [
          {
            id: "a",
            label: "Skim the auth PR in fifteen minutes and approve if nothing obvious jumps out — the author is trusted.",
            correct: false,
          },
          {
            id: "b",
            label: "Approve-with-suggestions and trust CI to catch any real problems in the auth refactor.",
            correct: false,
          },
          {
            id: "c",
            label: "Leave a comment that you have flagged it for a proper review tomorrow morning, and do not approve it in fifteen rushed minutes.",
            correct: true,
          },
          {
            id: "d",
            label: "Request changes asking the author to split the PR into ten smaller PRs so you can review each in one minute.",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },
  {
    slug: "ss-receiving-critical-feedback",
    title: "Receiving critical feedback without going defensive",
    description:
      "How to separate signal from delivery when a reviewer hands you a wall of red, so you keep growing instead of relitigating the comments.",
    dimension: "ss-code-review",
    difficulty: "intermediate",
    estimatedMinutes: 20,
    order: 2,
    content: `## Why it matters
The engineers who plateau are not the ones who get the most critical feedback — they are the ones who treat critical feedback as an attack. Defensiveness shows up as long replies explaining why each comment is wrong, "yes but" before every change, and a slow erosion of reviewers' willingness to leave honest comments on your PRs. Once that erosion sets in, you stop getting real review — you get rubber stamps, and your growth stalls. Receiving feedback gracefully is not about being a doormat. It is about extracting maximum signal from every review while keeping reviewers willing to invest in you again.

## What to know
- Use the 24-hour pause. If a review lands and your first reaction is heat, close the tab. Nothing about the PR will be worse for the wait, and your reply will be ten times better. The pause is not weakness; it is the standard professional move.
- Separate signal from delivery. A senior who writes "this is hard to read" is rude in delivery but probably correct in signal. Extract the signal — what specifically is hard to read — and ignore the tone. If the delivery is a persistent pattern, raise it with your manager privately, not in the PR thread.
- Use the "yes, and" reframe instead of "yes, but." "Yes, and I will add a unit test for that case" moves the work forward. "Yes, but the rest of the file does it this way" slides into debate. "Yes, and" keeps you in build mode; "yes, but" puts you in defend mode.
- Know when to push back and when to incorporate. Push back when the reviewer has misunderstood the requirement, when their suggestion would break a contract they do not know about, or when the cost of the change is materially higher than the benefit and you can show that with evidence. Incorporate when it is a matter of taste, when the cost is low, or when you are unsure — the cheapest path to learning is just trying the suggestion.
- Thank the reviewer in writing. After merge, leave one sentence: "thanks for the thorough review, the null-handling catch saved us a production bug." A thirty-second action that compounds across years.

## How to use it
A senior leaves eight critical comments on your PR including "this is hard to read." Your gut wants to reply now. Do not. Close the tab. Tomorrow, read each comment as if it were on someone else's PR. Group them — probably five of the eight are saying the same thing in different ways, namely that the function is doing too much. Extract two helpers and the readability problem dissolves, resolving five comments in one commit. For the remaining three, decide per comment: incorporate, push back with evidence, or ask a clarifying question. Push the commit, reply briefly to each thread with what you did, and after merge leave one thank-you.

## Assessment-style scenario
A reviewer comments "why are you doing it this way? this is overcomplicated." You spent three days designing this specifically to handle a concurrency edge case the reviewer may not know about. What is your first move?

Not a defense, and not a silent capitulation. Ask a clarifying question that surfaces the constraint: "Open to simplifying — the current shape exists because of the race condition we hit on the checkout flow last quarter where two concurrent writes corrupted the cart. Is there a simpler shape that still handles that case, or were you thinking we accept that risk?" Now the reviewer has the missing context, and the conversation is about the real tradeoff instead of who is right.

## Key Takeaways
- The 24-hour pause is the standard professional move for hot feedback.
- Separate signal from delivery — extract the lesson, drop the tone.
- "Yes, and" keeps you building; "yes, but" puts you in defend mode.
- Push back with evidence and shared constraints, not with feelings.
- Thank the reviewer in writing after merge. It compounds.`,
    quizzes: [
      {
        question:
          "A senior leaves eight critical comments on your PR, including the line 'this is hard to read.' You feel your face get hot. Your strongest next move is:",
        choices: [
          {
            id: "a",
            label: "Reply now to each comment explaining your reasoning, while the context is fresh.",
            correct: false,
          },
          {
            id: "b",
            label: "Close the tab, take the 24-hour pause, and re-read the review tomorrow as if it were on someone else's PR.",
            correct: true,
          },
          {
            id: "c",
            label: "Ping the senior in DMs to clarify which comments are actually blocking.",
            correct: false,
          },
          {
            id: "d",
            label: "Approve and merge anyway since most of the comments are stylistic.",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "Which response to a review comment best demonstrates the 'yes, and' reframe?",
        choices: [
          {
            id: "a",
            label: "Yes, but the existing code in the rest of the file does it the same way.",
            correct: false,
          },
          {
            id: "b",
            label: "I disagree — this is a matter of preference, not correctness.",
            correct: false,
          },
          {
            id: "c",
            label: "Yes, and I will also add a unit test for the empty-list case so we do not regress.",
            correct: true,
          },
          {
            id: "d",
            label: "Sure, whatever you want.",
            correct: false,
          },
        ],
        order: 2,
      },
      {
        question:
          "A reviewer suggests a change that would break a downstream contract you know about and they do not. What is the right move?",
        choices: [
          {
            id: "a",
            label: "Incorporate the change silently to avoid a debate.",
            correct: false,
          },
          {
            id: "b",
            label: "Reply explaining that you have been working on this longer and know more about the constraint.",
            correct: false,
          },
          {
            id: "c",
            label: "Push back with the specific evidence: name the downstream contract, link the consumer, and propose an alternative that respects both concerns.",
            correct: true,
          },
          {
            id: "d",
            label: "Escalate to your manager so they can override the reviewer.",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },
  {
    slug: "ss-pair-programming-and-rubber-duck",
    title: "Pair programming and rubber-duck calls",
    description:
      "How to structure pair and rubber-duck sessions so they unblock without burning a full day, using driver/navigator and async Loom alternatives.",
    dimension: "ss-code-review",
    difficulty: "advanced",
    estimatedMinutes: 25,
    order: 3,
    content: `## Why it matters
Pairing is one of the most powerful tools in engineering and one of the most misused. Done well, it collapses a three-day bug into a forty-minute call. Done badly, it is two engineers staring at the same screen for four hours, neither willing to take the keyboard, both exhausted. Most teams default to "let's hop on a call" the moment anyone is stuck, and most of those calls produce less than a focused fifteen-minute message thread would. The advanced skill is knowing when pairing pays off, how to structure the session, and when to substitute a rubber-duck Loom or async exchange instead.

## What to know
- Use the driver/navigator pattern explicitly. The driver has the keyboard and types. The navigator does not touch the keyboard — they read one step ahead, hold the plan in their head, and call out the next move. Swap roles every twenty-five minutes on a timer. Without explicit roles, both engineers compete for the keyboard or both go passive, and the session degrades into watching.
- Pairing accelerates when the problem is unfamiliar to at least one person, when the cost of a wrong direction is high (production data, auth, payments), or when a junior needs to absorb tacit knowledge that does not fit in a doc. Pairing taxes when the work is mechanical or when one person is significantly more capable on this code — in that case the other person ends up watching, not learning.
- Rubber-ducking on Loom is the cheapest unblock. Record five minutes walking through the bug as if explaining it: what you expected, what happened, what you tried. Send the link. Half the time you solve it mid-recording. The other half, your colleague replies in writing in three minutes instead of giving you a forty-minute call.
- Debug together without ego. The most expensive moment in any pair session is when one person says "no, that cannot be the bug" without checking. The rule is "we run the experiment, we do not argue about the experiment." This rule alone shortens most debugging by half.
- Time-box to forty minutes with a hard stop. If the bug is not closed, take ten minutes apart, then decide: another forty, or split async. Open-ended pairing destroys both people's energy for the rest of the day.

## How to use it
A junior asks to pair on a three-day bug. They have tried four approaches. Do not just hop on a call. Spend five minutes async first: ask them to send the four things they tried, what they expected, and what happened. Half the time you spot the issue from the message alone. If you still need to pair, set the frame before the call: "Forty minutes. You drive first. I navigate. We run every experiment, no arguing. Hard stop at the mark." On the call, ask three questions before suggesting anything: what is the smallest reproducer, what assumption have we not verified, and what would have to be true for this code to produce the observed output? Often the third question breaks the bug open. Swap roles at the midpoint. At forty minutes, stop. If unsolved, split: junior writes a failing test, you take it from there, regroup tomorrow.

## Assessment-style scenario
Twenty minutes into a pair session, your teammate says "no, the database is definitely not the issue, I checked yesterday." You suspect it is. What do you do?

Run the experiment. The pairing rule is no arguing about experiments — you check. Suggest a two-minute test: query the row directly and compare to what the code expects. If the database is fine, you lost two minutes and ruled out a hypothesis cleanly. If it is the bug, you saved the rest of the session. Either way you reinforce the norm: in this pair, we test, we do not debate.

## Key Takeaways
- Driver/navigator with a twenty-five-minute swap timer keeps both engineers active.
- Pair when the cost of being wrong is high or when tacit knowledge needs transfer. Skip for mechanical work.
- Rubber-duck on Loom before scheduling a live call — it is the cheapest unblock available.
- Run the experiment. Never argue about a check that takes two minutes.
- Hard stop at forty minutes. Regroup or split async. Do not let pair sessions sprawl.`,
    quizzes: [
      {
        question:
          "A junior asks to pair on a three-day bug. They have already tried four approaches. What is the best first move?",
        choices: [
          {
            id: "a",
            label: "Hop on a call immediately — three days is too long, they need help now.",
            correct: false,
          },
          {
            id: "b",
            label: "Ask them to send what they tried, what they expected, and what happened — async first, then decide if a live pair is needed.",
            correct: true,
          },
          {
            id: "c",
            label: "Tell them to keep trying for another day and come back if still stuck.",
            correct: false,
          },
          {
            id: "d",
            label: "Take the bug from them and solve it yourself so they can move to the next ticket.",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "Twenty minutes into a pair session, your partner says 'no, the database is definitely not the issue, I checked yesterday.' You suspect it is. What do you do?",
        choices: [
          {
            id: "a",
            label: "Defer to them since they checked yesterday and you did not.",
            correct: false,
          },
          {
            id: "b",
            label: "Argue your case — explain why you think it is the database before moving on.",
            correct: false,
          },
          {
            id: "c",
            label: "Suggest a two-minute experiment: query the row directly and compare to what the code expects. Run the test, do not debate it.",
            correct: true,
          },
          {
            id: "d",
            label: "End the pair session and check the database on your own time.",
            correct: false,
          },
        ],
        order: 2,
      },
      {
        question:
          "You are forty minutes into a pair session and the bug is not solved. Both of you are tired. What is the right move?",
        choices: [
          {
            id: "a",
            label: "Push through another hour — momentum matters and stopping now loses context.",
            correct: false,
          },
          {
            id: "b",
            label: "Hard stop. Take ten minutes apart, then either commit to another forty or split the work async with a written handoff.",
            correct: true,
          },
          {
            id: "c",
            label: "Have your partner finish it alone since you have other work to do.",
            correct: false,
          },
          {
            id: "d",
            label: "Escalate the bug to a senior engineer immediately.",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },
] as const;
