"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getAdminUser, isMod } from "@/server/auth/access";
import { db } from "@/server/db";
import { batchModules, moduleResources } from "@/server/db/schema";

export async function createModule(batchId: string, formData: FormData) {
  const user = await getAdminUser();
  if (!user || !isMod(user)) return { error: "Unauthorized" };

  const title = (formData.get("title") as string)?.trim();
  const weekNumber = Number(formData.get("weekNumber")) || 1;
  const moduleNumber = Number(formData.get("moduleNumber")) || 1;
  const description =
    (formData.get("description") as string)?.trim() || null;
  const topicsRaw = (formData.get("topics") as string)?.trim() || "";
  const topics = topicsRaw
    ? JSON.stringify(
        topicsRaw.split(",").map((t) => t.trim()).filter(Boolean),
      )
    : null;

  if (!title) return { error: "Title is required" };

  const sortOrder = weekNumber * 10 + moduleNumber;

  const [row] = await db
    .insert(batchModules)
    .values({
      batchId,
      weekNumber,
      moduleNumber,
      title,
      description,
      topics,
      sortOrder,
    })
    .returning({ id: batchModules.id });

  revalidatePath(`/batches/${batchId}`);
  return { ok: true, id: row?.id };
}

export async function updateModule(moduleId: string, formData: FormData) {
  const user = await getAdminUser();
  if (!user || !isMod(user)) return { error: "Unauthorized" };

  const title = (formData.get("title") as string)?.trim();
  const weekNumber = Number(formData.get("weekNumber")) || 1;
  const moduleNumber = Number(formData.get("moduleNumber")) || 1;
  const description =
    (formData.get("description") as string)?.trim() || null;
  const topicsRaw = (formData.get("topics") as string)?.trim() || "";
  const topics = topicsRaw
    ? JSON.stringify(
        topicsRaw.split(",").map((t) => t.trim()).filter(Boolean),
      )
    : null;

  if (!title) return { error: "Title is required" };

  const sortOrder = weekNumber * 10 + moduleNumber;

  await db
    .update(batchModules)
    .set({
      title,
      weekNumber,
      moduleNumber,
      description,
      topics,
      sortOrder,
      updatedAt: new Date(),
    })
    .where(eq(batchModules.id, moduleId));

  const mod = await db.query.batchModules.findFirst({
    where: eq(batchModules.id, moduleId),
    columns: { batchId: true },
  });

  if (mod) revalidatePath(`/batches/${mod.batchId}`);
  return { ok: true };
}

export async function deleteModule(moduleId: string) {
  const user = await getAdminUser();
  if (!user || !isMod(user)) return { error: "Unauthorized" };

  const mod = await db.query.batchModules.findFirst({
    where: eq(batchModules.id, moduleId),
    columns: { batchId: true },
  });

  await db.delete(batchModules).where(eq(batchModules.id, moduleId));

  if (mod) revalidatePath(`/batches/${mod.batchId}`);
  return { ok: true };
}

export async function createResource(moduleId: string, formData: FormData) {
  const user = await getAdminUser();
  if (!user || !isMod(user)) return { error: "Unauthorized" };

  const title = (formData.get("title") as string)?.trim();
  const type = (formData.get("type") as string) || "text";
  const url = (formData.get("url") as string)?.trim() || null;
  const content = (formData.get("content") as string)?.trim() || null;
  const thumbnailUrl =
    (formData.get("thumbnailUrl") as string)?.trim() || null;
  const duration = (formData.get("duration") as string)?.trim() || null;
  const sortOrder = Number(formData.get("sortOrder")) || 0;

  if (!title) return { error: "Title is required" };

  const [row] = await db
    .insert(moduleResources)
    .values({
      moduleId,
      type,
      title,
      url,
      content,
      thumbnailUrl,
      duration,
      sortOrder,
    })
    .returning({ id: moduleResources.id });

  const mod = await db.query.batchModules.findFirst({
    where: eq(batchModules.id, moduleId),
    columns: { batchId: true },
  });
  if (mod) revalidatePath(`/batches/${mod.batchId}`);

  return { ok: true, id: row?.id };
}

export async function updateResource(resourceId: string, formData: FormData) {
  const user = await getAdminUser();
  if (!user || !isMod(user)) return { error: "Unauthorized" };

  const title = (formData.get("title") as string)?.trim();
  const type = (formData.get("type") as string) || "text";
  const url = (formData.get("url") as string)?.trim() || null;
  const content = (formData.get("content") as string)?.trim() || null;
  const thumbnailUrl =
    (formData.get("thumbnailUrl") as string)?.trim() || null;
  const duration = (formData.get("duration") as string)?.trim() || null;
  const sortOrder = Number(formData.get("sortOrder")) || 0;

  if (!title) return { error: "Title is required" };

  await db
    .update(moduleResources)
    .set({ type, title, url, content, thumbnailUrl, duration, sortOrder })
    .where(eq(moduleResources.id, resourceId));

  const resource = await db.query.moduleResources.findFirst({
    where: eq(moduleResources.id, resourceId),
    columns: { moduleId: true },
  });
  if (resource) {
    const mod = await db.query.batchModules.findFirst({
      where: eq(batchModules.id, resource.moduleId),
      columns: { batchId: true },
    });
    if (mod) revalidatePath(`/batches/${mod.batchId}`);
  }

  return { ok: true };
}

export async function deleteResource(resourceId: string) {
  const user = await getAdminUser();
  if (!user || !isMod(user)) return { error: "Unauthorized" };

  const resource = await db.query.moduleResources.findFirst({
    where: eq(moduleResources.id, resourceId),
    columns: { moduleId: true },
  });

  await db
    .delete(moduleResources)
    .where(eq(moduleResources.id, resourceId));

  if (resource) {
    const mod = await db.query.batchModules.findFirst({
      where: eq(batchModules.id, resource.moduleId),
      columns: { batchId: true },
    });
    if (mod) revalidatePath(`/batches/${mod.batchId}`);
  }

  return { ok: true };
}
