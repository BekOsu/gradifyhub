import { and, eq, inArray } from "drizzle-orm";
import { db } from "../client";
import { roadmapCatalog, roadmapCatalogNode, userRoadmapNodeProgress } from "../schema";

export async function getRoadmapCatalogList(): Promise<
  Array<{
    id: string;
    slug: string;
    title: string;
    description: string | null;
    nodeCount: number;
    importedAt: Date;
  }>
> {
  const rows = await db.query.roadmapCatalog.findMany({
    orderBy: (r, { asc }) => [asc(r.title)],
    columns: {
      id: true,
      slug: true,
      title: true,
      description: true,
      nodeCount: true,
      importedAt: true,
    },
  });
  return rows;
}

export async function getRoadmapCatalogBySlug(slug: string): Promise<{
  id: string;
  slug: string;
  title: string;
  description: string | null;
  nodeCount: number;
  nodes: Array<{
    id: string;
    nodeId: string;
    type: string;
    label: string;
    description: string | null;
    parentNodeId: string | null;
    order: number;
    lessonId: string | null;
    content: Array<{
      id: string;
      type: string;
      title: string;
      url: string;
      order: number;
    }>;
  }>;
} | null> {
  const row = await db.query.roadmapCatalog.findFirst({
    where: eq(roadmapCatalog.slug, slug),
    columns: {
      id: true,
      slug: true,
      title: true,
      description: true,
      nodeCount: true,
    },
    with: {
      nodes: {
        orderBy: (n, { asc }) => [asc(n.order)],
        columns: {
          id: true,
          nodeId: true,
          type: true,
          label: true,
          description: true,
          parentNodeId: true,
          order: true,
          lessonId: true,
        },
        with: {
          content: {
            orderBy: (c, { asc }) => [asc(c.order)],
            columns: {
              id: true,
              type: true,
              title: true,
              url: true,
              order: true,
            },
          },
        },
      },
    },
  });

  return row ?? null;
}

export async function getUserNodeProgress(
  userId: string,
  roadmapId: string,
): Promise<Map<string, "done" | "in-progress" | "skip">> {
  const nodes = await db.query.roadmapCatalogNode.findMany({
    where: eq(roadmapCatalogNode.roadmapId, roadmapId),
    columns: { id: true },
  });

  if (nodes.length === 0) return new Map();

  const nodeIds = nodes.map((n) => n.id);

  const rows = await db
    .select({ catalogNodeId: userRoadmapNodeProgress.catalogNodeId, status: userRoadmapNodeProgress.status })
    .from(userRoadmapNodeProgress)
    .where(
      and(
        eq(userRoadmapNodeProgress.userId, userId),
        inArray(userRoadmapNodeProgress.catalogNodeId, nodeIds),
      ),
    );

  const map = new Map<string, "done" | "in-progress" | "skip">();
  for (const row of rows) {
    map.set(row.catalogNodeId, row.status as "done" | "in-progress" | "skip");
  }

  return map;
}
