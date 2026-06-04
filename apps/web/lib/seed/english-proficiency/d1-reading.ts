// English Proficiency — D1: Reading Technical English at Speed (3 lessons)

export const D1_LESSONS = [
  {
    slug: "eng-reading-api-docs-without-translating",
    title: "Reading API docs without translating every word",
    description:
      "Skim, scan, and deep-read API documentation in English without mentally translating each sentence.",
    dimension: "eng-reading",
    difficulty: "beginner",
    estimatedMinutes: 15,
    order: 1,
    content: `## Why it matters
You will spend more time reading docs than writing code. If you translate every English sentence in your head, a 10-minute task becomes an hour. The goal is not to understand every word — it is to find what you need and move on.

## What to know
- Use a three-pass pattern: skim for structure, scan for anchors, then deep-read only the section you actually need.
- Anchor words are the 4 to 6 nouns that carry the meaning: endpoint name, parameter names, return type, error codes. Ignore connectors like "however", "therefore", "in order to".
- Code blocks are translations of the prose. When the English feels heavy, jump to the example and read backwards from there.
- Look up a word only if it is an anchor and you cannot infer it from the example. Otherwise, infer and continue.

## Read this
The \`/v1/embeddings\` endpoint accepts a JSON body with two required fields, \`model\` and \`input\`, and one optional field, \`encoding_format\`. The \`input\` field may be a single string or an array of strings, but the total token count across all inputs must not exceed the context window of the selected model. When \`encoding_format\` is set to \`base64\`, the server returns each vector as a base64-encoded float32 buffer; this reduces response size by roughly 30 percent over the default \`float\` array representation, at the cost of an additional decode step on the client.

Rate limits are enforced per organization and are reported in three response headers: \`x-ratelimit-limit-requests\`, \`x-ratelimit-remaining-requests\`, and \`x-ratelimit-reset-requests\`. Clients that exceed the limit receive a \`429\` response with a \`retry-after\` header in seconds. Retries should use exponential backoff with full jitter; naive retry loops will not recover and may push the account into a longer cooldown.

\`\`\`bash
curl https://api.example.com/v1/embeddings \\
  -H "Authorization: Bearer $TOKEN" \\
  -d '{"model":"embed-3-small","input":["hello"]}'
\`\`\`

The response includes a \`usage\` object reporting \`prompt_tokens\` and \`total_tokens\`. Note that for embeddings, \`completion_tokens\` is always zero and is included only for schema consistency with the chat endpoints.

## Comprehension cues
- Anchors here: endpoint name, required fields, response headers, status code 429.
- The code block confirms the JSON shape — read it first if the prose feels dense.
- "At the cost of" is a hedge phrase; the real information is the 30 percent number.

## Practice next
- Open one real provider doc page tonight, set a 5-minute timer, and write down only the anchor words.
- Read a second page without a dictionary; only look up words that appear in code samples.`,
    quizzes: [
      {
        question: "According to the excerpt, which two fields of /v1/embeddings are required?",
        choices: [
          { id: "a", label: "model and encoding_format", correct: false },
          { id: "b", label: "model and input", correct: true },
          { id: "c", label: "input and encoding_format", correct: false },
          { id: "d", label: "input and prompt_tokens", correct: false },
        ],
        order: 1,
      },
      {
        question: "What happens when a client exceeds the rate limit?",
        choices: [
          { id: "a", label: "The request is silently dropped", correct: false },
          { id: "b", label: "The server returns 500 and closes the connection", correct: false },
          { id: "c", label: "The server returns 429 with a retry-after header in seconds", correct: true },
          { id: "d", label: "The account is permanently suspended", correct: false },
        ],
        order: 2,
      },
      {
        question: "Why is completion_tokens always zero in the embeddings response?",
        choices: [
          { id: "a", label: "Because embeddings do not generate output tokens; the field exists only for schema consistency", correct: true },
          { id: "b", label: "Because the model failed to complete", correct: false },
          { id: "c", label: "Because the user did not pay for completions", correct: false },
          { id: "d", label: "Because base64 encoding strips the field", correct: false },
        ],
        order: 3,
      },
    ],
  },
  {
    slug: "eng-reading-ai-papers-without-drowning",
    title: "Reading AI papers without drowning",
    description:
      "Read AI papers in a fixed order — abstract, conclusion, figures, method — and ignore math notation on the first pass.",
    dimension: "eng-reading",
    difficulty: "intermediate",
    estimatedMinutes: 20,
    order: 2,
    content: `## Why it matters
Papers are written for reviewers, not for you. If you read top-to-bottom you will burn 40 minutes on the related-work section before reaching the result. A staged read finishes most papers in 15 minutes with the same takeaway.

## What to know
- Read in this order: abstract, conclusion, figures and captions, then method only if you still need it.
- Ignore every equation on the first pass. Equations are precise restatements of sentences that already appear nearby in prose.
- Run the four-question scan as you read: (1) what problem, (2) what method, (3) what result, (4) what limitation.
- A paper that cannot answer all four in plain English from the abstract alone is not finished — your confusion is the author's fault, not yours.

## Read this
**Abstract.** Retrieval-augmented generation systems suffer from a mismatch between dense embedding similarity and downstream answer quality. We introduce SPARC, a sparse-dense reranker that combines BM25 lexical signal with a 384-dimensional dense vector via a learned gating layer trained on 1.2M annotated query-passage pairs. SPARC improves nDCG@10 by 7.4 points over a pure dense baseline and by 3.1 points over Reciprocal Rank Fusion on the BEIR benchmark, while adding only 2.1 ms of latency per query on a single H100. We release weights, training data, and a self-hostable inference container under Apache 2.0. Our results suggest that the lexical-dense gap closes most effectively when the gating signal is learned per-domain rather than tuned globally, and we observe diminishing returns past 800k training pairs. We also report a failure mode on queries shorter than three tokens, where the gating layer collapses toward the dense path and the lexical signal is effectively discarded.

## Comprehension cues
- Four-question scan applied:
  - Problem: dense similarity does not match answer quality.
  - Method: a learned gating layer that mixes BM25 with a 384-dim dense vector.
  - Result: +7.4 nDCG@10 vs dense baseline, +3.1 vs RRF, only 2.1 ms extra latency.
  - Limitation: short queries (under three tokens) collapse to the dense path.
- The numbers 7.4, 3.1, 2.1, 1.2M, 800k, and 384 are anchors. Skip the words around them on the first pass.
- "Diminishing returns past 800k" is a result, not a method detail.

## Practice next
- Pick one paper from your reading queue and answer the four questions in writing before reading the body.
- If you cannot answer a question from the abstract, that is your signal to read the matching figure, not the prose.`,
    quizzes: [
      {
        question: "From the abstract, what problem does SPARC address?",
        choices: [
          { id: "a", label: "Slow GPU inference on H100 hardware", correct: false },
          { id: "b", label: "A mismatch between dense embedding similarity and downstream answer quality", correct: true },
          { id: "c", label: "The cost of training BM25 from scratch", correct: false },
          { id: "d", label: "Hallucination in long-context generation", correct: false },
        ],
        order: 1,
      },
      {
        question: "What is the reported result on BEIR vs Reciprocal Rank Fusion?",
        choices: [
          { id: "a", label: "+7.4 nDCG@10", correct: false },
          { id: "b", label: "+3.1 nDCG@10", correct: true },
          { id: "c", label: "+2.1 nDCG@10", correct: false },
          { id: "d", label: "No improvement reported", correct: false },
        ],
        order: 2,
      },
      {
        question: "Which limitation does the abstract explicitly call out?",
        choices: [
          { id: "a", label: "Latency above 50 ms per query", correct: false },
          { id: "b", label: "Need for proprietary training data", correct: false },
          { id: "c", label: "Gating layer collapses to the dense path on queries shorter than three tokens", correct: true },
          { id: "d", label: "Memory usage exceeds 80 GB on H100", correct: false },
        ],
        order: 3,
      },
    ],
  },
  {
    slug: "eng-rfcs-github-issues-reading-discussions",
    title: "RFCs and GitHub issues — reading discussions",
    description:
      "Follow threaded technical discussions, spot implied disagreement, and separate the proposal from the pushback.",
    dimension: "eng-reading",
    difficulty: "advanced",
    estimatedMinutes: 25,
    order: 3,
    content: `## Why it matters
Real design decisions happen in long comment threads, not in docs. The original proposal is rarely what shipped. If you cannot read the disagreement, you will reimplement the version that was already rejected.

## What to know
- Read the first comment, then the last accepted comment, then walk backwards. The middle is where positions shift.
- Disagreement in technical English is almost never blunt. Watch for hedges: "I wonder if", "have we considered", "one concern is", "this might be premature". Each one signals "I disagree" said politely.
- Separate three layers in every reply: (1) what is being proposed, (2) what is being objected to, (3) what alternative is offered. A comment without an alternative is venting, not pushback.
- A maintainer's "interesting" usually means "I will not merge this".

## Read this
**Proposal (author).** I would like to propose adding a \`socket: AbortSignal\` option to \`fetch()\` so that callers can cancel an in-flight request from a different context than the one that created it. The existing \`signal\` option is tied to the request lifetime, which makes graceful shutdown of long-poll connections awkward; we end up tracking signals in a side map and aborting them on SIGTERM. A second signal scoped to the socket would let runtimes wire shutdown directly.

**Reviewer A.** This is interesting. I wonder if the use case is better served by composing AbortSignals via \`AbortSignal.any()\`, which already landed in the spec last cycle. Adding a second option to \`fetch()\` widens the API surface for what reads to me like an ergonomic gap, not a capability gap. One concern is that runtimes that do not expose a socket abstraction at all — workers, for example — would have to no-op the new field, which historically has been a source of cross-runtime bugs.

**Reviewer B.** I share A's concern about the surface area, but I do not think \`AbortSignal.any()\` covers the SIGTERM path cleanly because the host signal does not exist as an AbortSignal in most runtimes today. Could we instead expose a runtime-level \`onShutdown\` hook that vends an AbortSignal, and document the \`AbortSignal.any()\` composition as the canonical pattern? That keeps \`fetch()\` unchanged.

## Comprehension cues
- The proposal: add \`socket: AbortSignal\` to \`fetch()\`.
- Reviewer A disagrees ("interesting", "I wonder if", "one concern is") and proposes \`AbortSignal.any()\` as the alternative.
- Reviewer B partially agrees with A on surface area, partially disagrees on coverage, and proposes a third option: a runtime-level \`onShutdown\` hook plus documented composition.
- Nobody said "no". The proposal is effectively rejected by the second comment.

## Practice next
- Open one real RFC thread and label every comment as proposal, hedge, objection, or alternative before reading the resolution.`,
    quizzes: [
      {
        question: "What is the original proposal in the thread?",
        choices: [
          { id: "a", label: "Add a runtime-level onShutdown hook", correct: false },
          { id: "b", label: "Add a socket: AbortSignal option to fetch()", correct: true },
          { id: "c", label: "Deprecate the existing signal option on fetch()", correct: false },
          { id: "d", label: "Standardize AbortSignal.any() in the fetch spec", correct: false },
        ],
        order: 1,
      },
      {
        question: "Which phrase from Reviewer A most clearly signals disagreement with the proposal?",
        choices: [
          { id: "a", label: "\"This is interesting\" combined with \"I wonder if\" and \"one concern is\"", correct: true },
          { id: "b", label: "\"Adding a second option to fetch()\"", correct: false },
          { id: "c", label: "\"Which already landed in the spec last cycle\"", correct: false },
          { id: "d", label: "\"Workers, for example\"", correct: false },
        ],
        order: 2,
      },
      {
        question: "What alternative does Reviewer B propose?",
        choices: [
          { id: "a", label: "Accept the original proposal unchanged", correct: false },
          { id: "b", label: "Use AbortSignal.any() and do nothing else", correct: false },
          { id: "c", label: "Expose a runtime-level onShutdown hook that vends an AbortSignal, with AbortSignal.any() as the documented composition pattern", correct: true },
          { id: "d", label: "Remove the signal option from fetch() entirely", correct: false },
        ],
        order: 3,
      },
    ],
  },
] as const;
