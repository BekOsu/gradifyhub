export const D2_L4_LESSON = {
  slug: "llm-as-judge-and-eval-pipelines-in-ci",
  title: "LLM-as-judge and eval pipelines in CI",
  description:
    "Build automated evaluation pipelines using LLM-as-judge patterns, golden datasets, and tools like RAGAS, DeepEval, and Braintrust — wired into GitHub Actions for every deploy.",
  dimension: "llm_fundamentals_evals",
  difficulty: "advanced",
  estimatedMinutes: 22,
  order: 4,
  content: `## Why It Matters

When you ship an LLM feature, "looks good in my five test cases" is not evidence the system works. A prompt change that improves one query can silently regress fifty others, and you will not notice until a customer reports it. Production-grade teams treat evals like unit tests: every commit triggers the suite, regressions block the merge, trends are tracked across releases. The hard part is LLM outputs are open-ended — there is no single correct answer. The industry's answer is LLM-as-judge: use one model (Anthropic Claude or OpenAI GPT-4) to score another's outputs against rubrics and reference answers from a curated golden dataset.

## LLM-as-Judge Fundamentals

A judge prompt has three parts: the task description, the rubric, and the output to grade. The rubric is what separates a useful judge from a noisy one. Vague rubrics ("is this answer good?") produce inconsistent scores. Specific rubrics ("does the answer cite at least one source from the retrieved context, and is the citation factually grounded in that context?") produce stable, calibrated scores.

\`\`\`python
JUDGE_PROMPT = """You are evaluating a customer support answer.

Question: {question}
Reference answer: {reference}
Candidate answer: {candidate}

Score the candidate on a 1-5 scale across three dimensions:
1. Factual accuracy: does it contradict the reference?
2. Completeness: does it cover the key points in the reference?
3. Tone: is it professional and empathetic?

Return JSON: {{"accuracy": int, "completeness": int, "tone": int, "reasoning": str}}
"""

async def judge(question, reference, candidate):
    response = await anthropic.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=500,
        messages=[{"role": "user", "content": JUDGE_PROMPT.format(
            question=question, reference=reference, candidate=candidate,
        )}],
    )
    return json.loads(response.content[0].text)
\`\`\`

Two traps every team hits. Position bias: judges prefer the first option in pairwise comparisons — randomize order. Self-preference bias: a model scores its own outputs higher than a different model would — use a different family for the judge, or a panel and average.

## Eval Pipelines in CI

A golden dataset is the foundation. Start with 30-100 high-quality examples covering happy paths, edge cases, known failure modes, and prompt-injection attempts. Store it as JSONL in the repo so it versions with the code.

\`\`\`yaml
# .github/workflows/llm-evals.yml
name: LLM Evals
on: [pull_request]
jobs:
  evals:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm eval:run --dataset golden.jsonl --threshold 0.85
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
      - run: pnpm eval:report --post-comment
\`\`\`

The threshold flag fails the build if the average judge score drops below 0.85. Post the score breakdown as a PR comment so reviewers see the impact before they approve.

## Tools: RAGAS, DeepEval, Braintrust

RAGAS specializes in retrieval-augmented generation, with built-in metrics for faithfulness, answer relevancy, and context precision — reach for it when you have a RAG pipeline. DeepEval is the pytest of LLMs: write assertions like \`assert_relevancy(actual, expected, threshold=0.7)\` and it slots into CI cleanly. Braintrust is the hosted option, storing eval runs over time with a UI for side-by-side prompt comparison. Pick one and commit; running three in parallel means you have not chosen.

## Shadow Deployment & Drift Detection

Evals catch regressions before merge. Shadow deployment catches what evals miss. Send every production request to both the current and candidate model, return only the current model's response to the user, then log and score the candidate asynchronously. After 24-48 hours you have thousands of real examples to decide on, not just your golden 100.

Drift detection layers on top. Track the judge score on a rolling window of production traffic; if the average drops by more than two standard deviations over a week, alert. The cause is usually one of three: input distribution shifted, the provider rolled out a silent model update, or your retrieval index went stale. All three are recoverable — if you catch them in days, not months.

## Key Takeaways

- **Golden datasets**: 30-100 versioned examples in the repo, covering happy paths, edge cases, and adversarial inputs
- **LLM-as-judge**: use specific rubrics, randomize position, avoid self-preference by judging across model families
- **CI integration**: GitHub Actions runs evals on every PR, fails on regression, posts score breakdown as a comment
- **Tool choice**: RAGAS for RAG metrics, DeepEval for pytest-style assertions, Braintrust for hosted comparison UI
- **Shadow deployment**: dual-run candidate models against live traffic, score async, decide on real data
- **Drift detection**: rolling judge-score windows catch input-distribution shifts and silent model updates`,
  quizzes: [
    {
      question:
        "You ship a prompt change. Your five manual test cases still pass. What is the strongest reason this is not sufficient evidence to deploy?",
      choices: [
        {
          id: "a",
          label: "Manual tests are slower than automated ones",
          correct: false,
        },
        {
          id: "b",
          label:
            "A prompt change can improve some queries while silently regressing others — five cases cannot reveal the trade-off",
          correct: true,
        },
        {
          id: "c",
          label: "Manual testing does not use the production model",
          correct: false,
        },
        {
          id: "d",
          label: "GitHub Actions requires automated tests to deploy",
          correct: false,
        },
      ],
      order: 1,
    },
    {
      question:
        "Your team uses Claude Sonnet for the customer support bot. You decide to use an LLM-as-judge to grade outputs. Which judge setup is most likely to produce calibrated, unbiased scores?",
      choices: [
        {
          id: "a",
          label: "Use Claude Sonnet to judge Claude Sonnet's own outputs — the model knows its own style best",
          correct: false,
        },
        {
          id: "b",
          label: "Use a different model family (e.g. GPT-4) as judge with a specific rubric, and randomize answer order in pairwise comparisons",
          correct: true,
        },
        {
          id: "c",
          label: "Use a single rubric question: 'Is the answer good?'",
          correct: false,
        },
        {
          id: "d",
          label: "Have the same model judge in batches of 100 to reduce variance",
          correct: false,
        },
      ],
      order: 2,
    },
    {
      question:
        "Two weeks after deploy, your CI eval suite is still green on every PR, but users report the bot has gotten worse. Which signal is most likely missing from your pipeline?",
      choices: [
        {
          id: "a",
          label: "You need to add more unit tests to the golden dataset",
          correct: false,
        },
        {
          id: "b",
          label: "Drift detection on production traffic — your golden dataset is static, but the input distribution or provider model may have shifted",
          correct: true,
        },
        {
          id: "c",
          label: "You should switch from RAGAS to DeepEval",
          correct: false,
        },
        {
          id: "d",
          label: "Lower the CI threshold from 0.85 to 0.70",
          correct: false,
        },
      ],
      order: 3,
    },
  ],
} as const;
