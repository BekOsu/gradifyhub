// Data sourced from roadmap.sh (CC BY 4.0) — https://roadmap.sh
import { db } from "@repo/db/client";
import { sql } from "@repo/db/drizzle";
import { roadmapCatalog, roadmapCatalogNode } from "@repo/db/schema";

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
  data?: {
    label?: string;
    description?: string;
  };
  position?: {
    x?: number;
    y?: number;
  };
}

interface RawEdge {
  id: string;
  source: string;
  target: string;
}

interface RoadmapJson {
  nodes?: RawNode[];
  edges?: RawEdge[];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

async function fetchRoadmapJson(slug: string): Promise<{ json: RoadmapJson; url: string }> {
  const urlPatterns = [
    `https://raw.githubusercontent.com/kamranahmedse/developer-roadmap/master/src/data/roadmaps/${slug}/${slug}.json`,
    `https://raw.githubusercontent.com/kamranahmedse/developer-roadmap/master/public/roadmaps/${slug}.json`,
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
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function importRoadmap(slug: string): Promise<void> {
  console.log(`\n[${slug}] Fetching...`);

  const { json, url } = await fetchRoadmapJson(slug);
  console.log(`[${slug}] Source: ${url}`);

  const rawNodes: RawNode[] = json.nodes ?? [];
  const rawEdges: RawEdge[] = json.edges ?? [];

  // Filter to topic/subtopic only
  const keptNodes = rawNodes.filter((n) => {
    const t = (n.type ?? "").toLowerCase();
    return KEEP_TYPES.has(t);
  });

  if (keptNodes.length === 0) {
    console.warn(`[${slug}] No topic/subtopic nodes found — skipping`);
    return;
  }

  // Build set of kept node IDs for parent resolution
  const keptNodeIds = new Set(keptNodes.map((n) => n.id));

  // Build edge map: targetNodeId → sourceNodeId (only for edges where both ends are kept nodes)
  const edgeMap = new Map<string, string>();
  for (const edge of rawEdges) {
    if (keptNodeIds.has(edge.source) && keptNodeIds.has(edge.target)) {
      // target is child, source is parent
      edgeMap.set(edge.target, edge.source);
    }
  }

  // Sort by position.y ascending → assign order
  const sorted = [...keptNodes].sort((a, b) => {
    const ay = a.position?.y ?? 0;
    const by = b.position?.y ?? 0;
    return ay - by;
  });

  const title = toTitleCase(slug);
  const roadmapId = slug; // slug is the PK

  // Upsert roadmap_catalog row
  await db
    .insert(roadmapCatalog)
    .values({
      id: roadmapId,
      slug,
      title,
      description: null,
      nodeCount: sorted.length,
      rawData: json as Record<string, unknown>,
      importedAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: roadmapCatalog.id,
      set: {
        title,
        nodeCount: sorted.length,
        rawData: json as Record<string, unknown>,
        updatedAt: new Date(),
      },
    });

  // Upsert roadmap_catalog_node rows in batches
  const BATCH = 50;
  for (let i = 0; i < sorted.length; i += BATCH) {
    const batch = sorted.slice(i, i + BATCH);

    const values = batch.map((node, idx) => {
      const rawLabel = node.data?.label ?? node.id;
      const label = stripHtml(rawLabel);
      const parentNodeId = edgeMap.get(node.id) ?? null;

      return {
        id: `${slug}-${node.id}`,
        roadmapId,
        nodeId: node.id,
        type: (node.type ?? "topic").toLowerCase(),
        label: label || node.id,
        description: node.data?.description ?? null,
        parentNodeId: parentNodeId ? `${slug}-${parentNodeId}` : null,
        order: i + idx,
      };
    });

    await db
      .insert(roadmapCatalogNode)
      .values(values)
      .onConflictDoUpdate({
        target: roadmapCatalogNode.id,
        set: {
          type: sql`excluded.type`,
          label: sql`excluded.label`,
          description: sql`excluded.description`,
          parentNodeId: sql`excluded.parent_node_id`,
          order: sql`excluded."order"`,
        },
      });
  }

  console.log(`[${slug}] Imported ${sorted.length} nodes`);
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
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
