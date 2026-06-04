// English Proficiency — D5: Cross-Cultural Engineering Communication (3 lessons)
export const D5_LESSONS = [
  {
    slug: "eng-async-timezone-communication",
    title: "Async + timezone communication",
    description:
      "Replace ambiguous words like 'tomorrow' with explicit times, timezone abbreviations, and a clear no-implied-urgency rule so distributed teams stop missing deadlines.",
    dimension: "eng-cross-cultural",
    difficulty: "beginner",
    estimatedMinutes: 15,
    order: 1,
    content: `## Why it matters
Distributed engineering teams run on written messages that cross timezone lines while the sender sleeps. The single most expensive habit in async work is using relative time words like "tomorrow", "EOD", "first thing", or "later today" without anchoring them to a clock or a zone. The cost is not just confusion. It is missed reviews, blocked PRs, customers waiting an extra cycle, and slow erosion of trust because the same engineer keeps appearing to ignore the same request. Once you internalize a few small habits around explicit times and stated urgency, you stop being the person who accidentally creates day-long delays. You become the person whose messages other engineers actually act on, because they know exactly what is being asked and by when.

## What to know
- "Tomorrow" is ambiguous the moment two clocks are involved. If you write "tomorrow" at 18:00 your time and your reader opens it at 09:00 their time, they may already be in your "tomorrow" or still in your "today". Always anchor to a clock and a zone.
- Use timezone abbreviations the reader can decode without thinking. UTC works for any global team. ET, PT, CET, GMT, GST, IST, SGT are widely recognized within their regions. If unsure, give both a local time and a UTC offset, for example "Thursday 14:00 UTC, which is 10:00 ET / 16:00 CET".
- The "I'll follow up in your morning" pattern is a small phrase that respects the reader's day. Instead of "reply when you can", say "no rush, I'll read your reply in your morning". It signals you do not expect them to wake up for this.
- The no-implied-urgency rule: if the message is not urgent, say so explicitly. Most readers default to "this person is online and waiting" when they see a Slack ping. Adding "no rush, end of week is fine" frees them from that anxiety. If it is urgent, name a real deadline with a time and zone, and say why.
- These conventions are heuristics, not laws. Some teams use only UTC. Some regions and individuals prefer 12-hour clocks with AM and PM. Watch what your team uses in practice and match it.

## Scenario
A backend engineer in London pings a frontend engineer in San Francisco at 17:30 London time on Tuesday with: "can you review this tomorrow?" The London engineer logs off. The San Francisco engineer reads it at 10:00 their time on Tuesday, which is already 18:00 in London. They are confused — does "tomorrow" mean London-tomorrow or their tomorrow? They assume it can wait, work on something else, and ping back near end of their Tuesday with a question. The London engineer is now asleep. The review does not happen until Wednesday London time, which is Thursday for the rollout window.

## The misfire
The PR sits unreviewed for almost two full working days. The London engineer comes back Wednesday morning frustrated, assuming the San Francisco engineer ignored the request. The San Francisco engineer assumes the London engineer set no real deadline. Both are working in good faith. The only failure is the word "tomorrow" carrying two different meanings and no anchor.

## The recovery
A skilled engineer writes: "Could you review PR #1242 before Wednesday 14:00 UTC, which is 06:00 your time? No need to start before your morning — I'll be online from 08:00 UTC to merge. If that timing slips, ping me and I'll cover it from my side." This message names the deadline, gives both timezones, removes implied urgency, and offers a fallback. The reader knows exactly what is being asked, when, and what happens if they cannot.

## Practice prompts
- Rewrite "can you ship this EOD?" so a teammate three timezones away can act on it without guessing.
- A colleague in Singapore asks for a review "first thing in the morning". Reply in a way that confirms the time without making assumptions about whose morning.
- Draft a one-line follow-up to a PR review request sent 18 hours ago that does not pressure the reader but makes the deadline real.`,
    quizzes: [
      {
        question:
          "You are in Berlin and need a code review from a teammate in New York. You write 'can you look at this tomorrow?' at 17:00 Berlin time. What is the most likely outcome?",
        choices: [
          {
            id: "a",
            label: "The teammate reads it in their morning and immediately understands which day you mean.",
            correct: false,
          },
          {
            id: "b",
            label: "The teammate is unsure whether 'tomorrow' refers to your day or theirs and may delay action by up to a full working day.",
            correct: true,
          },
          {
            id: "c",
            label: "Slack converts the word 'tomorrow' to the reader's timezone automatically.",
            correct: false,
          },
          {
            id: "d",
            label: "The teammate will treat it as urgent because relative time words always imply urgency.",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "Which phrasing best applies the no-implied-urgency rule for a non-urgent PR review across timezones?",
        choices: [
          {
            id: "a",
            label: "Please review ASAP, thanks!",
            correct: false,
          },
          {
            id: "b",
            label: "Can you get to this today?",
            correct: false,
          },
          {
            id: "c",
            label: "No rush — I'll pick this back up in your morning. End of week is fine if that works better.",
            correct: true,
          },
          {
            id: "d",
            label: "Ping me when done.",
            correct: false,
          },
        ],
        order: 2,
      },
      {
        question:
          "Your team has engineers in San Francisco, London, and Bangalore. Which deadline format reduces back-and-forth the most?",
        choices: [
          {
            id: "a",
            label: "By end of day Thursday.",
            correct: false,
          },
          {
            id: "b",
            label: "Thursday 16:00 UTC (09:00 PT / 17:00 BST / 21:30 IST).",
            correct: true,
          },
          {
            id: "c",
            label: "Whenever you get a chance this week.",
            correct: false,
          },
          {
            id: "d",
            label: "Tomorrow at 4.",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },
  {
    slug: "eng-tone-calibration-directness-regions",
    title: "Tone calibration — directness across regions",
    description:
      "Use regional baselines for directness as rough heuristics, match the room without becoming a chameleon, and soften the ask without softening the requirement.",
    dimension: "eng-cross-cultural",
    difficulty: "intermediate",
    estimatedMinutes: 20,
    order: 2,
    content: `## Why it matters
Most cross-cultural friction in engineering teams is not about language ability. It is about tone. An engineer whose written English is technically perfect can still land messages that feel cold to one teammate, pushy to another, and evasive to a third — all from the same words. The cost is real: messages get re-read for hidden meaning, follow-ups arrive defensive, and small decisions stretch into long threads. The fix is not to memorize a stereotype per region. It is to read the room your reader is in and adjust the wrapper of the message without changing what you actually need.

## What to know
- Use regional baselines as rough heuristics only, never as scripts. Individuals vary enormously within any region, and modern teams blend cultures by default. Treat these as starting guesses, then update fast on how each specific person writes.
- US workplace English tends toward direct asks and short, plain phrasing. "Can you do X by Friday?" reads as normal, not blunt. Long formal openings can feel performative.
- Much European workplace English, especially German, Dutch, and French contexts, leans more formal in structure while still direct on substance. Greetings, sign-offs, and surnames carry more weight.
- Many MENA contexts lean relational: a short check-in on the person before the ask is normal, and trust often precedes transactions. Skipping the human layer can read as cold.
- Many SEA contexts (and parts of East Asia) lean more deferential in writing: refusals are softened, agreement may be polite rather than committed. A "we'll see" may be a no.
- Match the room without becoming a chameleon. You do not change your identity. You change the wrapping — greeting, framing, pacing — while keeping your substance the same.
- "Soften the ask, not the requirement": phrase a request more warmly without weakening the deadline or scope. "Could you possibly skip the deadline" is wrong. "Could you walk me through whether Friday is realistic on your side?" is right.

## Scenario
A backend engineer based in Cairo writes to a US-based staff engineer they have never spoken to: "Dear Mr. Johnson, I hope this message finds you well. I am writing to humbly request your kind guidance regarding the authentication module, if it would not be too much trouble for your busy schedule." The US engineer reads this, feels uncertain about the actual question, and skims past it. Two days later the Cairo engineer follows up, more formally still, and the US engineer now feels the message is asking for something large and ceremonial that requires a meeting.

## The misfire
The over-formal opening signals "this is a big, careful ask" to a reader whose default is "we just answer questions". The actual question — a 30-second clarification about a token refresh — gets buried. The US engineer puts it off because it feels heavier than it is. The Cairo engineer feels ignored and assumes the staff engineer is dismissive.

## The recovery
A skilled engineer rewrites: "Hey James — quick one on the auth module. When the refresh token rotates, do we expect the old token to be valid for the 30-second grace window, or should it 401 immediately? I'm seeing both in the code. Happy to jump on a call if it's easier." This keeps respect intact, drops the ceremonial frame, names the exact question, and offers a path to escalate. The reader can answer in one line. Note that the engineer is not pretending to be American; they are simply matching the room they are writing into. In the other direction, a US engineer writing into a more relational or formal room can add a short human opener and a respectful sign-off without changing the substance.

## Practice prompts
- Rewrite an over-formal one-paragraph opening into a single-sentence US-style ask without losing politeness.
- A US engineer needs to ask a European colleague to slip a deadline. Draft the message in a way that respects the more formal frame.
- Draft a refusal to a reasonable but impossible request, written for a reader whose context tends to read soft refusals as "yes".`,
    quizzes: [
      {
        question:
          "An engineer writes a five-line ceremonial opening to a US-based reviewer before asking a one-line technical question. What is the most likely reading by the US reviewer?",
        choices: [
          {
            id: "a",
            label: "They will appreciate the formality and respond more carefully than usual.",
            correct: false,
          },
          {
            id: "b",
            label: "They will assume this is a heavier ask than it actually is and defer it, missing the real question.",
            correct: true,
          },
          {
            id: "c",
            label: "They will copy the formal style in their reply.",
            correct: false,
          },
          {
            id: "d",
            label: "They will escalate the message to their manager out of confusion.",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "Which best captures the 'soften the ask, not the requirement' pattern when a teammate is at risk of missing a hard deadline?",
        choices: [
          {
            id: "a",
            label: "It's totally fine if Friday slips, no worries either way.",
            correct: false,
          },
          {
            id: "b",
            label: "Friday is non-negotiable, please confirm.",
            correct: false,
          },
          {
            id: "c",
            label: "Can you walk me through whether Friday is realistic on your side? If it isn't, I need to know today so I can shift the rollout.",
            correct: true,
          },
          {
            id: "d",
            label: "Just do your best.",
            correct: false,
          },
        ],
        order: 2,
      },
      {
        question:
          "How should you treat regional directness baselines (US direct, EU formal, MENA relational, SEA deferential) when communicating with a specific teammate?",
        choices: [
          {
            id: "a",
            label: "As accurate rules — apply them strictly based on where the person is located.",
            correct: false,
          },
          {
            id: "b",
            label: "As irrelevant — only individual personality matters and regional patterns do not exist.",
            correct: false,
          },
          {
            id: "c",
            label: "As rough starting heuristics that you update quickly based on how the actual individual writes back.",
            correct: true,
          },
          {
            id: "d",
            label: "As a script to mimic so your tone matches theirs exactly.",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },
  {
    slug: "eng-conflict-in-written-english-without-misread",
    title: "Conflict in written English without being misread",
    description:
      "Hold a hard technical disagreement in writing without it being read as a personal attack — using the right opener, separating work from person, and knowing when to switch to voice.",
    dimension: "eng-cross-cultural",
    difficulty: "advanced",
    estimatedMinutes: 25,
    order: 3,
    content: `## Why it matters
The same disagreement that lands cleanly face-to-face will detonate in a PR thread. Written English strips away tone, pacing, eye contact, and the small repair signals humans use to soften critique. Across cultures and timezones the effect is worse. A sharp comment, read at 6am by a tired engineer who has never met you, can read as contempt when you meant curiosity. Once a thread spirals, each reply makes recovery harder, because each side is now defending dignity rather than discussing code. Engineers who handle this well do not avoid conflict. They have it openly, in writing, in a way that keeps the relationship intact and the work moving.

## What to know
- Written conflict misfires more often than spoken conflict. Assume your reader is likely to read your message as harsher than you wrote it, especially if you have never spoken aloud and especially if you are senior to them.
- The "I might be missing context, but..." opener is not weakness. It signals you are open to being wrong, which lowers the reader's defenses and makes the critique land. Other versions: "Just to check my understanding...", "Curious about the trade-off here...", "I'd want to push back — happy to be convinced otherwise".
- Separate critique of work from critique of person. "This function has a race condition under concurrent writes" is critique of work. "You clearly didn't think about concurrency" is critique of person, even if you meant the first. The author hears the second.
- Reference the code, not the author. "The handler in line 84" not "your handler". "This approach" not "your approach". The move costs you nothing and removes a lot of heat.
- Voice beats text once a thread reaches three back-and-forths on the same point. A 10-minute call is cheap. An escalating thread that two managers eventually read is not.
- When you have been misread — the reply is sharp, short, or defensive — do not double down in the thread. Move to DM, acknowledge the misread, offer voice. These are heuristics, not laws; some engineers prefer to stay in text and need extra clarity rather than a call.

## Scenario
A senior engineer in Amsterdam leaves a PR review on a junior engineer's first big change. The comment reads: "This won't scale. Why are we even hashing here?" The junior, based in Jakarta, reads it at 06:30 their time before standup. They feel publicly criticized in front of the team. They reply in the thread: "I followed the pattern from the auth module. If you have a better idea please share." A third engineer chimes in. The thread grows to nine comments. The original technical point — a real concern about hashing on the hot path — gets buried under defensiveness.

## The misfire
The Amsterdam engineer's comment was technically correct but stripped of softening signals. "Why are we even" reads as exasperation, not curiosity. "This won't scale" is an absolute statement with no opening for the author to explain reasoning. The Jakarta engineer hears: "you are not good enough to be writing this code, in front of everyone". They defend themselves publicly. Now both engineers feel attacked. The PR stalls. The manager gets pulled in.

## The recovery
The Amsterdam engineer notices the thread heating up, stops replying in-line, and sends a DM: "Hey — I think my review comment landed harder than I meant. I do have a real concern about hashing on this path under load, but I wrote it like I was annoyed, and I wasn't. Want to jump on a 10-min call so I can walk through what I was actually worried about? Then I'll re-comment more clearly on the PR." On the call, they explain the load pattern, hear the junior's reasoning about the auth-module precedent, and agree on a change. The follow-up PR comment is now: "Talked through this offline — concern is on the hot write path, suggesting we move the hash to the worker. Junior to update, will re-review." Conflict resolved, dignity intact, work moves.

## Practice prompts
- Rewrite "This is wrong, just use Redis" into a PR comment that pushes back hard on the technical choice without attacking the author.
- A teammate replies to your review with a defensive paragraph. Draft the DM that opens recovery without conceding the technical point.
- Decide when to stay in the thread versus switch to voice on a disagreement that has hit three rounds with no convergence.`,
    quizzes: [
      {
        question:
          "A PR comment thread between two engineers in different regions has reached six replies, each more defensive than the last. The original concern is still unresolved. What is the highest-leverage next move?",
        choices: [
          {
            id: "a",
            label: "Reply one more time in the thread with a longer, more carefully worded comment.",
            correct: false,
          },
          {
            id: "b",
            label: "Tag the manager so they can mediate the thread.",
            correct: false,
          },
          {
            id: "c",
            label: "Send a DM acknowledging the thread is heating up and offer a short voice call, then re-comment cleanly on the PR after.",
            correct: true,
          },
          {
            id: "d",
            label: "Close the PR and start a new one to reset the conversation.",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "Which rewrite of 'You clearly didn't think about concurrency here' best separates critique of work from critique of person?",
        choices: [
          {
            id: "a",
            label: "This is really bad concurrency code.",
            correct: false,
          },
          {
            id: "b",
            label: "I might be missing context, but the handler on line 84 looks like it would race under concurrent writes — was there a lock I'm not seeing?",
            correct: true,
          },
          {
            id: "c",
            label: "Please be more careful next time with concurrency.",
            correct: false,
          },
          {
            id: "d",
            label: "Did you even test this?",
            correct: false,
          },
        ],
        order: 2,
      },
      {
        question:
          "An engineer reads your blunt review at the start of their day and replies sharply. You realize they read it as a personal attack. What is the most reliable recovery move?",
        choices: [
          {
            id: "a",
            label: "Reply in the same thread with a long defense of what you originally meant.",
            correct: false,
          },
          {
            id: "b",
            label: "Stop replying entirely and let the thread die.",
            correct: false,
          },
          {
            id: "c",
            label: "DM them, name that the message landed harder than intended, offer a short voice call, then re-comment more clearly on the PR after.",
            correct: true,
          },
          {
            id: "d",
            label: "Escalate to their manager so the misread gets corrected officially.",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },
] as const;
