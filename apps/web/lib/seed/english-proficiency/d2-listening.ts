// English Proficiency — D2: Listening: From Slow to Conference-Speed (3 lessons)
export const D2_LESSONS = [
  {
    slug: "eng-tech-podcasts-at-1x",
    title: "Tech podcasts at 1x: building the foundation",
    description:
      "Train predictive listening with slow, deliberate speakers. Accept a 30 percent miss rate on first pass and use anchor words to stay oriented.",
    dimension: "eng-listening",
    difficulty: "beginner",
    estimatedMinutes: 15,
    order: 1,
    content: `## Why it matters

Most engineering teams run in English. Standups, design reviews, customer calls, conference talks, recorded onboarding videos — your week is full of audio you cannot pause politely. If you can only follow English when someone speaks slowly and faces you directly, you will burn energy translating in your head and miss the actual technical content. The goal of this lesson is not perfect comprehension. The goal is to teach your ear that missing 30 percent of words on the first listen is normal, and that you can still understand the meaning by anchoring on the right words.

Listening, like running, is trained with progressive overload. We start slow on purpose. Build the habit first, then add speed.

## What to know

- Predictive listening means your brain guesses the next phrase from the last three or four words plus the topic. Native speakers do this constantly. You train it by listening to predictable speakers on familiar topics.
- Anchor words are the nouns and verbs that carry meaning: "transformer", "context window", "fine-tune", "ship". You do not need to catch every word. You need to catch the anchors and the connector that links them ("but", "so", "because").
- A 30 percent miss rate on the first pass is acceptable. Re-listening to a 60-minute episode three times beats grinding one minute on repeat. Wide exposure trains the ear faster than narrow drilling.

## Listen to this

Start with Lex Fridman Podcast. Pick an episode with a guest from your field — for example his conversations with Andrej Karpathy, Demis Hassabis, or Yann LeCun. Lex speaks slowly, pauses between clauses, and rarely interrupts. Most episodes have free transcripts on lexfridman.com, which lets you check yourself after the listen. Play the first 20 minutes at 1x with no captions. Do not pause. When you lose the thread, wait for the next anchor word and rejoin. Mark in your head the moments you got lost — those are the gaps to study later, not now.

After the 20 minutes, open the transcript and skim the part you just heard. You will be surprised how much you actually caught. This calibration is the lesson.

A good second source is Practical AI — slower hosts, applied topics, predictable structure. Software Engineering Daily works too, but the interview pace is a touch faster.

## Comprehension cues

- If you caught the topic and one strong opinion, you understood the segment.
- If you caught the topic but no opinion, rewind 30 seconds and try again.
- If you did not catch the topic, the speaker is too fast or too accented for today. Switch sources.
- Write one sentence in English summarizing what you just heard. If you cannot write it, you did not understand it.

## Speed ladder

- 1x: Lex Fridman, transcript available, no captions. Goal: 70 percent comprehension.
- 1.25x: same episode, second pass, one week later. Goal: same 70 percent, less effort.
- 1.5x: not yet. You earn it by hitting the 1.25x target consistently.
- 2x: ignore for now. 2x at this stage trains panic, not comprehension.

Self-paced reminder: graduate.dev v1 does not auto-grade listening practice. Track yourself with a simple notebook — date, source, minutes, one-sentence summary. Three sessions per week for four weeks is enough to feel a real shift.`,
    quizzes: [
      {
        question:
          "You are listening to a 45-minute Lex Fridman episode at 1x. After 10 minutes you realize you missed several sentences about RLHF. What is the right move?",
        choices: [
          {
            id: "a",
            label: "Pause, rewind 30 seconds, and replay until you catch every word.",
            correct: false,
          },
          {
            id: "b",
            label:
              "Keep listening, wait for the next anchor word, and rejoin the thread.",
            correct: true,
          },
          {
            id: "c",
            label: "Stop the episode and switch to a slower podcast immediately.",
            correct: false,
          },
          { id: "d", label: "Turn on captions and restart from the beginning.", correct: false },
        ],
        order: 1,
      },
      {
        question:
          "A teammate says 'aim for 100 percent comprehension on every podcast or you are wasting your time.' Why is this advice wrong for a learner at this stage?",
        choices: [
          {
            id: "a",
            label: "Podcasts are entertainment, not study material.",
            correct: false,
          },
          {
            id: "b",
            label:
              "100 percent comprehension on the first pass is a native-speaker bar; a 30 percent miss rate is normal and still trains the ear.",
            correct: true,
          },
          {
            id: "c",
            label:
              "Engineers should only listen to written material, not audio.",
            correct: false,
          },
          {
            id: "d",
            label: "Captions make 100 percent comprehension impossible.",
            correct: false,
          },
        ],
        order: 2,
      },
      {
        question:
          "Which source is the best starting point for a beginner training predictive listening?",
        choices: [
          {
            id: "a",
            label: "A live conference Q&A with three overlapping speakers.",
            correct: false,
          },
          {
            id: "b",
            label: "A British sitcom with fast dialogue and slang.",
            correct: false,
          },
          {
            id: "c",
            label:
              "A Lex Fridman episode with a guest in your field, transcript available, played at 1x with no captions.",
            correct: true,
          },
          {
            id: "d",
            label: "A 2x-speed summary video on YouTube.",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },
  {
    slug: "eng-talks-and-tutorials-at-1-5x",
    title: "Talks and tutorials at 1.5x",
    description:
      "Climb the speed ladder from 1x to 1.5x over several weeks. Use YouTube captions as a safety net, then remove them deliberately.",
    dimension: "eng-listening",
    difficulty: "intermediate",
    estimatedMinutes: 20,
    order: 2,
    content: `## Why it matters

Most senior engineering content — keynote talks, paper walkthroughs, framework tutorials — is delivered faster than a podcast interview. A NeurIPS speaker has 12 minutes to present a paper. They will not slow down for you. If you can only consume technical talks at 1x, you watch half as much content as someone running at 1.5x, and you fall behind on the field. Speed is not vanity. It is throughput.

The trick is that you cannot jump from 1x to 1.5x in one session. Your ear needs gradual exposure. We climb the ladder over weeks, not minutes.

## What to know

- The healthy speed climb is 1x → 1.1x → 1.25x → 1.5x, one step every one or two weeks of consistent practice. Skipping a step usually means you start re-listening to the same minute three times, which kills the habit.
- YouTube captions are a safety net, not a crutch. Use them for the first watch of a new speaker so your brain can map their voice to text. Remove them on the second watch of the same talk.
- Re-watching the same talk at increasing speeds is more useful than watching three different talks once each. The second pass is where the speed gain happens.
- 1.5x feels uncomfortable for the first ten minutes, then your ear adapts. If it still feels impossible after 15 minutes, drop back to 1.25x — you are not ready yet.

## Listen to this

NeurIPS keynotes on the NeurIPS YouTube channel are the gold standard. Speakers are world-class, slides are dense, and most talks are 30 to 60 minutes — long enough for your ear to settle into the speaker's rhythm. Start with a keynote on a topic you already half-know from reading, so your background knowledge fills the gaps when your ear misses a word.

Anthropic Developer Day talks (the recorded sessions from their dev day events) are excellent for applied LLM content — clear delivery, technical but not academic, well-edited audio. OpenAI Developer Day recordings work similarly. Both are findable on YouTube without URLs that rot.

For tutorials, the official PyTorch and TensorFlow YouTube channels have hour-long walkthroughs by the framework authors. These are slower and more predictable than conference talks — a good middle rung between 1.25x and 1.5x.

Plan for the week: pick one 30-minute keynote. Watch it Monday at 1.25x with captions. Watch the same talk Thursday at 1.5x with captions off. Watch a different talk by the same speaker Sunday at 1.5x, captions off. That is one speed-ladder cycle.

## Comprehension cues

- At 1.5x without captions, you should still be able to write a three-sentence summary afterward.
- If you can summarize the thesis but not the supporting evidence, you are at the edge of your speed. Stay there for another week before climbing.
- If you cannot summarize even the thesis, drop back one step on the ladder.
- Captions on while your eyes are on slides is fine — captions on while staring at a talking head is a sign you have stopped listening and started reading.

## Speed ladder

- 1x: only for first-time exposure to a brand-new speaker or heavy accent.
- 1.25x: default for new conference talks, captions on for the first watch.
- 1.5x: re-watch of a talk you have already seen once. Captions off.
- 2x: still not yet. Reserved for content you have already mastered at 1.5x and want to re-skim.

Self-paced reminder: graduate.dev v1 does not measure your watching speed. Log it yourself — title, speed, captions on or off, three-sentence summary. After four weeks of climbing the ladder, listen back to your week-one notes. The difference will be obvious.`,
    quizzes: [
      {
        question:
          "You watched a NeurIPS keynote yesterday at 1.25x with captions. Today you want to push speed. What is the correct next step?",
        choices: [
          {
            id: "a",
            label: "Jump straight to 2x on a different talk by a different speaker.",
            correct: false,
          },
          {
            id: "b",
            label:
              "Re-watch the same talk at 1.5x with captions off, then summarize in three sentences.",
            correct: true,
          },
          {
            id: "c",
            label: "Watch five different talks at 1.25x in a row.",
            correct: false,
          },
          {
            id: "d",
            label: "Slow down to 1x because yesterday felt hard.",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "You are 15 minutes into a 1.5x talk and you still cannot follow the thesis. The speaker is clear and the topic is familiar. What does this mean?",
        choices: [
          {
            id: "a",
            label: "The talk is poorly recorded; try a different talk.",
            correct: false,
          },
          {
            id: "b",
            label: "You need to push through — comprehension always returns at minute 30.",
            correct: false,
          },
          {
            id: "c",
            label:
              "Your ear is not ready for 1.5x on this speaker yet; drop back to 1.25x and try again next week.",
            correct: true,
          },
          { id: "d", label: "Turn captions on and keep them on forever.", correct: false },
        ],
        order: 2,
      },
      {
        question:
          "Which use of YouTube captions matches the speed-ladder strategy in this lesson?",
        choices: [
          {
            id: "a",
            label: "Captions always on at every speed, because reading is faster than listening.",
            correct: false,
          },
          {
            id: "b",
            label: "Captions always off, because they make you lazy.",
            correct: false,
          },
          {
            id: "c",
            label:
              "Captions on for the first watch of a new speaker at 1.25x; off for the re-watch at 1.5x.",
            correct: true,
          },
          {
            id: "d",
            label: "Captions only on talks you have already mastered.",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },
  {
    slug: "eng-live-calls-standups-demos-qa",
    title: "Live calls: standups, demos, Q&A",
    description:
      "Handle real-time English with multiple speakers and overlapping speech. Use the recovery move to confirm understanding without losing face.",
    dimension: "eng-listening",
    difficulty: "advanced",
    estimatedMinutes: 25,
    order: 3,
    content: `## Why it matters

Recorded content is forgiving — you can pause, rewind, slow down. Live calls are not. In a standup, you have six people, two remote with bad audio and one with a strong accent. In a demo Q&A, a senior engineer wraps a real question in two minutes of context. In a customer call, you have 30 seconds to confirm a requirement before they move on. This is where most non-native speakers freeze, and freezing in front of senior people makes your English feel worse than it actually is.

This lesson is about three real-time skills: separating the question from the preamble, recovering gracefully when you missed something, and tracking multiple speakers when they overlap.

## What to know

- A question rarely arrives in the first sentence. Senior engineers wrap questions in context — "so I was looking at the retrieval layer yesterday and noticed that when we re-rank, the latency goes up by 40ms, which made me wonder, are you sorting before or after the embedding step?" The actual question is the last clause. Train yourself to wait for it instead of trying to parse the preamble.
- The single most useful recovery phrase in tech English is: "I want to make sure I understood — you're asking X?" It costs you nothing in status. Senior engineers do it constantly. It signals care, not weakness.
- Overlapping speech is normal in fast teams. You will lose the thread when two people talk at once. The recovery is to pick the louder or more relevant speaker, follow them, and trust that the side comment will resurface if it mattered.
- Multiple-speaker tracking improves when you mentally label each voice ("PM voice", "tech lead voice", "the new hire") in the first two minutes of the call. Your brain then routes their words into separate buckets instead of one jumbled stream.

## Listen to this

The closest thing to a live engineering call you can practice with solo is a recorded conference panel or Q&A. Latent Space podcast releases panel episodes with three or four guests — overlapping speech, real disagreements. Watch a NeurIPS panel discussion on YouTube where four researchers debate a topic. Anthropic Developer Day and OpenAI DevDay Q&A segments (the audience-question portions) give you the real "context-then-question" pattern.

Practice drill: pick a 20-minute panel. After each audience question, pause and ask — what was the actual question, what was preamble? Write the question in one sentence. You will be surprised how often it is much shorter than the asker made it sound.

For multiple-speaker tracking, Software Engineering Daily and Practical AI roundtable episodes work well — three distinct voices, slower than a live call but with real overlap.

## Comprehension cues

- If you can repeat back the question in your own words within five seconds, you understood it.
- If you cannot, use the recovery move: "I want to make sure I understood — you're asking X?" Never guess in a senior meeting.
- If two people are talking and you can only follow one, follow the one giving the answer, not the one asking the follow-up.
- If you lost the entire thread for 30 seconds, the right move is to ask the call leader, not to nod and hope. "Sorry, I missed the last part — could you summarize the decision?" is professional.

## Speed ladder

- 1x: live calls are always 1x. You do not get to slow them down.
- 1.25x: re-watching a recorded call or panel to drill the recovery moves.
- 1.5x: re-watching a panel you already understood once, to push your real-time parsing speed.
- 2x: only for skimming a recorded call you led, to find the moments you want to re-listen to.

Self-paced reminder: graduate.dev v1 does not record or grade your live calls. The best practice is to keep a one-line log after every real meeting — what you missed, what recovery move you used or wished you had used, and which speaker was hardest to follow. Two weeks of that log will show you a pattern, and the pattern is the lesson.`,
    quizzes: [
      {
        question:
          "In a design review, a staff engineer says: 'I was thinking about the retrieval layer, and I noticed that latency spikes during re-ranking, which is interesting because we usually see the opposite pattern in production, so are you batching the rerank calls?' What is the actual question?",
        choices: [
          {
            id: "a",
            label: "Why does latency spike during re-ranking?",
            correct: false,
          },
          {
            id: "b",
            label: "Is the production pattern different from staging?",
            correct: false,
          },
          {
            id: "c",
            label: "Are you batching the rerank calls?",
            correct: true,
          },
          {
            id: "d",
            label: "What is the retrieval layer doing?",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "You are in a standup and you completely missed what the tech lead just said about a deployment blocker. What is the best recovery move?",
        choices: [
          {
            id: "a",
            label: "Nod and look it up in Slack after the meeting.",
            correct: false,
          },
          {
            id: "b",
            label: "Say 'I want to make sure I understood — you're saying the deploy is blocked on the migration?'",
            correct: true,
          },
          {
            id: "c",
            label: "Ask a different teammate to translate after the call.",
            correct: false,
          },
          {
            id: "d",
            label: "Say nothing and hope the topic comes back later.",
            correct: false,
          },
        ],
        order: 2,
      },
      {
        question:
          "On a six-person call, the PM and the tech lead start talking at the same time about two different topics. You can only follow one stream. Which one should you follow?",
        choices: [
          {
            id: "a",
            label: "Whoever is louder, regardless of relevance.",
            correct: false,
          },
          {
            id: "b",
            label: "The PM, because PMs always run the meeting.",
            correct: false,
          },
          {
            id: "c",
            label:
              "The speaker giving the answer to the current thread; the side comment will resurface if it matters.",
            correct: true,
          },
          {
            id: "d",
            label: "Neither — ask both to repeat at the end of the call.",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },
] as const;
