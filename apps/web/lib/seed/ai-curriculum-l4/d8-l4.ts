export const D8_L4_LESSON = {
  slug: "mlops-for-llm-applications",
  title: "MLOps for LLM applications",
  description:
    "Operate LLM apps in production the way ML teams operate models: eval pipelines in GitHub Actions, DeepEval metrics, drift detection on traces, and shadow deployment of candidate models against live traffic.",
  dimension: "tooling_observability",
  difficulty: "advanced",
  estimatedMinutes: 22,
  order: 4,
  content: `## Why It Matters

Classic MLOps was built around a training loop: collect data, train, validate, deploy, monitor, retrain. LLM apps skip the training loop entirely — you call a hosted Claude or GPT endpoint and the weights are someone else's problem. New engineers conclude that means MLOps does not apply, and that is how teams ship a prompt on Friday and wake up Monday to a quality drop nobody noticed. You still have a model in production, inputs that drift, and a candidate version to compare against the current one. The shape of the discipline — evals as tests, drift as monitoring, shadow as canary — is identical to model MLOps. Only the artifact changed: prompts, retrieval indices, and tool schemas replace weights.

## Eval Pipelines in GitHub Actions

The first habit to port over is treating evals like unit tests: every PR runs them, regressions block merge. The versioned artifact is a JSONL golden dataset in the repo, not a model checkpoint.

\`\`\`yaml
# .github/workflows/evals.yml
name: LLM Evals
on: [pull_request]
jobs:
  deepeval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install deepeval
      - run: deepeval test run tests/evals/ --display=summary
        env:
          OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
      - name: Fail if scores drop below threshold
        run: python scripts/check_eval_threshold.py --min-score 0.85
\`\`\`

DeepEval runs against the golden set; the threshold check fails the build if the average regresses below 0.85; a PR comment posts the per-metric breakdown so reviewers see which dimension dropped before approving.

## DeepEval and Custom Metrics

DeepEval is the pytest of LLM evals — test cases, metrics, asserts. The three metrics that matter most are G-Eval (an LLM-as-judge metric where you describe the rubric in plain English), the hallucination metric (does the output contradict the source context?), and faithfulness (is every claim grounded in retrieved context?).

\`\`\`python
from deepeval import assert_test
from deepeval.test_case import LLMTestCase
from deepeval.metrics import GEval, HallucinationMetric, FaithfulnessMetric

def test_support_answer_is_grounded():
    case = LLMTestCase(
        input="How do I cancel my subscription?",
        actual_output=run_my_agent("How do I cancel my subscription?"),
        retrieval_context=["Subscriptions can be cancelled from Settings > Billing."],
    )
    correctness = GEval(
        name="Correctness",
        criteria="Output must give the exact path from settings and not invent steps.",
        threshold=0.8,
    )
    assert_test(case, [correctness, HallucinationMetric(threshold=0.2), FaithfulnessMetric(threshold=0.9)])
\`\`\`

RAGAS is the alternative for retrieval-heavy stacks — it ships context-precision and context-recall metrics out of the box. Pick one. Two frameworks in parallel is a sign nobody chose.

## Drift Detection in Production

Evals catch what you knew to test. Drift detection catches what changed in the wild. The mechanic: every production request is traced via OpenTelemetry into LangSmith, Arize, or Braintrust; a sampled subset is re-scored asynchronously with the same DeepEval metrics; the rolling weekly average is compared against last week's baseline. If this week's faithfulness drops more than two standard deviations, an alert fires. The cause is almost always one of three: input distribution shifted, the provider rolled a silent model update, or your retrieval index went stale. All three are recoverable in days if you watch the graph, and in months if you do not.

## Shadow Deployment of New Models

When you want to swap Claude Sonnet 4.5 for the next version, or shift traffic to Haiku to cut cost, you do not flip a flag and pray. You shadow. Every request is mirrored to both the current model and the candidate; the user only sees the current model's response; the candidate's output is logged and scored async by the same DeepEval metrics CI uses. After 24 to 72 hours you have thousands of real examples — not your golden 100 — and decide on evidence. Same shape as a canary deployment of a trained model, minus the training step.

## The MLOps Stack for LLMs (2026)

The reference stack: DeepEval or RAGAS for metrics; GitHub Actions for CI eval gates; LangSmith, Arize, or Braintrust for traces, datasets, and the shadow-vs-current comparison UI; OpenTelemetry traces as the wire format so you are not locked in; Sentry for the latency and error half, kept separate from quality. The cardinal mistake is collapsing quality and reliability into one dashboard — different signals, different alarms.

## Key Takeaways

- **No training loop, same discipline**: evals, drift, and shadow have the same shape as classic MLOps; only the artifact changed from weights to prompts and indices
- **GitHub Actions + DeepEval**: every PR runs the eval suite, fails the build below threshold, posts per-metric deltas as a comment
- **Right metrics for the job**: G-Eval for custom rubrics, hallucination metric for context contradictions, faithfulness for RAG grounding
- **Drift on traces**: sample production via OpenTelemetry into LangSmith / Arize / Braintrust, re-score with DeepEval, alert on rolling-window deviation
- **Shadow before swap**: dual-run candidate models silently for 24 to 72 hours, score async, decide on real traffic — never on the golden set alone
- **Quality and reliability are separate dashboards**: do not collapse Sentry-style latency alerts and DeepEval-style quality alerts into the same channel`,
  quizzes: [
    {
      question:
        "A junior teammate argues that MLOps does not apply to your LLM app because there is no training loop. What is the strongest counter-argument grounded in how production LLM teams actually operate?",
      choices: [
        {
          id: "a",
          label: "MLOps does not apply — they are right, and you should remove the eval pipeline to save CI minutes",
          correct: false,
        },
        {
          id: "b",
          label:
            "The training loop is gone, but evals-as-tests, drift detection, and shadow deployment have the same shape as model MLOps — the artifact just changed from weights to prompts and indices",
          correct: true,
        },
        {
          id: "c",
          label: "MLOps only applies once you self-host the model weights",
          correct: false,
        },
        {
          id: "d",
          label: "You should fine-tune a model so MLOps becomes relevant again",
          correct: false,
        },
      ],
      order: 1,
    },
    {
      question:
        "Your CI runs DeepEval on every PR and the suite has been green for two weeks. Users start reporting that the bot's answers have gotten worse. Which production-side signal is most likely missing from your stack?",
      choices: [
        {
          id: "a",
          label: "Add more unit tests around the prompt template",
          correct: false,
        },
        {
          id: "b",
          label:
            "Drift detection on sampled production traces — your golden dataset is static, but the input distribution or the provider model may have shifted, and only a rolling-window re-score will catch it",
          correct: true,
        },
        {
          id: "c",
          label: "Lower the CI threshold so more PRs merge faster",
          correct: false,
        },
        {
          id: "d",
          label: "Replace DeepEval with RAGAS — the metric is the problem",
          correct: false,
        },
      ],
      order: 2,
    },
    {
      question:
        "You want to move 100 percent of traffic from Claude Sonnet to a cheaper model. Your golden eval set of 120 examples still passes for both. What is the safest next step before flipping the switch?",
      choices: [
        {
          id: "a",
          label: "Flip the flag in production — the golden set passed, that is sufficient evidence",
          correct: false,
        },
        {
          id: "b",
          label:
            "Shadow-deploy the candidate: dual-run both models on live traffic, return only the current model's response to users, score the candidate's logged outputs async with the same DeepEval metrics for 24 to 72 hours, then decide on real-traffic evidence",
          correct: true,
        },
        {
          id: "c",
          label: "Increase the golden set from 120 to 1000 examples and re-run CI",
          correct: false,
        },
        {
          id: "d",
          label: "Switch from GitHub Actions to a hosted eval service and re-run the same golden set there",
          correct: false,
        },
      ],
      order: 3,
    },
  ],
} as const;
