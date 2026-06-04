// One-off: backfill globalSequenceIndex for 34 AI Engineer curriculum lessons.
// Run: pnpm tsx scripts/backfill-sequence.cts
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Pool } = require("/Users/abubaker/projects/graduate-dev/packages/db/node_modules/pg");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path");

for (const file of [".env.local", ".env"]) {
  const filePath = path.resolve(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const val = match[2].trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error("DATABASE_URL not set"); process.exit(1); }

function normUrl(url: string): string {
  const u = new URL(url);
  if (u.searchParams.get("sslmode") && u.searchParams.get("uselibpqcompat") !== "true") {
    u.searchParams.set("uselibpqcompat", "true");
  }
  return u.toString();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pool = new Pool({ connectionString: normUrl(DATABASE_URL!), max: 3 }) as any;

const AI_SEQUENCE: Record<string, number> = {
  "python-patterns-every-ai-engineer-needs": 1,
  "how-language-models-work-no-phd-required": 2,
  "calling-llm-apis-without-surprises": 3,
  "prompt-patterns-that-actually-work": 4,
  "getting-structured-output-from-llms-reliably": 5,
  "setting-up-a-proper-ai-dev-environment": 6,
  "embeddings-explained-for-engineers": 7,
  "vector-databases-when-why-and-how": 8,
  "build-a-rag-pipeline-from-scratch": 9,
  "production-rag-beyond-the-tutorial": 10,
  "context-engineering-the-skill-that-replaced-prompt-engineering": 11,
  "tool-use-and-mcp-giving-ai-hands": 12,
  "building-your-first-ai-agent": 13,
  "langgraph-stateful-agent-workflows": 14,
  "multi-agent-systems": 15,
  "multi-channel-agent-deployment": 16,
  "debugging-ai-systems-with-observability-tools": 17,
  "debugging-a-containment-rate-drop": 18,
  "evals-how-engineers-know-their-ai-is-working": 19,
  "llm-as-judge-and-eval-pipelines-in-ci": 20,
  "designing-production-ai-services": 21,
  "ai-cost-optimization": 22,
  "multimodal-ai-building-with-vision-and-audio": 23,
  "building-a-voice-pipeline": 24,
  "real-time-voice-barge-in-and-vad": 25,
  "voice-ai-at-scale": 26,
  "ai-product-decisions-when-ai-helps-and-when-it-hurts": 27,
  "technical-discovery-with-clients": 28,
  "delivering-ai-projects-end-to-end": 29,
  "enterprise-ai-deployment": 30,
  "ai-observability-at-scale": 31,
  "mlops-for-llm-applications": 32,
  "high-performance-python-for-ai-pipelines": 33,
  "testing-ai-code": 34,
};

async function main() {
  const client = await pool.connect();
  try {
    let updated = 0;
    let skipped = 0;
    for (const [slug, idx] of Object.entries(AI_SEQUENCE)) {
      const res = await client.query(
        `UPDATE lesson SET global_sequence_index = $1 WHERE slug = $2 AND global_sequence_index != $1 RETURNING id`,
        [idx, slug],
      );
      if (res.rowCount > 0) {
        console.log(`  [updated] ${slug} → ${idx}`);
        updated++;
      } else {
        skipped++;
      }
    }
    console.log(`\nDone. ${updated} updated, ${skipped} already correct.`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
