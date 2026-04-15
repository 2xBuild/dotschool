import "server-only";

import { eq, desc, count, sql } from "drizzle-orm";

import { db } from "@/server/db";
import {
  batches,
  batchEnrollments,
  users,
  userProfiles,
  userTags,
  volunteerApplications,
} from "@/server/db/schema";

export async function getDashboardStats() {
  const [batchCount, userCount, pendingApps, pendingEnrollments] =
    await Promise.all([
      db.select({ count: count() }).from(batches),
      db.select({ count: count() }).from(users),
      db
        .select({ count: count() })
        .from(volunteerApplications)
        .where(eq(volunteerApplications.status, "pending")),
      db
        .select({ count: count() })
        .from(batchEnrollments)
        .where(eq(batchEnrollments.status, "applied")),
    ]);

  return {
    totalBatches: batchCount[0]?.count ?? 0,
    totalUsers: userCount[0]?.count ?? 0,
    pendingApplications: pendingApps[0]?.count ?? 0,
    pendingEnrollments: pendingEnrollments[0]?.count ?? 0,
  };
}

export async function getRecentBatches() {
  return db
    .select({
      id: batches.id,
      title: batches.title,
      status: batches.status,
      batchNumber: batches.batchNumber,
      totalSeats: batches.totalSeats,
      startsAt: batches.startsAt,
      enrollmentCount: count(batchEnrollments.userId),
    })
    .from(batches)
    .leftJoin(batchEnrollments, eq(batches.id, batchEnrollments.batchId))
    .groupBy(batches.id)
    .orderBy(desc(batches.createdAt))
    .limit(5);
}

export async function getPendingApplications() {
  return db
    .select({
      id: volunteerApplications.id,
      name: volunteerApplications.name,
      email: volunteerApplications.email,
      role: volunteerApplications.role,
      createdAt: volunteerApplications.createdAt,
    })
    .from(volunteerApplications)
    .where(eq(volunteerApplications.status, "pending"))
    .orderBy(desc(volunteerApplications.createdAt))
    .limit(5);
}

export async function getRecentSignups() {
  return db
    .select({
      userId: userProfiles.userId,
      name: userProfiles.name,
      email: userProfiles.email,
      username: userProfiles.username,
      image: userProfiles.image,
      createdAt: userProfiles.createdAt,
    })
    .from(userProfiles)
    .orderBy(desc(userProfiles.createdAt))
    .limit(8);
}
