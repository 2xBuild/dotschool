"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import { batchInterestVotes, batches, users } from "@/server/db/schema";

/**
 * Cast, switch, or retract a vote on a possible batch.
 *
 * direction = "up" | "down"
 *
 * - If the user has no vote → insert with that direction.
 * - If the user already voted in the same direction → retract (delete).
 * - If the user already voted in the opposite direction → switch (update).
 */
export async function castBatchInterestVote(
  batchId: string,
  direction: "up" | "down",
) {
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
    .select({ id: batches.id, status: batches.status })
    .from(batches)
    .where(eq(batches.id, batchId))
    .limit(1);
  if (!batch) {
    return { ok: false as const, error: "Batch not found" };
  }
  if (batch.status !== "pending") {
    return { ok: false as const, error: "Interest votes are only for possible batches" };
  }

  const existing = await db.query.batchInterestVotes.findFirst({
    where: and(
      eq(batchInterestVotes.userId, userRecord.id),
      eq(batchInterestVotes.batchId, batchId),
    ),
    columns: { userId: true, vote: true },
  });

  if (existing) {
    if (existing.vote === direction) {
      await db
        .delete(batchInterestVotes)
        .where(
          and(
            eq(batchInterestVotes.userId, userRecord.id),
            eq(batchInterestVotes.batchId, batchId),
          ),
        );
      revalidatePath("/");
      return { ok: true as const, vote: null };
    }

    await db
      .update(batchInterestVotes)
      .set({ vote: direction, votedAt: new Date() })
      .where(
        and(
          eq(batchInterestVotes.userId, userRecord.id),
          eq(batchInterestVotes.batchId, batchId),
        ),
      );
    revalidatePath("/");
    return { ok: true as const, vote: direction };
  }

  await db
    .insert(batchInterestVotes)
    .values({
      userId: userRecord.id,
      batchId,
      vote: direction,
    });
  revalidatePath("/");
  return { ok: true as const, vote: direction };
}
