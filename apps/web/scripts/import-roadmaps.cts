// Data sourced from roadmap.sh (CC BY 4.0) — https://roadmap.sh
// Standalone script — uses pg directly to avoid workspace ESM resolution issues

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Pool } = require("/Users/abubaker/projects/graduate-dev/packages/db/node_modules/pg");

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

function normalizeDatabaseUrl(url: string): string {
  const u = new URL(url);
  const sslMode = u.searchParams.get("sslmode");
  if (sslMode && ["prefer", "require", "verify-ca"].includes(sslMode) && u.searchParams.get("uselibpqcompat") !== "true") {
    u.searchParams.set("uselibpqcompat", "true");
  }
  return u.toString();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pool = new Pool({ connectionString: normalizeDatabaseUrl(DATABASE_URL), max: 3 }) as any;

console.log("Data sourced from roadmap.sh (CC BY 4.0)");

const ROADMAPS = [
  "ai-agents", "ai-data-scientist", "ai-engineer", "ai-product-builder", "ai-red-teaming",
  "android", "angular", "api-design", "aspnet-core", "aws",
  "backend", "backend-beginner", "bi-analyst", "blockchain", "claude-code",
  "cloudflare", "code-review", "computer-science", "cpp", "css",
  "cyber-security", "data-analyst", "data-engineer", "datastructures-and-algorithms", "design-system",
  "devops", "devops-beginner", "devrel", "devsecops", "django",
  "docker", "elasticsearch", "engineering-manager", "flutter", "frontend",
  "frontend-beginner", "full-stack", "game-developer", "git-github", "git-github-beginner",
  "golang", "graphql", "html", "ios", "java",
  "javascript", "kotlin", "kubernetes", "laravel", "leetcode",
  "linux", "machine-learning", "mlops", "mongodb", "nextjs",
  "nodejs", "openclaw", "php", "postgresql-dba", "product-manager",
  "prompt-engineering", "python", "qa", "react", "react-native",
  "redis", "ruby", "ruby-on-rails", "rust", "scala",
  "server-side-game-developer", "shell-bash", "software-architect", "software-design-architecture", "spring-boot",
  "sql", "swift-ui", "system-design", "technical-writer", "terraform",
  "typescript", "ux-design", "vibe-coding", "vue", "wordpress",
];
const KEEP_TYPES = new Set(["topic", "subtopic"]);

interface RawNode {
  id: string;
  type?: string;
  data?: { label?: string; description?: string };
  position?: { x?: number; y?: number };
}
interface RawEdge { id: string; source: string; target: string }
interface RoadmapJson { nodes?: RawNode[]; edges?: RawEdge[] }

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

async function fetchRoadmapJson(slug: string): Promise<{ json: RoadmapJson; url: string }> {
  const urlPatterns = [
    `https://raw.githubusercontent.com/nilbuild/developer-roadmap/master/src/data/roadmaps/${slug}/${slug}.json`,
    `https://raw.githubusercontent.com/nilbuild/developer-roadmap/master/public/roadmaps/${slug}.json`,
  ];
  for (const url of urlPatterns) {
    const res = await fetch(url);
    if (res.ok) {
      const json = (await res.json()) as RoadmapJson;
      return { json, url };
    }
  }
  throw new Error(`Could not fetch roadmap JSON for slug: ${slug}`);
}

function toTitleCase(slug: string): string {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

async function importRoadmap(slug: string): Promise<void> {
  console.log(`\n[${slug}] Fetching...`);
  const { json, url } = await fetchRoadmapJson(slug);
  console.log(`[${slug}] Source: ${url}`);

  const rawNodes: RawNode[] = json.nodes ?? [];
  const rawEdges: RawEdge[] = json.edges ?? [];

  const keptNodes = rawNodes.filter((n) => KEEP_TYPES.has((n.type ?? "").toLowerCase()));
  if (keptNodes.length === 0) {
    console.warn(`[${slug}] No topic/subtopic nodes found — skipping`);
    return;
  }

  const keptNodeIds = new Set(keptNodes.map((n) => n.id));
  const edgeMap = new Map<string, string>();
  for (const edge of rawEdges) {
    if (keptNodeIds.has(edge.source) && keptNodeIds.has(edge.target)) {
      edgeMap.set(edge.target, edge.source);
    }
  }

  const sorted = [...keptNodes].sort((a, b) => (a.position?.y ?? 0) - (b.position?.y ?? 0));

  const title = toTitleCase(slug);
  const rawJson = JSON.stringify(json);

  const client = await pool.connect();
  try {
    // Upsert roadmap_catalog
    await client.query(
      `INSERT INTO roadmap_catalog (id, slug, title, description, node_count, raw_data, imported_at, updated_at)
       VALUES ($1, $2, $3, NULL, $4, $5::jsonb, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         node_count = EXCLUDED.node_count,
         raw_data = EXCLUDED.raw_data,
         updated_at = NOW()`,
      [slug, slug, title, sorted.length, rawJson]
    );

    // Upsert nodes in batches of 50
    const BATCH = 50;
    for (let i = 0; i < sorted.length; i += BATCH) {
      const batch = sorted.slice(i, i + BATCH);
      for (let j = 0; j < batch.length; j++) {
        const node = batch[j];
        const rawLabel = node.data?.label ?? node.id;
        const label = stripHtml(rawLabel) || node.id;
        const parentNodeId = edgeMap.get(node.id) ? `${slug}-${edgeMap.get(node.id)}` : null;
        const nodeType = (node.type ?? "topic").toLowerCase();

        await client.query(
          `INSERT INTO roadmap_catalog_node (id, roadmap_id, node_id, type, label, description, parent_node_id, "order")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET
             type = EXCLUDED.type,
             label = EXCLUDED.label,
             description = EXCLUDED.description,
             parent_node_id = EXCLUDED.parent_node_id,
             "order" = EXCLUDED."order"`,
          [`${slug}-${node.id}`, slug, node.id, nodeType, label, node.data?.description ?? null, parentNodeId, i + j]
        );
      }
    }

    console.log(`[${slug}] Imported ${sorted.length} nodes`);
  } finally {
    client.release();
  }
}

async function main() {
  console.log("Starting roadmap import...\n");
  for (const slug of ROADMAPS) {
    try {
      await importRoadmap(slug);
    } catch (err) {
      console.error(`[${slug}] Failed:`, err);
    }
  }
  console.log("\nImport complete.");
  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
