import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";

import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import {
  users,
  batches,
  batchEnrollments,
  entranceTestSessions,
  userProfiles,
} from "@/server/db/schema";
import {
  resolveEntranceQuestionSetId,
  getEntranceQuestionSetById,
} from "@repo/entrance-test";

const E_TEST_URL =
  process.env.NEXT_PUBLIC_E_TEST_URL || "http://localhost:3001";

export default async function ETestPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?redirectTo=/e-test");
  }

  const email = session.user.email?.trim().toLowerCase() ?? null;

  const { batch: batchParam, type: typeParam, desc: descParam } = await searchParams;
  const batchId = typeof batchParam === "string" ? batchParam : null;
  const testType =
    typeof typeParam === "string" &&
    (typeParam === "entrance" || typeParam === "weekly" || typeParam === "custom")
      ? typeParam
      : "entrance";
  const testDescription = typeof descParam === "string" ? descParam : null;

  if (!batchId) {
    redirect("/dashboard?error=missing-batch");
  }

  const userRecord = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { id: true, name: true, image: true },
  });

  if (!userRecord) {
    redirect("/dashboard?error=account-not-found");
  }

  const batch = await db.query.batches.findFirst({
    where: eq(batches.id, batchId),
    columns: {
      id: true,
      title: true,
      status: true,
      startsAt: true,
      endsAt: true,
      batchNumber: true,
      totalSeats: true,
      questionSetId: true,
    },
  });

  if (!batch) {
    redirect("/dashboard?error=batch-not-found");
  }

  const enrollment = await db.query.batchEnrollments.findFirst({
    where: and(
      eq(batchEnrollments.userId, userRecord.id),
      eq(batchEnrollments.batchId, batchId),
    ),
  });

  if (!enrollment) {
    redirect(`/dashboard?error=not-enrolled&batch=${batchId}`);
  }

  const questionSetId = resolveEntranceQuestionSetId(batch.questionSetId);
  const questionSet = getEntranceQuestionSetById(questionSetId);

  if (!questionSet) {
    redirect("/dashboard?error=test-unavailable");
  }

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userRecord.id),
    columns: { username: true },
  });

  const sessionId = crypto.randomUUID();
  const now = new Date();

  const userSnapshot = JSON.stringify({
    email,
    name: session.user.name ?? null,
    image: userRecord.image ?? null,
    username: profile?.username ?? null,
  });

  const batchSnapshot = JSON.stringify({
    id: batch.id,
    title: batch.title,
    status: batch.status,
    startsAt: batch.startsAt?.toISOString() ?? null,
    endsAt: batch.endsAt ? batch.endsAt.toISOString() : null,
    batchNumber: batch.batchNumber,
    totalSeats: batch.totalSeats,
  });

  await db.insert(entranceTestSessions).values({
    id: sessionId,
    userId: userRecord.id,
    batchId: batch.id,
    questionSetId: questionSet.setId,
    testType,
    testDescription,
    status: "pending",
    totalQuestions: questionSet.questions.length,
    userSnapshot,
    batchSnapshot,
    startedAt: now,
    updatedAt: now,
  });

  redirect(`${E_TEST_URL}/session/${sessionId}`);
}
