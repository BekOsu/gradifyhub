export const D7_L4_LESSON = {
  slug: "enterprise-ai-deployment",
  title: "Enterprise AI deployment",
  description:
    "Ship AI into Fortune 500 environments: data residency and compliance (SOC 2, HIPAA, GDPR), self-healing detect-recover-learn loops, and pilot-to-production rollout via shadow mode, gradual traffic, and kill-switches.",
  dimension: "system_design",
  difficulty: "advanced",
  estimatedMinutes: 22,
  order: 4,
  content: `## Why It Matters

Selling AI to an enterprise is not selling SaaS. A SaaS product wins by self-serve speed: sign up, swipe a card, ship. An AI agency selling to a bank, hospital, or insurer wins by surviving procurement: a security questionnaire, a data-residency review, a SOC 2 report, a redline of your MSA, and an architecture diagram their CISO has to sign. The deal is closed when their compliance team stops saying no. The work after the deal is what kills most vendors — pilots that look great in a demo never reach production because nobody designed for the rollout. Enterprise AI deployment is three disciplines stitched together: compliance you can prove on paper, an architecture that self-heals when models drift, and a rollout path that converts a 30-day pilot into a 90-day production system without a single panicked Sunday.

## Data Residency & Compliance

Where the data lives is the first question every enterprise buyer asks. A European bank cannot send customer records to a US LLM endpoint — GDPR Article 44 restricts cross-border transfers unless you have Standard Contractual Clauses and a documented adequacy decision. A US hospital under HIPAA cannot send PHI to any LLM that has not signed a Business Associate Agreement. SOC 2 Type II is the table-stakes report: it proves your controls (access, encryption, change management) have run for at least six months without exception.

The architectural choice flows from this. Anthropic and OpenAI offer regional endpoints (EU, US) and HIPAA-eligible deployments through AWS Bedrock and Azure OpenAI. For data that cannot leave the customer's perimeter at all — defense, classified health records, sovereign government workloads — the answer is on-premise or VPC-deployed open-weight models (Llama 3.3 70B, Mistral Large) served via vLLM behind their firewall. The decision is not "which model is best" but "which model is the only one their legal team will let us ship."

## Self-Healing Architecture (Detect, Recover, Learn)

Production AI fails differently than production CRUD. The endpoint stays 200 OK, but the answers go subtly wrong: a provider rolls out a silent model update, retrieval drifts, a prompt-injection pattern slips past. You need three loops running continuously.

\`\`\`python
from circuitbreaker import circuit
from anthropic import Anthropic
from openai import OpenAI

primary = Anthropic()
fallback = OpenAI()

@circuit(failure_threshold=5, recovery_timeout=60)
async def call_primary(prompt: str) -> str:
    resp = await primary.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    return resp.content[0].text

async def answer(prompt: str) -> str:
    try:
        result = await call_primary(prompt)
    except Exception as err:
        log_incident(err)
        result = await call_fallback(prompt)
    score = await judge_quality(prompt, result)
    if score < QUALITY_FLOOR:
        await enqueue_for_retraining(prompt, result, score)
    return result
\`\`\`

Detect via judge scores on a rolling production sample. Recover via a circuit breaker that trips on consecutive failures and routes to a fallback provider — the user never sees the outage. Learn by feeding low-score traces into a retraining queue that nightly produces a new prompt or fine-tune candidate, which then enters the rollout pipeline below.

## Pilot-to-Production: Shadow Mode

Shadow mode is the safest first step. Every production request hits the live system and the candidate in parallel, but only the live response is returned to the user. The candidate's output is logged, judged asynchronously, and never reaches a customer. After 48 hours of real traffic you have thousands of judged examples on the actual input distribution — not your golden dataset.

## Pilot-to-Production: Gradual Rollout

Once shadow scores beat the live system, gate the candidate behind a feature flag (LaunchDarkly, Statsig, or a Postgres-backed flag table) and ramp by traffic percentage: 1 percent, then 10, then 50, then 100. Each step bakes for at least 24 hours. The kill-switch is non-negotiable — a single boolean in the flag store that reverts 100 percent of traffic to the previous version in under 30 seconds, no deploy required.

\`\`\`typescript
const rollout = await getFlag("ai-answer-v2-rollout"); // 0..100
const useCandidate = hash(userId) % 100 < rollout;
const handler = useCandidate ? answerV2 : answerV1;
return handler(prompt);
\`\`\`

## Pilot-to-Production: Full Deployment & Monitoring

At 100 percent, the work shifts to monitoring. Track judge score, p95 latency, cost per request, fallback rate, and kill-switch trips on dashboards the customer can see. Send a weekly executive summary — enterprise buyers measure success by the slide deck, not the Grafana panel. Renew the SOC 2 audit, refresh DPIA records, and re-baseline the eval suite every quarter as the input distribution shifts.

## Key Takeaways

- Enterprise sales is won in procurement: SOC 2, HIPAA BAA, GDPR data residency are gates, not features.
- Pick the deployment model the customer's legal team will approve — regional endpoint, VPC, or on-premise open weights.
- Self-healing means detect with judges, recover with circuit breakers and fallback providers, learn via retraining queues.
- Never go straight to production. Shadow mode first, then 1 to 100 percent gradual rollout behind feature flags.
- A kill-switch that reverts in under 30 seconds is the single most important deployment control.`,
  quizzes: [
    {
      question:
        "A European bank wants to deploy your AI agent on their customer service line. Their legal team flags that no customer data can leave the EU, and they want a signed SOC 2 Type II report before signing the MSA. Which architecture is most likely to clear procurement?",
      choices: [
        {
          id: "a",
          label: "Route all traffic to the standard Anthropic US endpoint — it is the most capable model available",
          correct: false,
        },
        {
          id: "b",
          label:
            "Use an EU-region LLM endpoint (or VPC-deployed open-weight model) under your SOC 2 Type II scope, with a DPA covering GDPR cross-border transfers",
          correct: true,
        },
        {
          id: "c",
          label: "Ship a local laptop demo and promise compliance after the pilot proves value",
          correct: false,
        },
        {
          id: "d",
          label: "Encrypt the prompts client-side before sending to the US endpoint — encryption removes the residency requirement",
          correct: false,
        },
      ],
      order: 1,
    },
    {
      question:
        "Your AI assistant is live for an enterprise customer. The provider silently updates the underlying model, and over the next 48 hours judge scores on production traffic drift down by three standard deviations — but the API still returns 200 OK on every call. Which combination of controls catches and contains this fastest?",
      choices: [
        {
          id: "a",
          label: "Increase the timeout on the LLM client and add more retries — the issue is transient latency",
          correct: false,
        },
        {
          id: "b",
          label:
            "Rolling judge-score monitoring detects the regression, the circuit breaker routes to a fallback provider, and the kill-switch reverts the feature flag to the previous prompt or model — all without a deploy",
          correct: true,
        },
        {
          id: "c",
          label: "Email the customer's procurement team and request a 7-day grace period to investigate",
          correct: false,
        },
        {
          id: "d",
          label: "Wait for the next quarterly eval review to confirm the regression before taking action",
          correct: false,
        },
      ],
      order: 2,
    },
    {
      question:
        "You are moving a successful 30-day pilot into production for a hospital network. The CTO asks how you will avoid breaking the live workflow when you swap in your new fine-tuned model. What is the strongest plan to present?",
      choices: [
        {
          id: "a",
          label: "Cut over 100 percent of traffic at 2 a.m. on Sunday when usage is lowest, and watch dashboards for an hour",
          correct: false,
        },
        {
          id: "b",
          label: "Run the candidate in shadow mode against live traffic for 48 hours, judge the outputs offline, then ramp 1 to 10 to 50 to 100 percent behind a feature flag with a 30-second kill-switch and a 24-hour bake at each step",
          correct: true,
        },
        {
          id: "c",
          label: "A/B test by routing odd user IDs to the new model and even IDs to the old model permanently",
          correct: false,
        },
        {
          id: "d",
          label: "Let the customer's IT team manually toggle the new model on a per-department basis",
          correct: false,
        },
      ],
      order: 3,
    },
  ],
} as const;
