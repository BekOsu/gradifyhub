// Data sourced from roadmap.sh (CC BY 4.0) — https://roadmap.sh
// Fetches per-topic resource links from roadmap.sh GitHub content markdown files
// and inserts them into roadmap_catalog_content.
//
// Run: node --env-file=.env.local scripts/import-roadmap-content.cts [slug1 slug2 ...]
// Default roadmaps when no args: python ai-engineer prompt-engineering machine-learning

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Pool } = require("/Users/abubaker/projects/graduate-dev/packages/db/node_modules/pg");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { spawnSync } = require("child_process");

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

function normalizeDatabaseUrl(url: string): string {
  const u = new URL(url);
  if (
    u.searchParams.get("sslmode") &&
    ["prefer", "require", "verify-ca"].includes(u.searchParams.get("sslmode")!) &&
    u.searchParams.get("uselibpqcompat") !== "true"
  ) {
    u.searchParams.set("uselibpqcompat", "true");
  }
  return u.toString();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pool = new Pool({ connectionString: normalizeDatabaseUrl(DATABASE_URL), max: 3 }) as any;

// Types we keep. Excludes 'roadmap' (internal roadmap.sh links) and 'feed' (RSS).
const KEEP_TYPES = new Set(["official", "article", "video", "course", "opensource"]);

interface GHFile {
  name: string;
  download_url: string | null;
  type: string;
}

interface Resource {
  type: string;
  title: string;
  url: string;
}

function ghApiPage(apiPath: string, page: number): GHFile[] {
  const result = spawnSync(
    "gh",
    ["api", `${apiPath}?per_page=100&page=${page}`],
    { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 }
  );
  if (result.status !== 0 || !result.stdout.trim()) return [];
  try {
    return JSON.parse(result.stdout) as GHFile[];
  } catch {
    return [];
  }
}

function listContentFiles(roadmapSlug: string): GHFile[] {
  const apiPath = `repos/nilbuild/developer-roadmap/contents/src/data/roadmaps/${roadmapSlug}/content`;
  const allFiles: GHFile[] = [];
  for (let page = 1; page <= 10; page++) {
    const batch = ghApiPage(apiPath, page);
    allFiles.push(...batch);
    if (batch.length < 100) break;
  }
  return allFiles.filter((f) => f.type === "file" && f.name.endsWith(".md"));
}

async function fetchMarkdown(downloadUrl: string): Promise<string | null> {
  const res = await fetch(downloadUrl);
  if (!res.ok) return null;
  return res.text();
}

function parseResources(markdown: string): Resource[] {
  const results: Resource[] = [];
  // Format: - [@type@Title](URL)
  // Use a lazy match for the URL so ) inside query strings isn't cut off.
  const pattern = /- \[@(\w+)@([^\]]+)\]\((https?:\/\/.+?)\)(?:\s|$)/g;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(markdown)) !== null) {
    const type = m[1].toLowerCase();
    const title = m[2].trim();
    const url = m[3].trim();
    if (!KEEP_TYPES.has(type)) continue;
    if (!url.startsWith("http")) continue;
    results.push({ type, title, url });
  }
  return results;
}

async function importRoadmapContent(slug: string): Promise<void> {
  console.log(`\n[${slug}] Listing content files...`);
  const files = listContentFiles(slug);
  console.log(`[${slug}] Found ${files.length} content files`);

  let nodesMissed = 0;
  let resourcesInserted = 0;

  for (const file of files) {
    // Filename format: {topic-slug}@{node-id}.md
    const match = file.name.match(/^.+@(.+)\.md$/);
    if (!match || !file.download_url) continue;
    const nodeId = match[1];

    // Look up the catalog node by roadmap + nodeId
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodeRes = await (pool as any).query(
      `SELECT id FROM roadmap_catalog_node WHERE roadmap_id = $1 AND node_id = $2`,
      [slug, nodeId]
    );
    if (nodeRes.rows.length === 0) {
      nodesMissed++;
      continue;
    }
    const catalogNodeId = nodeRes.rows[0].id as string;

    const markdown = await fetchMarkdown(file.download_url);
    if (!markdown) continue;

    const resources = parseResources(markdown);
    if (resources.length === 0) continue;

    for (let i = 0; i < resources.length; i++) {
      const { type, title, url } = resources[i];
      const id = `${catalogNodeId}-r${i}`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (pool as any).query(
        `INSERT INTO roadmap_catalog_content (id, node_id, type, title, url, "order")
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           type = EXCLUDED.type,
           title = EXCLUDED.title,
           url = EXCLUDED.url,
           "order" = EXCLUDED."order"`,
        [id, catalogNodeId, type, title, url, i]
      );
      resourcesInserted++;
    }
  }

  console.log(`[${slug}] Done — ${resourcesInserted} resources inserted (${nodesMissed} nodes not in DB)`);
}

async function main() {
  const args = process.argv.slice(2);
  const slugs =
    args.length > 0
      ? args
      : ["python", "ai-engineer", "prompt-engineering", "machine-learning"];

  console.log("Data sourced from roadmap.sh (CC BY 4.0)");
  console.log(`Importing content for: ${slugs.join(", ")}\n`);

  for (const slug of slugs) {
    try {
      await importRoadmapContent(slug);
    } catch (err) {
      console.error(`[${slug}] Failed:`, err);
    }
  }

  await pool.end();
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
