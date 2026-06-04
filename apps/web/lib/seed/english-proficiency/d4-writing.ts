// English Proficiency — D4: Writing for Clarity (3 lessons)
export const D4_LESSONS = [
  {
    slug: "eng-pr-descriptions-code-comments-english",
    title: "PR descriptions and code comments in English",
    description:
      "Choose tense, voice, and vocabulary that read smoothly to reviewers whose first language is not yours — and write code comments that earn their slot.",
    dimension: "eng-writing",
    difficulty: "beginner",
    estimatedMinutes: 15,
    order: 1,
    content: `## Why it matters
Your pull request is read by a Polish staff engineer at 9am, an Indian tech lead at 2pm, and a Brazilian junior at 11pm. None of them are native English speakers, and none of them have time to translate your prose. The Soft Skills D1-L1 lesson covers the structure of a PR description (the Why/What/Test template). This lesson is about the language inside that structure — the tense you pick, the voice you write in, the vocabulary you reach for. Get this wrong and your good engineering looks sloppy. Get it right and a reviewer in Warsaw reads your PR exactly as fast as your manager reads it. The same applies to code comments: an English comment that confuses three teammates is worse than no comment at all.

## What to know
- Use past tense for Why ("we were dropping webhooks") and present tense for What ("this PR adds a retry queue"). Mixing tenses inside one section is the most common smell in non-native PRs.
- Prefer active voice over passive. "The worker retries failed events" beats "Failed events are retried by the worker" every time. Active voice is shorter, easier to scan, and easier to translate.
- Pick concrete verbs over abstract ones. "Add", "remove", "rename", "split", "merge" — these all map cleanly to diff actions. Avoid "leverage", "facilitate", "utilize". Senior engineers in every country distrust corporate vocabulary.
- Keep sentences under 25 words. Long English sentences with two or three subordinate clauses lose every reader, native or not.
- Code comments should answer "why this is here", never "what this line does". A comment that says "increment counter" next to "counter++" is noise. A comment that says "skip the retry for idempotent Stripe webhooks" is gold.
- Avoid idioms. "Kick the tires", "low-hanging fruit", "boil the ocean" do not survive translation. Say what you mean.

## Compare these
**Good (clear past for problem, present for change, active voice):**
"Why: we dropped 1.2 percent of Stripe webhooks last month, per the Datadog dashboard. What: this PR adds a retries table and a worker that re-runs failed events with backoff. Test: replayed three failed events in staging; dashboard now green."
Rubric: tenses consistent within each section, active voice, concrete verbs, no jargon.

**Okay (right structure, weak verbs and one passive):**
"Why: webhook failures were being observed last month. What: a retry queue is being introduced to handle these. Test: was tested in staging successfully."
Rubric: passive voice everywhere, vague "was tested", reader has to work harder.

**Bad (tense mixing, idiom, corporate noise):**
"Why: we have been seeing some low-hanging fruit around webhook reliability that we wanted to leverage to facilitate a more robust pipeline. What: bunch of changes. Test: lgtm in staging."
Rubric: idiom plus corporate verbs plus no concrete action plus vague test step. Reviewer cannot tell what changed.

## Your turn
Write a Why/What/Test description for this scenario: you renamed the column \`user_email\` to \`primary_email\` across the users table, updated 14 query files, and added a backfill migration. The change unblocks a multi-email feature shipping next quarter. Reviewer is a senior in Berlin.

## Rubric
- Past tense for the problem, present tense for the change
- Active voice in every sentence
- One concrete verb per bullet (rename, update, add, backfill)
- No idioms or corporate verbs (leverage, facilitate, utilize)
- Sentences under 25 words
- Test step states what you verified, not just "tested"`,
    quizzes: [
      {
        question:
          "Which sentence is the strongest opening line for the Why section of a PR description read by a global team?",
        choices: [
          {
            id: "a",
            label:
              "We were going to leverage the existing flow to facilitate a more performant solution.",
            correct: false,
          },
          {
            id: "b",
            label: "We dropped 1.2 percent of Stripe webhooks last month, per the Datadog dashboard.",
            correct: true,
          },
          {
            id: "c",
            label: "There were some webhooks being lost which were being investigated.",
            correct: false,
          },
          {
            id: "d",
            label: "Webhook reliability is a low-hanging fruit we wanted to pick.",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "A reviewer in Warsaw complains your What section is hard to skim. Which rewrite addresses the most common language issue in non-native PRs?",
        choices: [
          {
            id: "a",
            label:
              "Translate the description into Polish so the reviewer reads in their first language.",
            correct: false,
          },
          {
            id: "b",
            label:
              "Switch every sentence from passive to active voice and use concrete verbs (add, remove, rename) instead of abstract ones (leverage, utilize).",
            correct: true,
          },
          {
            id: "c",
            label: "Add more bullet points so the section looks shorter on screen.",
            correct: false,
          },
          {
            id: "d",
            label: "Reduce the description to a single sentence with no detail.",
            correct: false,
          },
        ],
        order: 2,
      },
      {
        question:
          "Which inline code comment earns its slot next to a line that reads `if (event.idempotencyKey) return;`?",
        choices: [
          {
            id: "a",
            label: "// returns if idempotency key is truthy",
            correct: false,
          },
          {
            id: "b",
            label: "// check key",
            correct: false,
          },
          {
            id: "c",
            label: "// Stripe replays send the same key — skip to avoid double-charging the customer",
            correct: true,
          },
          {
            id: "d",
            label: "// TODO: leverage this pattern across the codebase",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },
  {
    slug: "eng-slack-email-tone-formal-casual",
    title: "Slack and email tone — formal, casual, signal-to-noise",
    description:
      "Switch register between Slack, email, PR comments, and customer messages so the same content lands right in every channel.",
    dimension: "eng-writing",
    difficulty: "intermediate",
    estimatedMinutes: 20,
    order: 2,
    content: `## Why it matters
The same engineer who writes "hey team, anyone seen the staging cert error?" in #eng-platform must also write "Dear Mr. Patel, we have identified the root cause of yesterday's outage" to a paying enterprise customer two hours later. Register switching is the skill of matching tone, vocabulary, and formality to the channel and audience. Non-native English speakers often get stuck in one register — usually slightly too formal for Slack, slightly too casual for customer email — and that mismatch costs trust. A senior engineer who writes "Greetings, I would like to inquire" in Slack reads as awkward; the same engineer writing "yo, the prod db is down lol" to a customer reads as unprofessional. Both extremes are fixable once you can name the register you are in.

## What to know
- The four registers you switch between every day: Slack channel (casual, plural "team", lowercase ok, emoji as acknowledgment), Slack DM (casual but one-to-one, drop the "hey team"), internal email (semi-formal, full sentences, signed off), customer email (formal, full sentences, "thank you" not "thanks").
- "Hi" works everywhere. "Hey" is Slack and internal email only — never customer-facing. "Greetings" or "Dear" is enterprise customer email only.
- "Thanks!" with an exclamation is Slack and warm internal email. "Thank you" without exclamation is customer email and any formal context. "Thanks." with a period reads passive-aggressive in every channel; avoid.
- Emoji as acknowledgment (a checkmark on a request, a thumbs up on a plan) is signal — it tells someone you read their message. Emoji as decoration (sparkles next to "shipped") is filler that drowns the signal channel. Pick one role per emoji and stick to it.
- Dive in vs greet first. Slack channel: dive straight into the question, no "hope you are well". Customer email: always one sentence of context before the ask.
- Signal-to-noise: a 200-word Slack message will not be read. A 30-word Slack message with a screenshot will. A 30-word customer email reads as curt. Same content, different word counts.

## Compare these
**Casual Slack channel (right register for #eng-platform):**
"Hey team — staging cert expired about 20 min ago, login is broken. PR up to extend it: link. Will deploy once one of you eyeballs it. Thanks!"
Rubric: lowercase "hey", concrete time, link inline, casual "eyeballs", warm "thanks!". Matches channel norms.

**Internal email (right register for engineering managers):**
"Hi all, the staging certificate expired at 14:20 UTC and the login flow is currently down. I have opened a PR to extend the cert and will deploy once a teammate reviews it. The fix is non-customer-facing. Thanks, Lina."
Rubric: full sentences, timestamps in UTC, signed off, no idioms, semi-formal. Matches an inbox audience.

**Customer email (right register for an enterprise account):**
"Dear Mr. Patel, between 14:20 and 14:35 UTC today, users on our staging environment experienced a login outage caused by an expired SSL certificate. The certificate has been renewed and the service is fully restored. No production data was affected. We apologise for the inconvenience and have added an alert to prevent recurrence. Please let us know if you have any questions. Best regards, Lina Costa, Engineering."
Rubric: formal greeting, precise timestamps, root cause stated, scope of impact bounded, apology, follow-up offered, signed with role.

## Your turn
The deploy pipeline broke and blocked 8 teammates for 90 minutes. Write three versions of the announcement: one for #eng-platform (Slack), one for the engineering all-hands email, one for an enterprise customer who noticed their CI integration was slow.

## Rubric
- Slack version uses lowercase greeting, casual verbs, one screenshot or link
- Internal email uses full sentences, signed off, no emoji, semi-formal
- Customer email starts with greeting, states impact, gives timestamps, offers follow-up
- "Thanks!" only in Slack; "Thank you" in customer email
- No emoji in customer-facing version
- Each version stays under its channel's typical length`,
    quizzes: [
      {
        question:
          "You are pinging a teammate in #eng-platform about an expired staging cert. Which opening matches the channel register best?",
        choices: [
          {
            id: "a",
            label: "Dear team, I would like to inquire about the staging environment.",
            correct: false,
          },
          {
            id: "b",
            label: "Greetings colleagues — there appears to be an issue.",
            correct: false,
          },
          {
            id: "c",
            label: "hey team — staging cert expired ~20 min ago, login broken, PR up: link",
            correct: true,
          },
          {
            id: "d",
            label: "yo staging is fucked lol someone fix",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "An enterprise customer emails about an outage. Which closing line matches the register correctly?",
        choices: [
          {
            id: "a",
            label: "Thanks! Let me know if you need anything else 🙌",
            correct: false,
          },
          {
            id: "b",
            label:
              "We apologise for the inconvenience and have added monitoring to prevent recurrence. Please let us know if you have any questions. Best regards, Lina Costa, Engineering.",
            correct: true,
          },
          {
            id: "c",
            label: "Thanks.",
            correct: false,
          },
          {
            id: "d",
            label: "Cheers, hit me up if you need anything!",
            correct: false,
          },
        ],
        order: 2,
      },
      {
        question:
          "A teammate uses the checkmark emoji on every Slack message — your standups, your PR pings, your lunch jokes. What does this cost?",
        choices: [
          {
            id: "a",
            label:
              "Nothing, emoji are always positive signal and more is better.",
            correct: false,
          },
          {
            id: "b",
            label:
              "It drowns the acknowledgment signal — you can no longer tell when the checkmark means 'I read and will act' versus 'I saw this'.",
            correct: true,
          },
          {
            id: "c",
            label: "It causes Slack to throttle their account for emoji abuse.",
            correct: false,
          },
          {
            id: "d",
            label: "It is rude in some cultures and should never be used.",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },
  {
    slug: "eng-long-form-design-docs-blog-posts",
    title: "Long-form: design docs, blog posts, READMEs",
    description:
      "Apply the inverted pyramid, topic-sentence paragraphs, and section scaffolding so a 1500-word document stays readable end to end.",
    dimension: "eng-writing",
    difficulty: "advanced",
    estimatedMinutes: 25,
    order: 3,
    content: `## Why it matters
A 1500-word design doc is a contract. It is what your team agrees to before code is written and what the engineer joining next quarter reads to understand your trade-offs. The same goes for blog posts and READMEs — long-form writing must survive being skimmed by a senior with three tabs open and read carefully by a junior taking notes. If your structure is weak, both readers leave. The technique that fixes this is the inverted pyramid: most important fact first, supporting detail second, nuance third. Pair it with topic-sentence paragraphs and section-header scaffolding and your document reads cleanly at any depth.

## What to know
- The inverted pyramid means the first paragraph contains the decision or recommendation. The next paragraphs supply evidence; the rest fills nuance. A reader who quits after one paragraph still knows what you concluded.
- Every paragraph starts with a topic sentence stating the paragraph's claim. The next two or three sentences support it. A reader skimming only the first sentence of each paragraph should get the full argument.
- Section headers are scaffolding, not decoration. Each header is a promise about what the next 100 to 300 words deliver. "Why we chose Postgres over DynamoDB" is a header; "Database" is not.
- Voice consistency matters more over 1500 words than over 150. Pick one — "we", "I", or no-subject — and hold it. Switching halfway feels like two authors arguing.
- Cut the introduction. Most non-native long-form writing opens with a paragraph explaining what the document will explain. Delete it. Start with the decision.
- One idea per paragraph. If a paragraph has two topic sentences, split it.

## Compare these
**Good (inverted pyramid, topic sentences, single voice):**
"We are switching the analytics pipeline from Kafka to AWS Kinesis. The decision is driven by three constraints: our peak load is 40k events per second, our team has no full-time Kafka operator, and Kinesis bills on usage rather than provisioned capacity. The cost saving over twelve months is estimated at $180k.

Kafka served us well for two years. The reason we are moving is not Kafka — it is the operational tax. Every quarter, one of our four senior engineers loses two weeks to broker tuning, partition rebalancing, or ZooKeeper upgrades. With three pending product launches, we cannot afford that overhead.

We considered three alternatives before settling on Kinesis: Confluent Cloud, Redpanda, and Pulsar. Confluent removes the operational burden but the price at our volume is $240k per year. Redpanda is operationally simpler but the team has no production experience with it. Pulsar would require rewriting all consumer code. Kinesis maps cleanly to our existing IAM-based access model."
Rubric: decision in sentence one, evidence in paragraph two, alternatives evaluated in paragraph three, voice consistent, headers would be "The decision", "Why now", "Alternatives considered".

**Bad (buried lede, no topic sentences, voice drift):**
"In this document I will discuss our analytics infrastructure. Analytics is very important for the company and we have been thinking about it for some time. There are many options in the market today including Kafka, Kinesis, Confluent, Pulsar, Redpanda, and others. Each of them has trade-offs that the team has been evaluating. Personally I think Kinesis is interesting but the team should decide together. Also Kafka has been good but maybe we should change. The cost is a factor we need to look at."
Rubric: opens with meta-commentary, no decision until the document ends, voice flips between "I", "the team", "we", no topic sentences. A reader who quits after paragraph one learns nothing.

## Your turn
Write the opening 200 words of a design doc proposing to migrate your team's REST API to GraphQL. Constraint: a reader who only reads your first paragraph should know your recommendation, your top reason, and the rough cost.

## Rubric
- First paragraph contains the recommendation and one quantitative reason
- Each subsequent paragraph starts with a topic sentence
- One voice throughout (pick "we", "I", or no-subject and hold it)
- Section headers describe their content, not the topic area
- No meta-introduction ("in this document I will...")
- Alternatives section evaluates at least two other options with one concrete number each`,
    quizzes: [
      {
        question:
          "Your design doc opens with: 'In this document I will discuss our analytics infrastructure and the options we have been evaluating.' What is the strongest fix?",
        choices: [
          {
            id: "a",
            label: "Translate the paragraph into more formal English.",
            correct: false,
          },
          {
            id: "b",
            label:
              "Delete the meta-introduction and start with the decision: 'We are switching the analytics pipeline from Kafka to Kinesis to save $180k a year.'",
            correct: true,
          },
          {
            id: "c",
            label: "Add an executive summary section above the introduction.",
            correct: false,
          },
          {
            id: "d",
            label: "Move the introduction to the end of the document.",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "You are reviewing a teammate's blog post. Every paragraph begins with a transitional phrase ('Furthermore', 'In addition', 'Moreover') rather than a claim. Why does this hurt readability?",
        choices: [
          {
            id: "a",
            label:
              "Transitional phrases are grammatically incorrect in English and confuse readers.",
            correct: false,
          },
          {
            id: "b",
            label:
              "A reader skimming the first sentence of each paragraph cannot reconstruct the argument because no paragraph states its own claim up front.",
            correct: true,
          },
          {
            id: "c",
            label: "Transitional phrases are too American for an international audience.",
            correct: false,
          },
          {
            id: "d",
            label:
              "The blog platform's SEO scoring penalises posts that do not use keywords in the first sentence.",
            correct: false,
          },
        ],
        order: 2,
      },
      {
        question:
          "Which section header best applies the 'scaffolding, not decoration' rule in a database migration design doc?",
        choices: [
          {
            id: "a",
            label: "Database",
            correct: false,
          },
          {
            id: "b",
            label: "Background",
            correct: false,
          },
          {
            id: "c",
            label: "Why we chose Postgres over DynamoDB for the events table",
            correct: true,
          },
          {
            id: "d",
            label: "Some thoughts on storage",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },
] as const;
