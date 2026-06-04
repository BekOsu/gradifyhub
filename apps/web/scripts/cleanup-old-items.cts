// Clean up: delete all old questions, keep only the 15 new curated ones
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Pool } = require("/Users/abubaker/projects/graduate-dev/packages/db/node_modules/pg");

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

const NEW_ITEMS = [
  // 15 hard curriculum questions (difficultyB=1 and 0.5)
  "ai-voice-1", "ai-voice-2", "ai-voice-3",
  "ai-eval-1", "ai-eval-2",
  "ai-ctx-1", "ai-ctx-2",
  "ai-agt-1", "ai-agt-2",
  "ai-rag-hard-1", "ai-rag-hard-2",
  "ai-cost-1", "ai-cost-2",
  "ai-obs-1", "ai-obs-2",
  // 8 new basic questions (difficultyB=0, for foundation learning)
  "ai-py-basics-1", "ai-py-basics-2",
  "ai-ss-basics-1", "ai-ss-basics-2",
  "ai-en-basics-1", "ai-en-basics-2",
  "ai-sd-basics-1", "ai-sd-basics-2",
];

async function cleanup() {
  try {
    console.log("Deleting responses to old items first...");

    const placeholders = NEW_ITEMS.map((_, i) => `$${i + 1}`).join(",");
    const deleteResponsesQuery = `DELETE FROM response WHERE item_id NOT IN (${placeholders})`;

    const responseResult = await pool.query(deleteResponsesQuery, NEW_ITEMS);
    console.log(`✅ Deleted ${responseResult.rowCount} old responses`);

    console.log("Deleting all old assessment items...");
    const deleteQuery = `DELETE FROM item WHERE id NOT IN (${placeholders})`;

    const result = await pool.query(deleteQuery, NEW_ITEMS);
    console.log(`✅ Deleted ${result.rowCount} old items`);

    const countResult = await pool.query("SELECT COUNT(*) as count FROM item");
    const remaining = countResult.rows[0].count;

    console.log(`✅ Cleanup complete. Remaining items: ${remaining}`);
    console.log(`Items kept (15 curriculum + 8 foundation = 23 total):`);
    NEW_ITEMS.forEach(id => console.log(`  - ${id}`));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await pool.end();
  }
}

cleanup();
