import "server-only";

import { and, avg, count, eq, inArray } from "drizzle-orm";

import type { BatchVolunteer } from "@/lib/batch-volunteers";
import { db } from "@/server/db";
import { batchVolunteers, peerVotes, userProfiles } from "@/server/db/schema";

export async function getBatchVolunteers(batchId: string): Promise<BatchVolunteer[]> {
  const rows = await db
    .select({
      userId: batchVolunteers.userId,
      name: userProfiles.name,
      username: userProfiles.username,
      image: userProfiles.image,
      role: batchVolunteers.role,
    })
    .from(batchVolunteers)
    .innerJoin(userProfiles, eq(batchVolunteers.userId, userProfiles.userId))
    .where(eq(batchVolunteers.batchId, batchId));

  return rows.map((r) => ({
    userId: r.userId,
    name: r.name ?? r.username,
    username: r.username,
    image: r.image,
    role: r.role,
  }));
}

export type RatedVolunteer = BatchVolunteer & {
  avgRating: number;
  ratingCount: number;
  userRating: number | null;
};

export async function attachVolunteerRatings(
  batchId: string,
  volunteers: BatchVolunteer[],
  currentUserId: string | null,
): Promise<RatedVolunteer[]> {
  if (volunteers.length === 0) return [];
  const ids = volunteers.map((v) => v.userId);

  const aggs = await db
    .select({
      targetUserId: peerVotes.targetUserId,
      avg: avg(peerVotes.rating),
      n: count(peerVotes.voterId),
    })
    .from(peerVotes)
    .where(
      and(
        eq(peerVotes.batchId, batchId),
        inArray(peerVotes.targetUserId, ids),
      ),
    )
    .groupBy(peerVotes.targetUserId);

  const avgMap = new Map<string, number>();
  const countMap = new Map<string, number>();
  for (const row of aggs) {
    avgMap.set(row.targetUserId, Number(row.avg ?? 0));
    countMap.set(row.targetUserId, Number(row.n));
  }

  const userMap = new Map<string, number>();
  if (currentUserId) {
    const my = await db
      .select({ targetUserId: peerVotes.targetUserId, rating: peerVotes.rating })
      .from(peerVotes)
      .where(
        and(
          eq(peerVotes.voterId, currentUserId),
          eq(peerVotes.batchId, batchId),
          inArray(peerVotes.targetUserId, ids),
        ),
      );
    for (const row of my) userMap.set(row.targetUserId, row.rating);
  }

  return volunteers.map((v) => ({
    ...v,
    avgRating: avgMap.get(v.userId) ?? 0,
    ratingCount: countMap.get(v.userId) ?? 0,
    userRating: userMap.get(v.userId) ?? null,
  }));
}
