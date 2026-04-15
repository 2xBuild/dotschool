import "server-only";

import { and, avg, count, eq, inArray } from "drizzle-orm";

import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import {
  batchEnrollments,
  peerVotes,
  userProfiles,
  users,
} from "@/server/db/schema";

export type BatchPeer = {
  userId: string;
  name: string | null;
  username: string;
  image: string | null;
  avgRating: number;
  ratingCount: number;
  userRating: number | null;
};

export async function getBatchPeers(batchId: string): Promise<{
  peers: BatchPeer[];
  currentUserId: string | null;
}> {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();

  let currentUserId: string | null = null;
  if (email) {
    const userRecord = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: { id: true },
    });
    currentUserId = userRecord?.id ?? null;
  }

  const enrolledRows = await db
    .select({ userId: batchEnrollments.userId })
    .from(batchEnrollments)
    .where(
      and(
        eq(batchEnrollments.batchId, batchId),
        eq(batchEnrollments.status, "approved"),
      ),
    );

  const enrolledIds = enrolledRows.map((r) => r.userId);
  if (enrolledIds.length === 0) {
    return { peers: [], currentUserId };
  }

  const profiles = await db
    .select({
      userId: userProfiles.userId,
      name: userProfiles.name,
      username: userProfiles.username,
      image: userProfiles.image,
    })
    .from(userProfiles)
    .where(inArray(userProfiles.userId, enrolledIds));

  const profileMap = new Map(profiles.map((p) => [p.userId, p]));

  const ratingAgg = await db
    .select({
      targetUserId: peerVotes.targetUserId,
      avg: avg(peerVotes.rating),
      n: count(peerVotes.voterId),
    })
    .from(peerVotes)
    .where(
      and(
        eq(peerVotes.batchId, batchId),
        inArray(peerVotes.targetUserId, enrolledIds),
      ),
    )
    .groupBy(peerVotes.targetUserId);

  const avgMap = new Map<string, number>();
  const countMap = new Map<string, number>();
  for (const row of ratingAgg) {
    avgMap.set(row.targetUserId, Number(row.avg ?? 0));
    countMap.set(row.targetUserId, Number(row.n));
  }

  const userRatingMap = new Map<string, number>();
  if (currentUserId) {
    const userRatings = await db
      .select({ targetUserId: peerVotes.targetUserId, rating: peerVotes.rating })
      .from(peerVotes)
      .where(
        and(
          eq(peerVotes.voterId, currentUserId),
          eq(peerVotes.batchId, batchId),
        ),
      );
    for (const row of userRatings) {
      userRatingMap.set(row.targetUserId, row.rating);
    }
  }

  const peers: BatchPeer[] = enrolledIds
    .filter((id) => id !== currentUserId)
    .map((userId) => {
      const profile = profileMap.get(userId);
      return {
        userId,
        name: profile?.name ?? null,
        username: profile?.username ?? userId.slice(0, 8),
        image: profile?.image ?? null,
        avgRating: avgMap.get(userId) ?? 0,
        ratingCount: countMap.get(userId) ?? 0,
        userRating: userRatingMap.get(userId) ?? null,
      };
    });

  return { peers, currentUserId };
}
