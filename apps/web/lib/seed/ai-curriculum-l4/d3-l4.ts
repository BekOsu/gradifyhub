// AI Curriculum L4 — D3 Context Engineering — Level 4: Tool use and MCP

export const D3_L4_LESSON = {
  slug: "tool-use-and-mcp-giving-ai-hands",
  title: "Tool use and MCP: giving AI hands",
  description:
    "Design tool schemas that LLMs actually call correctly, run tools in parallel, and understand why MCP became the universal plug for AI integrations.",
  dimension: "context_engineering",
  difficulty: "advanced",
  estimatedMinutes: 22,
  order: 4,
  content: `## Why It Matters
A chat model that cannot touch the outside world is a very fast librarian. The moment you let it call your code — read a database, post a Slack message, hit a Stripe endpoint — it becomes an engineer. Every serious AI product in 2026 ships with tools. Get the schema wrong and the model hallucinates arguments; get the orchestration wrong and a single user request takes 30 seconds instead of 3.

This lesson covers the three things that decide whether your tool layer works in production: schema design, parallel execution, and the Model Context Protocol (MCP) — the open standard that hit roughly 97 million SDK downloads per month in early 2026 and is now adopted by Anthropic, OpenAI, Google, and most major IDEs and agent frameworks.

## Tool Schema Design
A tool definition is a contract between you and the model. The model sees the name, the description, and the JSON schema for arguments — nothing else. If the description is fuzzy or the schema permits invalid shapes, the model will produce invalid calls and your code will throw.

Three rules:

1. **Name the tool like a function in your codebase.** \`get_order_status\` beats \`order\` or \`status_check\`.
2. **Describe when to call it, not what it does internally.** The model already infers behaviour from the name; what it cannot guess is the trigger.
3. **Make every required field truly required and every optional field have a default.** Avoid \`anyOf\` and deep nesting — flat schemas convert to correct tool calls far more often.

\`\`\`ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const tools = [
  {
    name: "get_order_status",
    description:
      "Look up the current status of a customer order. Call this whenever the user mentions an order number, asks 'where is my order', or reports a shipping issue.",
    input_schema: {
      type: "object",
      properties: {
        order_id: {
          type: "string",
          description: "The order ID, e.g. 'ORD-12345'. Required.",
        },
      },
      required: ["order_id"],
    },
  },
] as const;
\`\`\`

Notice the description tells the model the *trigger conditions*. That single sentence reduces tool-call errors more than any prompt engineering trick.

## Parallel Tool Calls
When a user asks "What is the weather in Lagos and the time in Tokyo?", a naive agent makes two sequential calls and the user waits twice. Modern Anthropic and OpenAI models will emit both \`tool_use\` blocks in a single assistant turn if you let them — and you should let them.

In the Anthropic SDK, parallel tool calls are on by default; you just have to handle them correctly on the receiving side:

\`\`\`ts
const response = await client.messages.create({
  model: "claude-sonnet-4-5",
  max_tokens: 1024,
  tools,
  messages: [
    { role: "user", content: "Status of ORD-12345 and ORD-99887?" },
  ],
});

const toolUses = response.content.filter((b) => b.type === "tool_use");

const results = await Promise.all(
  toolUses.map(async (tu) => ({
    type: "tool_result" as const,
    tool_use_id: tu.id,
    content: await runTool(tu.name, tu.input),
  })),
)
\`\`\`

The OpenAI SDK exposes the same idea via the \`parallel_tool_calls\` parameter (true by default on recent models). The pattern is the same: collect every tool call, run them with \`Promise.all\`, then return all results in one user-turn message. Skip this and a 5-tool request takes 5x longer than it should.

## The Model Context Protocol (MCP)
Before MCP, every AI app reinvented the same wheel. Want Claude to read your Google Drive? Write a Drive adapter. Want Cursor to read it? Write another. Want a Slack bot to read it? Write a third. That is the N-by-M problem: N AI clients times M data sources equals N times M bespoke integrations.

MCP is a small JSON-RPC protocol that defines three primitives a server can expose — **tools**, **resources**, and **prompts** — and a transport (stdio or HTTP+SSE) for any client to discover and call them. Write one MCP server for Google Drive and every MCP-compatible client gets Drive access for free. The protocol moved the integration cost from N times M down to N plus M.

## Why Every Provider Adopted MCP
MCP was open-sourced by Anthropic in late 2024. Within a year, OpenAI shipped MCP support in the Agents SDK, Google added it to Gemini and Vertex, Microsoft built it into Copilot Studio, and every major IDE — Cursor, Zed, JetBrains — added a client. SDK downloads crossed roughly 97 million per month.

The adoption is not about a clever protocol design; it is about leverage. A tool vendor (Notion, GitHub, Postgres) writes one MCP server and reaches every AI client on the market. A client vendor (Claude, ChatGPT, Cursor) writes one MCP client and gets every server. Neither side has to coordinate with the other. That is why MCP won — it is the only standard where the incentives line up for everyone to ship it.

## Key Takeaways
- A tool definition is a contract: clear name, trigger-focused description, flat required schema.
- Always let the model emit parallel tool calls and run them with \`Promise.all\` — sequential execution is a self-inflicted latency bug.
- MCP solves the N-times-M integration problem by giving every AI client and every data source one shared protocol.
- The 97M monthly SDK downloads in early 2026 reflect that this is now table-stakes infrastructure, not a research curiosity.
- When you build an agent, default to: small set of well-named tools, parallel execution on, and MCP for anything you do not own end-to-end.`,
  quizzes: [
    {
      question:
        "Your support agent has a tool called `lookup`. Users complain it gets called at random times and often with wrong arguments. Which fix will help the most?",
      choices: [
        {
          id: "a",
          label:
            "Rename it to `get_order_status` and rewrite the description to specify the trigger conditions (e.g. 'when the user mentions an order number').",
          correct: true,
        },
        {
          id: "b",
          label: "Lower the model temperature to 0 so it stops guessing.",
          correct: false,
        },
        {
          id: "c",
          label: "Wrap the tool call in a try/catch and silently retry on failure.",
          correct: false,
        },
        {
          id: "d",
          label: "Make every field optional so the model can call it with no arguments.",
          correct: false,
        },
      ],
      order: 1,
    },
    {
      question:
        "A user asks 'check the weather in Lagos and the time in Tokyo'. Your agent calls one tool, waits, then calls the other — total latency is 2.1s. What is the correct fix?",
      choices: [
        {
          id: "a",
          label: "Combine both into a single mega-tool that takes a location and returns weather+time together.",
          correct: false,
        },
        {
          id: "b",
          label:
            "Let the model emit both tool_use blocks in one turn, run them with Promise.all, and return all tool_results in a single message.",
          correct: true,
        },
        {
          id: "c",
          label: "Switch to a faster model so each sequential call is shorter.",
          correct: false,
        },
        {
          id: "d",
          label: "Cache the previous tool result and reuse it for the second call.",
          correct: false,
        },
      ],
      order: 2,
    },
    {
      question:
        "Your team wants Claude, Cursor, and an internal Slack bot to all read from the same internal wiki. Before MCP, this required three separate adapters. Why did MCP make this go away?",
      choices: [
        {
          id: "a",
          label:
            "MCP is faster than REST, so one server can handle all three clients without code changes.",
          correct: false,
        },
        {
          id: "b",
          label:
            "MCP defines a shared client-server protocol, so one wiki MCP server is consumed by every MCP-compatible client — the integration cost drops from N times M to N plus M.",
          correct: true,
        },
        {
          id: "c",
          label:
            "MCP runs the LLM locally, so no network adapter is needed for any client.",
          correct: false,
        },
        {
          id: "d",
          label:
            "MCP automatically generates client code from any REST endpoint, so adapters write themselves.",
          correct: false,
        },
      ],
      order: 3,
    },
  ],
} as const;
