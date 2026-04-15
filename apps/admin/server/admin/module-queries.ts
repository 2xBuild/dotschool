import "server-only";

import { asc, eq } from "drizzle-orm";

import { db } from "@/server/db";
import { batchModules, moduleResources } from "@/server/db/schema";

export type AdminModuleResource = {
  id: string;
  type: string;
  title: string;
  url: string | null;
  content: string | null;
  thumbnailUrl: string | null;
  duration: string | null;
  sortOrder: number;
};

export type AdminBatchModule = {
  id: string;
  batchId: string;
  weekNumber: number;
  moduleNumber: number;
  title: string;
  description: string | null;
  topics: string[];
  sortOrder: number;
  resources: AdminModuleResource[];
};

function parseTopics(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((t): t is string => typeof t === "string")
      : [];
  } catch {
    return [];
  }
}

export async function getModulesForBatch(
  batchId: string,
): Promise<AdminBatchModule[]> {
  const modules = await db.query.batchModules.findMany({
    where: eq(batchModules.batchId, batchId),
    orderBy: [asc(batchModules.weekNumber), asc(batchModules.moduleNumber)],
    with: {
      resources: {
        orderBy: [asc(moduleResources.sortOrder)],
      },
    },
  });

  return modules.map((m) => ({
    id: m.id,
    batchId: m.batchId,
    weekNumber: m.weekNumber,
    moduleNumber: m.moduleNumber,
    title: m.title,
    description: m.description,
    topics: parseTopics(m.topics),
    sortOrder: m.sortOrder,
    resources: m.resources.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      url: r.url,
      content: r.content,
      thumbnailUrl: r.thumbnailUrl,
      duration: r.duration,
      sortOrder: r.sortOrder,
    })),
  }));
}
