import type { ItemChoice } from "@repo/contracts/assessment";

export type MockItem = {
  id: string;
  stem: string;
  choices: ItemChoice[];
  dimension: string;
};

// 27 items across 9 AI-engineer dimensions, interleaved by round for UX variety.
// soft_skills covers both professional behaviour (ai-ss-*) and communication quality (ai-en-*).
// voice_multimodal has no mock items yet — defaults to 50% neutral signal.
// Round 1 (q01-09): one from each dimension — orientation & background check
// Round 2 (q10-18): second pass — applied scenarios
// Round 3 (q19-27): third pass — production & edge cases
export const MOCK_ITEMS: MockItem[] = [

  // ── Round 1 ──────────────────────────────────────────────────────────────

  {
    id: "ai-ss-1",
    dimension: "soft_skills",
    stem: "A senior teammate says 'This approach is not right,' but gives no explanation. What is the best next step?",
    choices: [
      { id: "a", label: "Change everything immediately to avoid conflict", correct: false },
      { id: "b", label: "Ask for the reasoning and what they would suggest instead", correct: true },
      { id: "c", label: "Ignore the comment and keep going", correct: false },
      { id: "d", label: "Escalate to your manager right away", correct: false },
    ],
  },
  {
    id: "ai-en-1",
    dimension: "soft_skills",
    stem: "A client writes: 'The feature promised for Friday still does not work. This is unacceptable.' Which reply is the strongest professional response?",
    choices: [
      { id: "a", label: "Acknowledge the issue, explain current status, give a concrete fix plan, and commit to an update time", correct: true },
      { id: "b", label: "Say only that the team is working on it", correct: false },
      { id: "c", label: "Blame the delay on external dependencies", correct: false },
      { id: "d", label: "Forward the message to your manager without replying", correct: false },
    ],
  },
  {
    id: "ai-py-1",
    dimension: "python",
    stem: "You need to call three independent LLM APIs simultaneously to reduce total latency. All calls are I/O-bound. Best approach in Python:",
    choices: [
      { id: "a", label: "Three sequential `await` calls — simple but no concurrency", correct: false },
      { id: "b", label: "`asyncio.gather(call_a(), call_b(), call_c())` — event loop runs all three concurrently in a single thread", correct: true },
      { id: "c", label: "`multiprocessing.Pool(3)` — spawns separate OS processes, unnecessary for I/O-bound work", correct: false },
      { id: "d", label: "`threading.Thread × 3` — works but heavier than async for pure network I/O", correct: false },
    ],
  },
  {
    id: "ai-tool-1",
    dimension: "tooling_observability",
    stem: "You pull the latest changes from GitHub and git reports a merge conflict on `main.py`. Best approach:",
    choices: [
      { id: "a", label: "Delete your local file and accept the remote version entirely", correct: false },
      { id: "b", label: "Run `git reset --hard HEAD` to discard all local changes", correct: false },
      { id: "c", label: "Open the file, manually resolve the conflict markers, test the result, then commit", correct: true },
      { id: "d", label: "Create a new branch and cherry-pick your commits onto it", correct: false },
    ],
  },
  {
    id: "ai-ml-1",
    dimension: "llm_fundamentals_evals",
    stem: "A company wants an LLM to answer questions from their 300-page internal policy document, updated monthly. Best architecture:",
    choices: [
      { id: "a", label: "Fine-tune the base model monthly on the new document — most accurate", correct: false },
      { id: "b", label: "Include the full 300-page document in every prompt as context", correct: false },
      { id: "c", label: "Build a RAG pipeline: chunk and embed the doc, retrieve relevant sections per query", correct: true },
      { id: "d", label: "Train a domain-specific model from scratch on the document", correct: false },
    ],
  },
  {
    id: "ai-llm-1",
    dimension: "context_engineering",
    stem: "Your LLM assistant stops mid-sentence while summarising a long document. Most likely cause:",
    choices: [
      { id: "a", label: "Server timeout — the API connection dropped after 30 seconds", correct: false },
      { id: "b", label: "Rate limiting — too many requests per minute from your account", correct: false },
      { id: "c", label: "Context window exceeded — total input + output tokens surpassed the model's limit", correct: true },
      { id: "d", label: "The model lost focus on the topic after too many paragraphs", correct: false },
    ],
  },
  {
    id: "ai-rag-1",
    dimension: "rag_retrieval",
    stem: "Your RAG system retrieves irrelevant chunks when users ask about specific clauses in a legal document. Most likely fix:",
    choices: [
      { id: "a", label: "Switch to a more powerful embedding model", correct: false },
      { id: "b", label: "Reduce chunk size and add overlap around boundaries so clause context is preserved", correct: true },
      { id: "c", label: "Index more documents to give the model broader knowledge", correct: false },
      { id: "d", label: "Increase retrieved chunks from 5 to 20 per query", correct: false },
    ],
  },
  {
    id: "ai-ag-1",
    dimension: "agentic_systems",
    stem: "You are designing a function an LLM agent will call to fetch user orders. Which definition is best?",
    choices: [
      { id: "a", label: "`def f1(x)` — returns raw database rows, no type hints", correct: false },
      { id: "b", label: "`def get_user_orders(user_id: str) -> list[Order]` with a docstring describing what it returns and when to use it", correct: true },
      { id: "c", label: "A single function that accepts a free-form instruction string and interprets it internally", correct: false },
      { id: "d", label: "A function with 15 optional parameters covering every possible filter combination", correct: false },
    ],
  },
  {
    id: "ai-sd-1",
    dimension: "system_design",
    stem: "Your API endpoint triggers an LLM pipeline that takes 45 seconds. Users get timeout errors. Best production fix:",
    choices: [
      { id: "a", label: "Increase the client timeout to 90 seconds", correct: false },
      { id: "b", label: "Run the LLM pipeline in a background thread on the same server process", correct: false },
      { id: "c", label: "Return HTTP 202 Accepted with a job ID immediately; client polls `/jobs/{id}` or receives a webhook when done", correct: true },
      { id: "d", label: "Break the pipeline into smaller pieces each under 10 seconds", correct: false },
    ],
  },

  // ── Round 2 ──────────────────────────────────────────────────────────────

  {
    id: "ai-py-2",
    dimension: "python",
    stem: "An LLM returns a JSON string. You want to parse it into a typed Python object and catch missing or wrong-type fields automatically. Best approach:",
    choices: [
      { id: "a", label: "`json.loads()` into a plain dict — no type enforcement, errors fail silently", correct: false },
      { id: "b", label: "Define a Pydantic `BaseModel` and use `Model.model_validate(data)` — raises `ValidationError` on bad data", correct: true },
      { id: "c", label: "A `dataclass` with manual `__post_init__` checks — verbose and duplicates Pydantic's job", correct: false },
      { id: "d", label: "`ast.literal_eval()` — parses Python literals, not JSON", correct: false },
    ],
  },
  {
    id: "ai-ml-2",
    dimension: "llm_fundamentals_evals",
    stem: "You deploy an LLM classifier for support tickets. Overall accuracy is 94%. But it handles 'refund requests' perfectly and completely misses 'account access' tickets. Which metric would have surfaced this earlier?",
    choices: [
      { id: "a", label: "Overall accuracy — 94% shows the model is performing well", correct: false },
      { id: "b", label: "Per-class recall — shows which specific categories the model is not detecting", correct: true },
      { id: "c", label: "Training loss — shows how well the model fit the training data", correct: false },
      { id: "d", label: "Model parameter count — a larger model would handle more categories", correct: false },
    ],
  },
  {
    id: "ai-tool-2",
    dimension: "tooling_observability",
    stem: "You just cloned an AI project from GitHub. Before running `pip install -r requirements.txt`, you should:",
    choices: [
      { id: "a", label: "Run it directly — pip always installs to the system Python", correct: false },
      { id: "b", label: "Create and activate a virtual environment (`python -m venv .venv && source .venv/bin/activate`) to isolate dependencies", correct: true },
      { id: "c", label: "Install with `sudo pip install` to ensure write permissions", correct: false },
      { id: "d", label: "Check whether each requirement conflicts with your existing global packages manually", correct: false },
    ],
  },
  {
    id: "ai-llm-2",
    dimension: "context_engineering",
    stem: "Your AI assistant app makes 600 LLM API calls per minute. You notice 65% of queries are near-identical phrasings of the same 20 questions. Best cost reduction strategy:",
    choices: [
      { id: "a", label: "Switch to a cheaper model for all queries", correct: false },
      { id: "b", label: "Limit users to 10 queries per day", correct: false },
      { id: "c", label: "Cache responses using semantic similarity — return stored answers for near-duplicate queries", correct: true },
      { id: "d", label: "Add more server replicas to distribute the API load", correct: false },
    ],
  },
  {
    id: "ai-rag-2",
    dimension: "rag_retrieval",
    stem: "Your RAG chatbot gives confident answers about topics not covered in the retrieved documents. Best fix:",
    choices: [
      { id: "a", label: "Switch to a larger LLM with broader knowledge", correct: false },
      { id: "b", label: "Retrieve 20 chunks instead of 5 to cover more ground", correct: false },
      { id: "c", label: "Add to the system prompt: 'Answer only from the provided context. If the answer is not present, say you don't have this information.'", correct: true },
      { id: "d", label: "Fine-tune the LLM on your document corpus", correct: false },
    ],
  },
  {
    id: "ai-ag-2",
    dimension: "agentic_systems",
    stem: "Your LLM agent calls an external API tool that returns a `503 Service Unavailable` error. Best agent design:",
    choices: [
      { id: "a", label: "Immediately terminate the agent run and surface the error to the user", correct: false },
      { id: "b", label: "Silently skip the failed tool call and proceed to the next step", correct: false },
      { id: "c", label: "Pass the error response back to the LLM so it can decide to retry, use a fallback tool, or inform the user gracefully", correct: true },
      { id: "d", label: "Auto-retry the same call 10 times in a tight loop", correct: false },
    ],
  },
  {
    id: "ai-sd-2",
    dimension: "system_design",
    stem: "Your AI support agent handles 10,000 requests/day. The LLM API is the cost bottleneck. Profiles show 70% of requests are semantically identical questions. Best first optimization:",
    choices: [
      { id: "a", label: "Add a Redis cache keyed on the exact prompt string — fast but misses paraphrased duplicates", correct: false },
      { id: "b", label: "Embed each incoming query and check cosine similarity against a cache of prior queries; return stored response if similarity exceeds a threshold", correct: true },
      { id: "c", label: "Deploy a smaller, cheaper LLM for all requests", correct: false },
      { id: "d", label: "Pre-generate all answers at midnight and store them in a database", correct: false },
    ],
  },
  {
    id: "ai-ss-2",
    dimension: "soft_skills",
    stem: "You are a week into building a feature when you realise the requirements are ambiguous — two interpretations lead to very different systems. You:",
    choices: [
      { id: "a", label: "Pick the faster interpretation and finish — you can ask later", correct: false },
      { id: "b", label: "Stop, document both interpretations with trade-offs, and get alignment from the product owner before continuing", correct: true },
      { id: "c", label: "Implement both interpretations in separate branches so nothing blocks", correct: false },
      { id: "d", label: "Add a runtime feature flag to support both interpretations forever", correct: false },
    ],
  },
  {
    id: "ai-en-2",
    dimension: "soft_skills",
    stem: "You need to explain 'API rate limiting' to a non-technical client. The clearest explanation is:",
    choices: [
      { id: "a", label: "'Rate limiting implements a token bucket algorithm that throttles requests exceeding the configured RPS threshold.'", correct: false },
      { id: "b", label: "'Our API returns 429 HTTP status codes with Retry-After headers when limits are exceeded.'", correct: false },
      { id: "c", label: "'Think of it like a tap with a maximum flow rate — you can make up to N requests per minute, and if you exceed that, you wait briefly before trying again.'", correct: true },
      { id: "d", label: "'It is a DDoS protection mechanism that blocks excessive traffic from a single IP.'", correct: false },
    ],
  },

  // ── Round 3 ──────────────────────────────────────────────────────────────

  {
    id: "ai-py-3",
    dimension: "python",
    stem: "Before pushing your LLM integration to GitHub, you need to store your API key securely. Standard practice is:",
    choices: [
      { id: "a", label: "Hardcode the key in the source file — you can remove it before the real release", correct: false },
      { id: "b", label: "Store it in `config.json` and add the file to `.gitignore`", correct: false },
      { id: "c", label: "Set it as an environment variable, load with `os.getenv()`, and commit only a `.env.example` with a placeholder value", correct: true },
      { id: "d", label: "Base64-encode the key and embed it in the codebase", correct: false },
    ],
  },
  {
    id: "ai-ml-3",
    dimension: "llm_fundamentals_evals",
    stem: "You fine-tune an LLM on 150 customer support examples. On training examples it answers perfectly. On real customer queries it gives generic, unhelpful responses. The problem is:",
    choices: [
      { id: "a", label: "The base model is too small for the task", correct: false },
      { id: "b", label: "150 examples caused the model to overfit — it memorised patterns rather than generalising", correct: true },
      { id: "c", label: "The learning rate was too low during fine-tuning", correct: false },
      { id: "d", label: "The tokenizer is incompatible with new customer phrasing", correct: false },
    ],
  },
  {
    id: "ai-tool-3",
    dimension: "tooling_observability",
    stem: "You want your FastAPI + LLM agent to run identically on your laptop, a teammate's machine, and the production server. Most reliable approach:",
    choices: [
      { id: "a", label: "Write detailed setup instructions in README and hope all machines match", correct: false },
      { id: "b", label: "Copy your virtual environment folder to the server", correct: false },
      { id: "c", label: "Package the application in a Docker container — same environment everywhere", correct: true },
      { id: "d", label: "Install the exact same Python version on every machine manually", correct: false },
    ],
  },
  {
    id: "ai-llm-3",
    dimension: "context_engineering",
    stem: "You need an LLM to return a JSON object with specific required fields (name, score, reason) every time, reliably. Most robust approach:",
    choices: [
      { id: "a", label: "End the prompt with 'Reply in JSON only' and parse the response string", correct: false },
      { id: "b", label: "Set temperature=0 to make output deterministic and predictable", correct: false },
      { id: "c", label: "Use the API's structured output / function calling feature with a defined schema, and validate the result with Pydantic", correct: true },
      { id: "d", label: "Post-process the response with regex to extract each field", correct: false },
    ],
  },
  {
    id: "ai-rag-3",
    dimension: "rag_retrieval",
    stem: "Dense vector search works well for semantic questions but misses exact product codes and serial numbers. Best fix:",
    choices: [
      { id: "a", label: "Switch to a larger embedding model that understands exact strings better", correct: false },
      { id: "b", label: "Add all product codes to the LLM system prompt", correct: false },
      { id: "c", label: "Combine dense vector search with keyword (BM25) search — hybrid retrieval handles both semantic similarity and exact matches", correct: true },
      { id: "d", label: "Re-embed all documents more frequently to keep embeddings fresh", correct: false },
    ],
  },
  {
    id: "ai-ag-3",
    dimension: "agentic_systems",
    stem: "A multi-step agent fills in a form across 8 tool calls. On step 6, the user corrects an input from step 2. Best design for handling this:",
    choices: [
      { id: "a", label: "Restart the entire workflow from step 1 every time any input changes", correct: false },
      { id: "b", label: "Maintain a mutable state object that each tool call reads and writes — only re-run steps that depend on the changed value", correct: true },
      { id: "c", label: "Store everything in conversation history and let the LLM reconstruct state from scratch each turn", correct: false },
      { id: "d", label: "Prevent users from editing past steps once a step is completed", correct: false },
    ],
  },
  {
    id: "ai-sd-3",
    dimension: "system_design",
    stem: "Your application is hitting Anthropic's API rate limits during peak hours. Best handling strategy:",
    choices: [
      { id: "a", label: "Show users an immediate error message when the rate limit is hit", correct: false },
      { id: "b", label: "Switch to a different LLM provider automatically when limits are hit", correct: false },
      { id: "c", label: "Implement exponential backoff with jitter — wait 2ⁿ seconds between retries with random spread to avoid thundering herd", correct: true },
      { id: "d", label: "Pre-generate all responses overnight when traffic is low", correct: false },
    ],
  },
  {
    id: "ai-ss-3",
    dimension: "soft_skills",
    stem: "Your team has a production LLM system prompt that works well but nobody documented why certain instructions are in it. You are asked to maintain it. Best approach:",
    choices: [
      { id: "a", label: "Leave it unchanged and hope nothing breaks — don't touch what works", correct: false },
      { id: "b", label: "Rewrite the prompt from scratch with your own approach", correct: false },
      { id: "c", label: "Run experiments to understand each instruction's effect, document findings, and add inline comments explaining non-obvious choices", correct: true },
      { id: "d", label: "Ask the original author in chat but don't bother writing down the answer", correct: false },
    ],
  },
  {
    id: "ai-en-3",
    dimension: "soft_skills",
    stem: "You submit a PR with 400 lines of changes to an LLM integration. What is the ideal PR description?",
    choices: [
      { id: "a", label: "'Updated LLM integration' — short and professional", correct: false },
      { id: "b", label: "Paste all 400 lines of diff in the description body", correct: false },
      { id: "c", label: "Summarise: what changed and why, what was tested, any known limitations, and links to related issues or docs", correct: true },
      { id: "d", label: "Only link to the Jira ticket — the diff speaks for itself", correct: false },
    ],
  },
];

export function getMockItem(index: number): MockItem | null {
  return MOCK_ITEMS[index] ?? null;
}

export const MOCK_TOTAL = MOCK_ITEMS.length;

export const MOCK_ITEM_IDS = MOCK_ITEMS.map((i) => i.id);
