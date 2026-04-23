import { and, count, desc, eq } from "drizzle-orm";

import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import {
  batchEnrollments,
  batches,
  entranceTestSessions,
  users,
} from "@/server/db/schema";

export type EnrollmentStatus = "none" | "applied" | "approved";
export type TestStatus = "none" | "pending" | "in_progress" | "submitted" | "abandoned";

export async function getConfirmedBatchWithMemberCount(batchId: string) {
  const batch = await db.query.batches.findFirst({
    where: eq(batches.id, batchId),
  });
  if (!batch || batch.status !== "confirmed") {
    return null;
  }

  const [row] = await db
    .select({ n: count() })
    .from(batchEnrollments)
    .where(eq(batchEnrollments.batchId, batchId));

  let isEnrolled = false;
  let enrollmentStatus: EnrollmentStatus = "none";
  let testStatus: TestStatus = "none";

  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (email) {
    const userRecord = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: { id: true },
    });
    if (userRecord) {
      const [enrollment] = await db
        .select({
          id: batchEnrollments.userId,
          status: batchEnrollments.status,
        })
        .from(batchEnrollments)
        .where(
          and(
            eq(batchEnrollments.userId, userRecord.id),
            eq(batchEnrollments.batchId, batchId),
          ),
        )
        .limit(1);
      isEnrolled = !!enrollment;
      if (enrollment) {
        enrollmentStatus = enrollment.status as "applied" | "approved";
      }

      const [testSession] = await db
        .select({ status: entranceTestSessions.status })
        .from(entranceTestSessions)
        .where(
          and(
            eq(entranceTestSessions.userId, userRecord.id),
            eq(entranceTestSessions.batchId, batchId),
          ),
        )
        .orderBy(desc(entranceTestSessions.createdAt))
        .limit(1);
      if (testSession) {
        testStatus = testSession.status as Exclude<TestStatus, "none">;
      }
    }
  }

  return {
    batch,
    memberCount: Number(row?.n ?? 0),
    isEnrolled,
    enrollmentStatus,
    testStatus,
    testOpensAt: batch.testOpensAt ? batch.testOpensAt.toISOString() : null,
  };
}
