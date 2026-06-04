// English Proficiency — D3: Speaking Under Pressure (3 lessons)
export const D3_LESSONS = [
  {
    slug: "eng-60-second-standup-updates",
    title: "60-second standup updates that don't ramble",
    description:
      "Use the yesterday/today/blockers template, pace your delivery, and learn the pause-don't-fill rule so your standup update lands in 60 seconds without losing the room.",
    dimension: "eng-speaking",
    difficulty: "beginner",
    estimatedMinutes: 15,
    order: 1,
    content: `## Why it matters
Standups are the most public 60 seconds you get every day. Six people are listening, half of them are senior, and most of them are deciding whether you are a clear thinker based on how you talk for one minute. Juniors lose this minute in three ways: they narrate every step of yesterday, they say "um" and "like" to fill silence, and they bury the actual blocker at the end so nobody catches it. The cost is not just a long meeting. It is that your manager quietly stops trusting that you can run a meeting yourself, that your blocker goes unsolved for another day because nobody heard it, and that on promotion day someone says "good engineer, but cannot communicate." A clean 60-second standup is the cheapest credibility move you have, and you can practise it alone in a mirror in under a week.

## What to know
- Use the three-slot template every time: yesterday, today, blockers. Yesterday is what you finished, not what you touched. Today is the single most important thing you will ship. Blockers go first if there is one urgent, otherwise last.
- Pause-don't-fill rule: when you lose your place, stop talking. A two-second silence sounds confident. "Um, like, yeah, so" sounds lost. Speaking-strategy nerds call this disfluency removal; you call it shutting up for two seconds.
- Thinking aloud is a real tool, but standup is the wrong place. Save "let me think out loud" for design discussions, not status updates. In standup, you arrive having already thought.
- "I'll follow up async" is the senior exit. The moment a thread goes deeper than 30 seconds — a debate, a design question, two people disagreeing — you say "let me follow up in Slack" and hand the floor back. This is not avoidance, it is meeting hygiene.
- Asking for clarification is fine but rare in standup. If you genuinely do not know what someone meant, say "quick clarification — when you said staging, did you mean the new cluster?" Then move on. Do not relitigate.
- Recovering from blank: if you blank on what you did yesterday, say "one second, checking my notes" and look at your Linear or Jira. Do not improvise a fake update. Everyone has been there; nobody minds three seconds of silence.

## Prompt
You are in daily standup at 10am. Your turn is next. Yesterday you finished the Stripe webhook retry worker and started a small bug investigation in the billing dashboard. Today you plan to ship the dashboard fix and start a code review for a teammate. You are blocked on a missing staging credential from the platform team. Give your update in 60 seconds.

## Senior-level model answer
"Yesterday I shipped the Stripe webhook retry worker — it is in staging, ran clean overnight, I will promote to prod after lunch. I also started looking at the billing dashboard bug where totals lag by a minute; I traced it to a stale cache key. Today I am fixing that cache invalidation and shipping it, then picking up Priya's code review on the invoice PDF refactor. One blocker: I am waiting on a staging Redis credential from the platform team — I pinged Sam yesterday, no reply, can someone help unstick that? That is it from me."

## Self-reflection prompts
- Was I clear about what I shipped versus what I touched?
- Did I pause well, or did I fill silence with um and like?
- Did I name the blocker explicitly and ask for a specific person or team to help?
- What would I change if I had to deliver this same update again tomorrow?`,
    quizzes: [
      {
        question:
          "Three engineers give their standup. Which one sounds most like a senior who has been doing this for years?",
        choices: [
          {
            id: "a",
            label:
              "Yesterday I worked on a bunch of stuff, mostly the webhook thing but also some other tickets and I looked into that bug a bit. Today similar I think. Um, no blockers I guess.",
            correct: false,
          },
          {
            id: "b",
            label:
              "Yesterday I shipped the retry worker; today I am fixing the dashboard cache bug and reviewing Priya's PR; one blocker — waiting on a staging Redis credential from platform, can someone unstick Sam?",
            correct: true,
          },
          {
            id: "c",
            label:
              "So yesterday, let me think, I was on the webhook, and I also opened the dashboard, and the cache was weird, and then I tried this thing, and it sort of worked, and then I had to switch to something else.",
            correct: false,
          },
          {
            id: "d",
            label:
              "I don't have a lot to share today, I'll let others go first and come back to me if there's time.",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "You blank on what you finished yesterday. What is the senior move in the next two seconds?",
        choices: [
          {
            id: "a",
            label: "Improvise a plausible-sounding update so you don't look unprepared.",
            correct: false,
          },
          {
            id: "b",
            label:
              "Say 'one second, checking my notes' and look at Linear or Jira; the two-second pause is fine.",
            correct: true,
          },
          {
            id: "c",
            label: "Skip yesterday, jump straight to today, hope nobody notices.",
            correct: false,
          },
          {
            id: "d",
            label: "Fill the silence with 'um, like, yeah, so, basically' until you remember.",
            correct: false,
          },
        ],
        order: 2,
      },
      {
        question:
          "Mid-standup, a teammate disagrees with your design choice and the conversation looks like it will go five more minutes. What do you say?",
        choices: [
          {
            id: "a",
            label: "Defend the choice in detail right now so the whole team hears your reasoning.",
            correct: false,
          },
          {
            id: "b",
            label: "Agree on the spot to end the debate quickly and keep the meeting short.",
            correct: false,
          },
          {
            id: "c",
            label:
              "'Good point — let me follow up async in Slack so we don't burn standup time on it.' Then hand the floor back.",
            correct: true,
          },
          {
            id: "d",
            label: "Stay silent and let your manager decide who is right.",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },
  {
    slug: "eng-interview-english-star-thinking-aloud",
    title: "Interview English: STAR, thinking aloud, asking for clarification",
    description:
      "Use the STAR framework for behavioural answers, think aloud during technical questions, and learn the exact buying-time phrases that recover a blank without sounding lost.",
    dimension: "eng-speaking",
    difficulty: "intermediate",
    estimatedMinutes: 20,
    order: 2,
    content: `## Why it matters
Interview English is a different language from working English. In 30 to 45 minutes you have to convince a stranger you are senior, and the way you talk does most of the work. Two engineers with the same skill can get wildly different offers because one structures a story and the other rambles. A junior offer at $60k versus a mid offer at $110k often comes down to whether you answered "tell me about a conflict" in 90 seconds with a clear arc or in five minutes with no point. On technical questions, candidates who go silent when stuck look frozen; candidates who think aloud look like teammates. The frameworks below are not personality traits. They are learnable.

## What to know
- STAR is the industry-default behavioural format: Situation (the context in one sentence), Task (your specific responsibility), Action (what you did — the longest part), Result (what changed, with a number if possible). Most candidates skip Result. Senior candidates land on it hard.
- For technical questions, the speaking-strategy is "let me think out loud" — say it explicitly, then narrate your reasoning. Interviewers are not testing whether you know the answer instantly; they are testing whether you reason cleanly. Silence reads as panic; narration reads as competence.
- Asking for clarification is a senior move, not a weak one. Two phrases buy you 20 seconds and signal seniority: "could you give me an example of where this would be used?" and "I want to make sure I understand the constraint — is it X or Y?" Use them when the question is vague or your brain needs a beat.
- Recovering from blank: if you lose the thread mid-answer, say "let me reset — the key point I want to land is..." and restart cleanly. Do not apologise. Do not say "sorry I'm nervous." Just reset.
- Result with a number beats Result without one. "We cut deploy time" is weak. "We cut deploy time from 18 minutes to 4 minutes over six weeks" is hireable.
- Disagreement stories specifically: interviewers want to see that you can push back without being a jerk and back down without being a pushover. STAR forces both halves to show up.

## Prompt
Behavioural interview, mid-level role. The interviewer asks: "Tell me about a time you disagreed with your manager. How did you handle it?" You have 90 to 120 seconds.

## Senior-level model answer
"Situation: last year my manager wanted to ship a new analytics pipeline in two weeks for a board demo. Task: I was the engineer responsible for the data correctness layer. Action: I looked at the scope and realised we would have to skip backfill validation to hit the date, which meant the demo numbers could be wrong by up to 8 percent. I asked for a 1:1, walked her through the specific risk with a one-page doc, and proposed two options — slip by one week and ship clean, or ship on time with a clearly labelled 'preview' flag on the dashboard. Result: she chose the preview-flag path, the board demo went well, and we shipped the validated version eight days later with no revisions needed. The lesson I took away is that disagreement lands better when you arrive with two options rather than a single objection."

## Your turn
Open your browser's MediaRecorder — most browsers expose this through the standard recording prompt — and record yourself answering the same prompt in 90 to 120 seconds. v1 of this lesson is client-side recording only; we do not auto-grade or transcribe yet. Play it back once with the rubric below.

## Self-reflection prompts
- Did I name all four STAR pieces, or did I skip Task or Result?
- Did I land Result with a number or a concrete change?
- Did I think aloud naturally, or did I sound like I was reading a script?
- If I blanked, did I reset cleanly with "the key point I want to land is...", or did I apologise?
- What would I change about the order or the length?`,
    quizzes: [
      {
        question:
          "An interviewer asks: 'Tell me about a time you led a project.' Which opening is most STAR-aligned?",
        choices: [
          {
            id: "a",
            label:
              "'I've led a lot of projects, but probably the most interesting one was something we did last year with the platform team and some other folks too.'",
            correct: false,
          },
          {
            id: "b",
            label: "'Sure, I love leading. I'm a really collaborative person and I think...'",
            correct: false,
          },
          {
            id: "c",
            label:
              "'Last quarter our API latency was breaching SLA on the checkout path. I was asked to lead a four-week effort to bring p95 under 200ms. I scoped the work into three tracks, ran a daily 15-minute sync, and...'",
            correct: true,
          },
          {
            id: "d",
            label: "'Let me think — what counts as leading? Like officially or unofficially?'",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "Technical interview. The interviewer asks a system design question and you need 15 seconds to think. What is the senior move?",
        choices: [
          {
            id: "a",
            label: "Sit in silence and stare at the whiteboard until you have a full answer.",
            correct: false,
          },
          {
            id: "b",
            label:
              "Say 'let me think out loud — I want to make sure I understand the constraint. Are we optimising for read throughput or write throughput?' Then narrate.",
            correct: true,
          },
          {
            id: "c",
            label: "Start drawing immediately without speaking so you look fast.",
            correct: false,
          },
          {
            id: "d",
            label: "Say 'sorry, I'm nervous, can you repeat the question?'",
            correct: false,
          },
        ],
        order: 2,
      },
      {
        question:
          "You are halfway through a STAR answer and you completely lose your thread. What do you say next?",
        choices: [
          {
            id: "a",
            label: "'Sorry, I'm really nervous today, can we skip this one?'",
            correct: false,
          },
          {
            id: "b",
            label: "Trail off into 'um, yeah, so, anyway' and hope they ask the next question.",
            correct: false,
          },
          {
            id: "c",
            label: "'Let me reset — the key point I want to land is that we cut deploy time from 18 minutes to 4 over six weeks.'",
            correct: true,
          },
          {
            id: "d",
            label:
              "Keep talking through the blank in the hope the words come back if you push through.",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },
  {
    slug: "eng-customer-stakeholder-calls",
    title: "Customer and stakeholder calls",
    description:
      "Translate engineering jargon into business terms in real time, use reflective listening to defuse frustration, and close every call with explicit next steps and owners.",
    dimension: "eng-speaking",
    difficulty: "advanced",
    estimatedMinutes: 25,
    order: 3,
    content: `## Why it matters
Customer and stakeholder calls are where senior engineers become indispensable or get quietly moved off accounts. The skill is not technical depth — it is real-time translation. A frustrated VP does not want to hear about race conditions; they want to hear when the feature ships. Get this right and you become the engineer who "carries customer conversations." The cost of failing is invisible: the customer rarely tells you directly. They tell your CEO over dinner, and you find out six weeks later when it is too late.

## What to know
- Real-time translation is the core skill. Engineering says "the vector index is stale and we need to backfill embeddings." You say: "the AI is reading from an out-of-date index, so recommendations are stale; a backfill runs tonight and you will see fresh results by Thursday." Same fact, business framing, concrete date.
- Reflective listening is the highest-leverage move when a customer is frustrated. The phrase is "what I'm hearing is X — is that right?" — said genuinely, not as a script. It slows the call, shows you listened, and lets them correct you cheaply if you misunderstood. Use it once per frustrated moment, not every sentence.
- Tone under frustration: drop your speaking pace by about 20 percent and lower your pitch a notch. Do not match their energy. One clean acknowledgement — "yeah, this has been painful, and you have been patient" — then move to substance.
- Never promise a date you have not validated. Say "I want to give you a real date, not a guess — let me confirm with the team by end of day and come back to you." Under-promise externally, over-deliver internally.
- Close every call with three things: what we agreed, who owns each item, when the next checkpoint is. Send a written recap within an hour. The recap is where misunderstandings die.
- Avoid two killer phrases: "that should be easy" and "I don't know why it's broken." Replace the second with "I don't have a root cause yet — I will have one by tomorrow noon."

## Prompt
You are on a call with the Head of Product at a paying customer. They open: "We were told the AI recommendation feature would be live in March. It is now May. Why is this delayed, and when can I tell my team it will ship?" The real reason: the embedding pipeline has been flaky in staging for three weeks and you need two more weeks of stabilisation.

## Senior-level model answer
Customer: "We were told March. It is May. Why is this delayed?"

You: "Fair question, and I appreciate you raising it directly. What I'm hearing is — you committed to your team this would be live in Q1, and you are two months past that with no clear date. Is that right?"

Customer: "Exactly. I look bad to my CEO every Monday."

You: "Understood. Straight answer: the recommendation engine has two pieces — the model, which is working, and the data pipeline that feeds it, which has been unstable in staging for three weeks. If we shipped now you would see broken recommendations one day in five, which is worse for you than waiting."

Customer: "Okay. So when?"

You: "I do not want to give you a guess. Current estimate is two weeks to stabilise plus one week of production canary — so three weeks, end of May. I would rather come back tomorrow with a date my team has signed off on. Can I send you a confirmed date and a one-page plan by end of day tomorrow, and we do a 20-minute checkpoint on Friday? Sound right?"

## Your turn
Open your browser's MediaRecorder and record yourself playing the engineer side of this call against the customer lines above. v1 of this lesson is client-side recording only; we do not transcribe or score audio yet. Play it back against the rubric below.

## Self-reflection prompts
- Did I reflect back what they said before defending my team?
- Did I translate the technical cause into business framing?
- Did I avoid promising a date I had not validated?
- Did I close with a recap, owner, and next checkpoint?
- What would I change about my tone if the customer had been angrier?`,
    quizzes: [
      {
        question:
          "A frustrated customer says: 'Every demo I give my CEO this feature breaks. I am losing credibility.' What is the strongest opening response?",
        choices: [
          {
            id: "a",
            label:
              "'I'm really sorry. We will fix it as soon as possible, I promise. Probably by next week.'",
            correct: false,
          },
          {
            id: "b",
            label:
              "'What I'm hearing is — every time you demo this to your CEO it fails, and that is costing you credibility internally. Is that right?' Then pause for their answer.",
            correct: true,
          },
          {
            id: "c",
            label:
              "'Actually, the root cause is a race condition in our event queue when the user clicks faster than the debounce window — let me explain the architecture.'",
            correct: false,
          },
          {
            id: "d",
            label: "'That should be easy to fix, I'll just push something today.'",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "The customer asks for a hard ship date. Your team has not yet agreed on one. What is the senior move?",
        choices: [
          {
            id: "a",
            label:
              "Give them your best guess on the call so you look decisive, then renegotiate later if it slips.",
            correct: false,
          },
          {
            id: "b",
            label: "Refuse to discuss dates at all until engineering signs off in writing.",
            correct: false,
          },
          {
            id: "c",
            label:
              "'I want to give you a real date, not a guess. Let me confirm with the team by end of day and send you a written plan tomorrow.'",
            correct: true,
          },
          {
            id: "d",
            label: "Quote the latest internal optimistic estimate as if it were committed.",
            correct: false,
          },
        ],
        order: 2,
      },
      {
        question:
          "The call is wrapping up. Which closing pattern most reduces misunderstandings in the next two weeks?",
        choices: [
          {
            id: "a",
            label:
              "'Thanks for your time, we'll be in touch soon.' End the call and move on to the next meeting.",
            correct: false,
          },
          {
            id: "b",
            label:
              "'To recap: I will send a confirmed rollout date and a one-page plan by end of day tomorrow, and we will do a 20-minute checkpoint on Friday. Sound right?' Then send a written recap within the hour.",
            correct: true,
          },
          {
            id: "c",
            label:
              "Ask the customer to write up the agreed action items themselves and send them to you.",
            correct: false,
          },
          {
            id: "d",
            label:
              "Promise to 'circle back next week' without naming an owner, a date, or a next checkpoint.",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },
] as const;
