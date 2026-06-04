// Soft Skills — D3: Async-First Collaboration (3 lessons)
export const D3_LESSONS = [
  {
    slug: "ss-loom-written-standups-shipping-without-meetings",
    title: "Loom + written standups: shipping without meetings",
    description:
      "Replace meeting overhead with 60-second Loom videos and a tight written standup template so the team ships instead of syncing.",
    dimension: "ss-async-collab",
    difficulty: "beginner",
    estimatedMinutes: 15,
    order: 1,
    content: `## Why it matters
When a team has four meetings a day, every engineer loses two to three hours of deep work. That is the time when real shipping happens. Async-first teams replace most of those meetings with two small habits: short Loom recordings and a written standup. The result is the same information shared, but recipients consume it when they are ready, in two minutes instead of thirty, and the calendar opens back up. Loom and written standups are the cheapest, fastest lever a junior engineer can pull to win back focus time for the whole team.

The second reason this matters: written and recorded artifacts create a searchable record. A meeting decision lives in someone's head. A Loom and a Slack standup live in the team's history, ready for the engineer who joins next month or the teammate who was on PTO.

## What to know
- The 60-second Loom rule: if you cannot explain it in 60 seconds, you have not thought hard enough about it. Open Loom, screen-share the relevant tab, narrate the change or question, paste the link in the team channel. No editing, no retakes.
- Written standup template, posted in your team's Slack standup channel each morning: Yesterday, Today, Blockers, Asks. Three to five bullets total. Link the PRs, link the Notion docs, tag the person you need a decision from.
- When to escalate async to sync: after one round of written clarification has failed, when the topic involves emotion or conflict, when more than three people are blocked, or when the decision needs to be made in the next two hours. Everything else stays async.
- Tools to name by default: Loom for video, Slack for written standups and ad-hoc updates, Notion for the canonical doc, Linear or GitHub for the linked work item.

## How to use it
Your team has four meetings a day and shipping has slowed. You have noticed engineers context-switching all morning and shipping nothing before lunch. Propose the alternative in one Slack message to your team lead. Suggest cancelling the daily standup meeting and replacing it with a written standup in a dedicated Slack channel by 10am local time, with a 60-second Loom attached whenever someone needs to demo or explain. Keep the weekly planning sync, but convert the design review and the daily check-in into Loom plus written standups. Offer to run a two-week trial and measure pull requests merged per engineer per week before and after.

## Assessment-style scenario
You join a team where the lead insists on a 30-minute video call to review every pull request. You see three PRs sitting open for two days because the lead has been in other meetings. What do you write back, and what do you propose instead? Your answer should reference the 60-second Loom rule and the written standup template, and it should suggest a measurable trial period rather than a permanent policy change.

## Key Takeaways
- Default to async: Loom video for demos, written standup for daily status.
- A 60-second Loom replaces most 30-minute meetings.
- Standup template is four lines: Yesterday, Today, Blockers, Asks.
- Escalate to a live call only when emotion, conflict, or a two-hour deadline forces it.`,
    quizzes: [
      {
        question:
          "Your team lead schedules a 30-minute meeting to walk through your PR. You have already written a clear PR description. What is the most async-first response?",
        choices: [
          {
            id: "a",
            label: "Accept the meeting and prepare a slide deck for the walkthrough.",
            correct: false,
          },
          {
            id: "b",
            label: "Reply with a 60-second Loom recording of the PR diff and ask them to leave review comments inline, offering to jump on a call only if blockers remain.",
            correct: true,
          },
          {
            id: "c",
            label: "Decline the meeting and ask them to read the code more carefully.",
            correct: false,
          },
          {
            id: "d",
            label: "Cancel the PR and rewrite it so no walkthrough is needed.",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "Which item does NOT belong in a four-line written standup posted in Slack each morning?",
        choices: [
          {
            id: "a",
            label: "Yesterday: shipped PR #1042 to staging.",
            correct: false,
          },
          {
            id: "b",
            label: "Today: pair on the migration with Sara at 2pm.",
            correct: false,
          },
          {
            id: "c",
            label: "Blockers: waiting on design tokens from Notion page X.",
            correct: false,
          },
          {
            id: "d",
            label: "A 400-word reflection on yesterday's emotional state and team dynamics.",
            correct: true,
          },
        ],
        order: 2,
      },
      {
        question:
          "A production bug is causing failed checkouts for paying customers right now. Three engineers need to coordinate within the next 30 minutes. Should this stay async?",
        choices: [
          {
            id: "a",
            label: "Yes, post a Loom and wait for everyone to respond when they have time.",
            correct: false,
          },
          {
            id: "b",
            label: "No, this hits the two-hour-deadline criterion and involves more than three blocked people, so escalate to a live call immediately.",
            correct: true,
          },
          {
            id: "c",
            label: "Yes, write a Notion doc and link it in three different channels.",
            correct: false,
          },
          {
            id: "d",
            label: "No, send the issue to your manager and stop working on it yourself.",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },
  {
    slug: "ss-slack-notion-etiquette",
    title: "Slack and Notion etiquette in an engineering team",
    description:
      "Pick the right channel, the right mention, and the right Notion structure so information travels without burning out everyone's attention.",
    dimension: "ss-async-collab",
    difficulty: "intermediate",
    estimatedMinutes: 20,
    order: 2,
    content: `## Why it matters
Slack and Notion are the nervous system of a modern engineering team. Used well, they let twenty engineers across six time zones make decisions faster than ten engineers in one room. Used badly, they generate so much noise that critical messages get buried, on-call engineers burn out from notification fatigue, and decisions get re-litigated every two weeks because nobody can find where the answer was written down. Etiquette is not a soft topic. It is the difference between a team that ships and a team that drowns in its own communication.

A junior engineer who masters channel choice, mention discipline, and Notion structure becomes disproportionately valuable. You become the person whose messages get answered first because people know your pings are signal, not noise.

## What to know
- Thread vs DM vs channel: use a thread when you are replying to a specific message or asking a follow-up that only concerns part of the channel. Use a DM only for truly private content (personal feedback, salary, anything you would not say aloud at standup). Use a channel for anything teammates might benefit from seeing in six months. Default to channel-first, thread-heavy, DM-rarely.
- At-mention discipline: @channel pulls every member; reserve it for outages or urgent all-hands moments. @here pulls only active members; use it for time-sensitive but non-critical asks. @user is for a specific person who must act. If you are not sure, do not @ at all and trust the channel.
- Emoji as acknowledgement: a thumbs-up or eyes reaction means "I saw this" or "I am on it." This is a real communication act that saves a "got it" message and keeps threads clean.
- Notion page structure: TL;DR at the top in three lines, decisions linked inline with the date and decider, a status pill at the page header (Draft, In Review, Decided, Archived), table of contents for anything over 800 words.
- EOD vs respond-when-you-can: tag your asks. "Need by EOD Friday" or "Respond when you can, no rush." Without this, every message reads as urgent and nobody can prioritise.

## How to use it
A critical bug is in production and you need three people: the on-call engineer, the database owner, and the product manager who knows the customer impact. You post in #incidents, not in DMs. You write a one-line summary, link the Sentry alert, and use @here so only the people online see it. You @ the on-call engineer by name because they must act now. You do not @ the database owner if you only need them in 30 minutes, you reply in thread once you confirm the database is involved. You open a Notion incident page in parallel with a TL;DR, a status pill set to In Review, and a timeline section that you update every 10 minutes. The PM gets a Slack DM only if their input is private to the customer relationship.

## Assessment-style scenario
Critical bug in prod. You need three people fast. Which channel do you use, which mentions do you send, and what does your first message contain? Your answer must justify why a public channel beats DMs, why @here is safer than @channel for most production incidents, and how the Notion page complements the Slack thread rather than duplicating it.

## Key Takeaways
- Channel-first, thread-heavy, DM-rarely.
- @channel for outages, @here for time-sensitive, @user for must-act, no mention otherwise.
- Emoji reactions are real acknowledgements and reduce thread noise.
- Every Notion page has a TL;DR, a status pill, and linked decisions.
- Tag urgency on every ask so teammates can prioritise.`,
    quizzes: [
      {
        question:
          "You discover a regression at 11pm that will affect customers by morning. The on-call rotation lists Maria. What is the right communication move?",
        choices: [
          {
            id: "a",
            label: "Send a DM to your manager and wait until they reply.",
            correct: false,
          },
          {
            id: "b",
            label: "Post in #incidents with @Maria, a Sentry link, and a one-line summary, then open a Notion incident page with a status pill of In Review.",
            correct: true,
          },
          {
            id: "c",
            label: "Use @channel in the general team channel to maximise visibility.",
            correct: false,
          },
          {
            id: "d",
            label: "Write a long-form post in your personal notes and share it tomorrow morning.",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "A teammate posts a design decision in #engineering. You agree with it but have no follow-up. What is the lowest-noise way to acknowledge?",
        choices: [
          {
            id: "a",
            label: "Reply in thread with a paragraph explaining your reasoning.",
            correct: false,
          },
          {
            id: "b",
            label: "Send them a DM saying you agree.",
            correct: false,
          },
          {
            id: "c",
            label: "Add a thumbs-up reaction to the original message so they see acknowledgement without thread noise.",
            correct: true,
          },
          {
            id: "d",
            label: "Use @channel to broadcast that you support the decision.",
            correct: false,
          },
        ],
        order: 2,
      },
      {
        question:
          "You are writing a Notion page summarising the database migration plan. The page is 1,200 words. What must be present at the top?",
        choices: [
          {
            id: "a",
            label: "A long historical context section explaining how the project started.",
            correct: false,
          },
          {
            id: "b",
            label: "A three-line TL;DR, a status pill (Draft, In Review, Decided, or Archived), and a table of contents.",
            correct: true,
          },
          {
            id: "c",
            label: "A list of every engineer who has ever touched the database.",
            correct: false,
          },
          {
            id: "d",
            label: "An embedded Loom recording and nothing else.",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },
  {
    slug: "ss-decision-logs-survive-departure",
    title: "Decision logs that survive your departure",
    description:
      "Build a lightweight decision log so the engineer who joins after you leave never has to ask why the team chose X over Y.",
    dimension: "ss-async-collab",
    difficulty: "advanced",
    estimatedMinutes: 25,
    order: 3,
    content: `## Why it matters
Every engineering team carries a graveyard of decisions: why we picked Postgres over DynamoDB, why we run our own auth instead of using a vendor, why the checkout flow has that strange retry. When the engineer who made those decisions leaves, the reasoning leaves with them. Two years later, a new engineer rips out the strange retry, ships to production, and the bug it was guarding against reappears. A decision log is the cheapest insurance policy against that pattern. It is the artefact that lets a team survive turnover without losing its institutional memory.

For a senior engineer or tech lead, the decision log is also a credibility signal. Teams that maintain one are taken seriously by leadership because they can answer "why" in addition to "what." The log shows that decisions are deliberate, not accidental, and that the team has a culture of writing things down.

## What to know
- Lightweight format, one Notion page per decision: Title, Date, Decider, Status (Proposed, Accepted, Superseded), Context (three to six sentences on the problem), Options Considered (a table of two to four options with one-line pros and cons), Decision (one paragraph), Consequences (three bullets on what this commits us to and what it locks out).
- Who-decided-what-when-why is non-negotiable. Every decision log entry must answer four questions in the first paragraph: who decided, what we decided, when, and why. If any of those is missing, the entry is incomplete.
- Linking from code: when a decision affects a specific module, add a one-line comment in the source file linking to the decision log entry. Example comment: see decision log entry 0042 for why retry is two attempts, not three. The reverse link (from the decision log back to the file path) goes in the Consequences section.
- The six-month-future-you test: before you publish a decision entry, read it as if you are a new engineer joining in six months with zero context. If you cannot answer "should I change this?" from the entry alone, rewrite it. This test catches most of the entries that look fine to the author but are useless to a stranger.
- Decision logs are not meeting minutes. Capture the decision and the reasoning, not the back-and-forth.

## How to use it
You are leaving the team in 30 days. Spend the last four weeks creating decision log entries for the ten most consequential design choices made in your two years on the team. Walk through the codebase with grep, find the modules where you remember a non-obvious choice was made, and write one entry per choice. For each entry, link the relevant source files and add a comment in the code pointing back to the entry. Ask a teammate who was not in the original decision to read each entry and tell you whether they could now answer "should I change this?" If they cannot, rewrite until they can. Hand the log to the next engineer on your last day and walk through it for 30 minutes on a Loom recording so they have your voice as a backup.

## Assessment-style scenario
You are leaving in 30 days. The team has no decision log today. You cannot document everything. What entries do you write first, what format do you use, and how do you make sure the next engineer actually finds them? Your answer should reference the lightweight format, the six-month-future-you test, the practice of linking from code back to the log, and a strategy for prioritising the most consequential ten decisions over the easy thirty.

## Key Takeaways
- Every entry answers who, what, when, why in its first paragraph.
- Format is Title, Date, Decider, Status, Context, Options, Decision, Consequences.
- Link from the source file to the log entry, and back from the entry to the file.
- Apply the six-month-future-you test before publishing.
- Prioritise the ten most consequential decisions over the easy thirty.`,
    quizzes: [
      {
        question:
          "You are writing a decision log entry on choosing Postgres over DynamoDB. Which element is most important to include and is most often missed?",
        choices: [
          {
            id: "a",
            label: "A long historical timeline of every database you have ever used.",
            correct: false,
          },
          {
            id: "b",
            label: "The Options Considered table with one-line pros and cons for each alternative, so a future reader can see what was rejected and why.",
            correct: true,
          },
          {
            id: "c",
            label: "A list of every team member who attended the decision meeting.",
            correct: false,
          },
          {
            id: "d",
            label: "Screenshots of vendor pricing pages.",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "A teammate reads your decision log entry on the checkout retry policy and says, 'I cannot tell if I am allowed to change this.' What does this tell you?",
        choices: [
          {
            id: "a",
            label: "They should read the source code more carefully.",
            correct: false,
          },
          {
            id: "b",
            label: "The entry has failed the six-month-future-you test and the Consequences section needs to be rewritten so a future engineer can decide whether to change the policy.",
            correct: true,
          },
          {
            id: "c",
            label: "The decision should be re-made in a live meeting.",
            correct: false,
          },
          {
            id: "d",
            label: "The retry policy should be removed from the codebase.",
            correct: false,
          },
        ],
        order: 2,
      },
      {
        question:
          "You add a strange-looking guard clause in a module and you know future engineers will be tempted to delete it. What is the highest-leverage thing to do alongside writing the decision log entry?",
        choices: [
          {
            id: "a",
            label: "Hide the code in a deeply nested file so no one finds it.",
            correct: false,
          },
          {
            id: "b",
            label: "Add a one-line source comment pointing to the decision log entry number, and add the file path under Consequences in the log entry.",
            correct: true,
          },
          {
            id: "c",
            label: "Send a recurring Slack reminder every month explaining the guard.",
            correct: false,
          },
          {
            id: "d",
            label: "Encrypt the file so only senior engineers can read it.",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },
] as const;
