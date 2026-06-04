// AI Engineer — D5 Agentic Systems — L4 (advanced, 22 min, order 4)

export const D5_L4_LESSON = {
  slug: "multi-channel-agent-deployment",
  title: "Multi-channel agent deployment",
  description:
    "Deploy one agent core to WhatsApp, Slack, Teams, and Email with the channel adapter pattern and a shared memory layer keyed by user, not channel.",
  dimension: "agentic_systems",
  difficulty: "advanced",
  estimatedMinutes: 22,
  order: 4,
  content: `## Why It Matters
You spent weeks tuning prompts and tools, and the agent finally behaves. Now the business wants it on WhatsApp for customers, Slack for support, Microsoft Teams for enterprise clients, and email for after-hours queries. The wrong move is to fork the agent four times — four codebases drifting apart within a month. The right move is one agent core with thin per-channel adapters around it. You train once, fix bugs once, and the user gets the same agent everywhere with the same memory of past conversations.

## The Channel Adapter Pattern
The adapter pattern keeps the agent platform-agnostic. The core takes a normalized message in, returns a normalized response. Each channel adapter is responsible for one thing: translate the channel's payload into the core's shape, and translate the core's response back.

\`\`\`python
# agent core — knows nothing about WhatsApp, Slack, or email
async def agent_core(user_id: str, conversation_id: str, text: str) -> AgentReply:
    history = await memory.load(user_id, conversation_id)
    reply = await run_graph(history + [{"role": "user", "content": text}])
    await memory.append(user_id, conversation_id, text, reply.content)
    return reply  # { content, suggested_actions, attachments }

# WhatsApp adapter
@whatsapp_webhook
async def on_whatsapp(payload):
    msg = payload["entry"][0]["changes"][0]["value"]["messages"][0]
    user_id = canonical_user(whatsapp_phone=msg["from"])
    reply = await agent_core(user_id, msg["from"], msg["text"]["body"])
    await whatsapp_send(msg["from"], reply.content)

# Slack adapter (Bolt)
@app.event("message")
async def on_slack(event, say):
    user_id = canonical_user(slack_user=event["user"])
    reply = await agent_core(user_id, event["channel"], event["text"])
    await say(reply.content)
\`\`\`

Notice the core never sees \`msg["from"]\` or a Slack channel ID. It sees a stable \`user_id\` and a \`conversation_id\`. That stability is what makes shared memory possible.

## WhatsApp Business API: 24h Session Windows & Templates
WhatsApp Business API enforces a hard rule that catches every team off-guard: you may only send free-form messages within a 24-hour window after the user's last message. Outside that window, you must send a pre-approved message template. Your adapter must track \`last_inbound_at\` per user and, when the agent wants to send a proactive nudge after 25 hours of silence, route through a template instead of a plain text send. Templates are submitted to Meta for approval and live as named objects (\`order_status_update\`, \`appointment_reminder\`) with positional variables.

Practical consequence: your agent core should not call \`send\` directly. The WhatsApp adapter wraps every outbound message with a session-window check and falls back to the template path when needed, often with a degraded message ("Tap here to continue our chat").

## Slack Bolt and Microsoft Bot Framework for Teams
For Slack, the Slack Bolt SDK handles event subscriptions, signing-secret verification, and the socket-mode versus HTTP-mode split. Your adapter subscribes to \`message.im\`, \`app_mention\`, and \`message.channels\`, decides which events the agent should respond to, and uses \`thread_ts\` as the conversation ID so threaded replies stay grouped.

For Teams, Microsoft Bot Framework gives you activity handlers — \`onMessage\`, \`onMembersAdded\`, \`onTeamsChannelCreated\`. Activities arrive through the Bot Connector service with a JWT you must validate. The conversation ID Microsoft hands you is opaque but stable; use it as the agent's \`conversation_id\`.

Both SDKs handle the boring parts (signature verification, retries, ack-within-3-seconds rules). Your adapter is twenty to fifty lines per channel, not hundreds.

## Email Agents: Stricter Validation
Email is async and unforgiving. Users see one finished message that lands in their inbox and may be forwarded, replied-to days later, or quoted in legal review. Two operational rules apply.

First, route through the Gmail API for Google Workspace and the Microsoft Graph API for Microsoft 365. Both give you push notifications (Gmail watch + Pub/Sub, Graph change notifications) instead of polling IMAP, and both preserve \`In-Reply-To\` and \`References\` headers for in-thread replies.

Second, output validation must be stricter than any chat channel. Run the agent's draft through a validator before send: PII redaction, link-domain allowlist, attachment-size cap, and a structured-output check that the reply actually answers the question. A bad WhatsApp reply gets a follow-up emoji; a bad email reply gets a chargeback.

## Shared Memory Across Channels
The whole pattern collapses without a shared memory layer keyed by \`user_id\`, not by channel. A customer who chatted on WhatsApp on Tuesday and emailed on Thursday is the same person — the agent should know about Tuesday's order question without being told twice. The mapping table maps \`(channel, channel_user_id)\` to a canonical \`user_id\`. Memory writes happen in the core after every turn. Memory reads happen in the core before every turn. Adapters never touch memory directly.

Voice is a channel too — see D6 for the full implementation with LiveKit and the OpenAI Realtime API. The contract is the same: voice adapter in, normalized message to core, response out.

## Key Takeaways
- One agent core, many thin adapters. Never fork the agent per channel.
- Adapters translate channel payloads to a normalized \`(user_id, conversation_id, text)\` shape.
- WhatsApp Business API enforces a 24-hour session window; outside it, use approved message templates.
- Slack Bolt SDK handles event subscriptions and signing; Microsoft Bot Framework exposes activity handlers for Teams.
- Email via Gmail API or Microsoft Graph API is async and demands stricter output validation than chat.
- Shared memory keyed by canonical user, not by channel, is what makes the agent feel like one assistant everywhere.
- Voice is just another adapter — full coverage in D6.`,
  quizzes: [
    {
      question:
        "A customer chats with your agent on WhatsApp on Tuesday about an order. On Thursday they email the same agent. They expect the agent to remember Tuesday. Which design choice makes this work?",
      choices: [
        {
          id: "a",
          label: "Store memory keyed by WhatsApp phone number in one table and by email address in another.",
          correct: false,
        },
        {
          id: "b",
          label:
            "Map each channel identity to a canonical user_id and key the shared memory layer by that user_id, with adapters only translating payloads.",
          correct: true,
        },
        { id: "c", label: "Ask the customer in the email to paste a transcript of their WhatsApp chat.", correct: false },
        {
          id: "d",
          label: "Fork the agent into a WhatsApp version and an email version and sync nightly.",
          correct: false,
        },
      ],
      order: 1,
    },
    {
      question:
        "Your agent wants to send a proactive reminder to a WhatsApp user 30 hours after their last message. You call the WhatsApp Business API send endpoint with a free-form text body and it fails. Why?",
      choices: [
        {
          id: "a",
          label: "WhatsApp only supports outbound messages from verified phone numbers, which is unrelated to timing.",
          correct: false,
        },
        {
          id: "b",
          label: "Free-form messages outside the 24-hour session window are rejected; you must send a pre-approved message template instead.",
          correct: true,
        },
        { id: "c", label: "The WhatsApp Business API does not allow proactive messages of any kind.", correct: false },
        {
          id: "d",
          label: "You must wait at least 48 hours between outbound messages on WhatsApp.",
          correct: false,
        },
      ],
      order: 2,
    },
    {
      question:
        "You are picking the right pattern for shipping the same agent to Slack, Teams, and email simultaneously. Which approach scales without prompt and tool drift?",
      choices: [
        {
          id: "a",
          label: "Copy the agent codebase three times and let each team maintain its own version per channel.",
          correct: false,
        },
        {
          id: "b",
          label: "Put if/else branches inside the agent prompt for each channel and pass the channel name as input.",
          correct: false,
        },
        {
          id: "c",
          label:
            "Keep one agent core with a normalized message contract, and write thin adapters per channel using Slack Bolt SDK, Microsoft Bot Framework activity handlers, and Gmail API or Microsoft Graph API for email — with stricter output validation on the email adapter.",
          correct: true,
        },
        {
          id: "d",
          label: "Run all channels through Slack by forwarding Teams and email messages into a Slack channel for the agent to read.",
          correct: false,
        },
      ],
      order: 3,
    },
  ],
} as const;
