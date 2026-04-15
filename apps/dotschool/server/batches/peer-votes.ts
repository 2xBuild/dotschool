"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import { batchEnrollments, peerVotes, users } from "@/server/db/schema";

/**
 * Cast or update a peer rating (1-5 stars) in a batch.
 * Pass rating = 0 or null to retract.
 */
export async function castPeerRating(
  batchId: string,
  targetUserId: string,
  rating: number | null,
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

  if (userRecord.id === targetUserId) {
    return { ok: false as const, error: "You cannot rate yourself" };
  }

  const [voterEnrollment] = await db
    .select({ status: batchEnrollments.status })
    .from(batchEnrollments)
    .where(
      and(
        eq(batchEnrollments.userId, userRecord.id),
        eq(batchEnrollments.batchId, batchId),
        eq(batchEnrollments.status, "approved"),
      ),
    )
    .limit(1);
  if (!voterEnrollment) {
    return { ok: false as const, error: "You must be an approved batch member to rate" };
  }

  const clear = rating === null || rating === 0;
  if (!clear && (rating! < 1 || rating! > 5 || !Number.isInteger(rating))) {
    return { ok: false as const, error: "Rating must be an integer between 1 and 5" };
  }

  const existing = await db.query.peerVotes.findFirst({
    where: and(
      eq(peerVotes.voterId, userRecord.id),
      eq(peerVotes.targetUserId, targetUserId),
      eq(peerVotes.batchId, batchId),
    ),
    columns: { voterId: true, rating: true },
  });

  if (clear) {
    if (existing) {
      await db
        .delete(peerVotes)
        .where(
          and(
            eq(peerVotes.voterId, userRecord.id),
            eq(peerVotes.targetUserId, targetUserId),
            eq(peerVotes.batchId, batchId),
          ),
        );
    }
    revalidatePath("/");
    return { ok: true as const, rating: null };
  }

  if (existing) {
    await db
      .update(peerVotes)
      .set({ rating: rating!, votedAt: new Date() })
      .where(
        and(
          eq(peerVotes.voterId, userRecord.id),
          eq(peerVotes.targetUserId, targetUserId),
          eq(peerVotes.batchId, batchId),
        ),
      );
    revalidatePath("/");
    return { ok: true as const, rating: rating! };
  }

  await db.insert(peerVotes).values({
    voterId: userRecord.id,
    targetUserId,
    batchId,
    rating: rating!,
  });
  revalidatePath("/");
  return { ok: true as const, rating: rating! };
}
