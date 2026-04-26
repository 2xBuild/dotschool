"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import {
  batchEnrollments,
  batches,
  userProfiles,
  users,
} from "@/server/db/schema";

export async function enrollInBatch(batchId: string) {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) {
    return { ok: false as const, error: "Not signed in" };
  }

  const userRecord = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true },
  });
  if (!userRecord) {
    return { ok: false as const, error: "User not found" };
  }

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userRecord.id),
    columns: { socials: true },
  });
  const discordUsername = profile?.socials?.discord?.username?.trim();
  if (!discordUsername) {
    return {
      ok: false as const,
      error: "Link your Discord account in your profile before joining a batch",
    };
  }

  const [batch] = await db
    .select({
      id: batches.id,
      startsAt: batches.startsAt,
      status: batches.status,
    })
    .from(batches)
    .where(eq(batches.id, batchId))
    .limit(1);
  if (!batch) {
    return { ok: false as const, error: "Batch not found" };
  }
  if (batch.status !== "confirmed") {
    return {
      ok: false as const,
      error: "This cohort is not open for enrollment yet",
    };
  }

  const now = new Date();
  if (batch.startsAt && batch.startsAt <= now) {
    return { ok: false as const, error: "This batch has already started" };
  }

  await db
    .insert(batchEnrollments)
    .values({ userId: userRecord.id, batchId })
    .onConflictDoNothing();

  revalidatePath("/dashboard");
  revalidatePath(`/batches/${batchId}`);
  return { ok: true as const };
}

export async function withdrawFromBatch(batchId: string) {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) {
    return { ok: false as const, error: "Not signed in" };
  }

  const userRecord = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true },
  });
  if (!userRecord) {
    return { ok: false as const, error: "User not found" };
  }

  const [batch] = await db
    .select({
      id: batches.id,
      startsAt: batches.startsAt,
      status: batches.status,
    })
    .from(batches)
    .where(eq(batches.id, batchId))
    .limit(1);
  if (!batch) {
    return { ok: false as const, error: "Batch not found" };
  }
  if (batch.status !== "confirmed") {
    return {
      ok: false as const,
      error: "Only confirmed batches can be updated",
    };
  }

  const now = new Date();
  if (batch.startsAt && batch.startsAt <= now) {
    return { ok: false as const, error: "This batch has already started" };
  }

  const [enrollment] = await db
    .select({ batchId: batchEnrollments.batchId })
    .from(batchEnrollments)
    .where(
      and(
        eq(batchEnrollments.userId, userRecord.id),
        eq(batchEnrollments.batchId, batchId),
      ),
    )
    .limit(1);

  if (!enrollment) {
    return { ok: false as const, error: "You are not enrolled in this batch" };
  }

  await db
    .delete(batchEnrollments)
    .where(
      and(
        eq(batchEnrollments.userId, userRecord.id),
        eq(batchEnrollments.batchId, batchId),
      ),
    );

  revalidatePath("/dashboard");
  revalidatePath(`/batches/${batchId}`);
  return { ok: true as const };
}
