import "server-only";

import { eq, and, desc, count, max } from "drizzle-orm";

import { db } from "@/server/db";
import {
  batches,
  batchEnrollments,
  batchInterestVotes,
  batchVolunteers,
  entranceTestSessions,
  entranceTestStats,
  userProfiles,
  volunteerApplications,
} from "@/server/db/schema";

export async function getAllBatches() {
  const rows = await db
    .select({
      id: batches.id,
      title: batches.title,
      status: batches.status,
      batchNumber: batches.batchNumber,
      totalSeats: batches.totalSeats,
      startsAt: batches.startsAt,
      endsAt: batches.endsAt,
      questionSetId: batches.questionSetId,
      createdAt: batches.createdAt,
      enrollmentCount: count(batchEnrollments.userId),
    })
    .from(batches)
    .leftJoin(batchEnrollments, eq(batches.id, batchEnrollments.batchId))
    .groupBy(batches.id)
    .orderBy(desc(batches.createdAt));

  return rows;
}

export async function getNextBatchNumber() {
  const [row] = await db
    .select({ maxNum: max(batches.batchNumber) })
    .from(batches);
  return (row?.maxNum ?? 0) + 1;
}

export async function getBatchById(batchId: string) {
  const batch = await db.query.batches.findFirst({
    where: eq(batches.id, batchId),
  });
  return batch ?? null;
}

export async function getBatchEnrollments(batchId: string) {
  const rows = await db
    .select({
      userId: batchEnrollments.userId,
      status: batchEnrollments.status,
      enrolledAt: batchEnrollments.enrolledAt,
      name: userProfiles.name,
      email: userProfiles.email,
      username: userProfiles.username,
      image: userProfiles.image,
    })
    .from(batchEnrollments)
    .leftJoin(userProfiles, eq(batchEnrollments.userId, userProfiles.userId))
    .where(eq(batchEnrollments.batchId, batchId))
    .orderBy(desc(batchEnrollments.enrolledAt));

  return rows;
}

export async function getAssignableVolunteers() {
  const rows = await db
    .select({
      userId: volunteerApplications.userId,
      name: volunteerApplications.name,
      email: volunteerApplications.email,
      role: volunteerApplications.role,
      username: userProfiles.username,
    })
    .from(volunteerApplications)
    .leftJoin(
      userProfiles,
      eq(volunteerApplications.userId, userProfiles.userId),
    )
    .where(eq(volunteerApplications.status, "accepted"))
    .orderBy(volunteerApplications.name);

  return rows;
}

export async function getBatchVolunteersList(batchId: string) {
  const rows = await db
    .select({
      userId: batchVolunteers.userId,
      role: batchVolunteers.role,
      assignedAt: batchVolunteers.assignedAt,
      name: userProfiles.name,
      email: userProfiles.email,
      username: userProfiles.username,
    })
    .from(batchVolunteers)
    .leftJoin(userProfiles, eq(batchVolunteers.userId, userProfiles.userId))
    .where(eq(batchVolunteers.batchId, batchId))
    .orderBy(batchVolunteers.role);

  return rows;
}

export async function getBatchTestSubmissions(batchId: string) {
  const rows = await db
    .select({
      sessionId: entranceTestSessions.id,
      userId: entranceTestSessions.userId,
      status: entranceTestSessions.status,
      questionSetId: entranceTestSessions.questionSetId,
      testType: entranceTestSessions.testType,
      totalQuestions: entranceTestSessions.totalQuestions,
      answeredCount: entranceTestSessions.answeredCount,
      correctCount: entranceTestSessions.correctCount,
      scorePercent: entranceTestSessions.scorePercent,
      startedAt: entranceTestSessions.startedAt,
      finishedAt: entranceTestSessions.finishedAt,
      durationSeconds: entranceTestStats.durationSeconds,
      name: userProfiles.name,
      email: userProfiles.email,
      username: userProfiles.username,
      image: userProfiles.image,
    })
    .from(entranceTestSessions)
    .leftJoin(userProfiles, eq(entranceTestSessions.userId, userProfiles.userId))
    .leftJoin(
      entranceTestStats,
      eq(entranceTestSessions.id, entranceTestStats.sessionId),
    )
    .where(eq(entranceTestSessions.batchId, batchId))
    .orderBy(
      desc(entranceTestSessions.scorePercent),
      desc(entranceTestSessions.correctCount),
    );

  return rows;
}
