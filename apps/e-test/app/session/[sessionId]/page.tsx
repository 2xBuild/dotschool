import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { ETestRunner } from "@/components/e-test-runner";
import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import { entranceTestSessions } from "@/server/db/schema";
import { getEntranceQuestionSetById } from "@repo/entrance-test";

const DOTSCHOOL_URL =
  process.env.NEXT_PUBLIC_DOTSCHOOL_URL || "http://localhost:3000";

function parseMaybeJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = await auth();

  if (!session?.user?.email || !session.user.id) {
    redirect(DOTSCHOOL_URL);
  }

  const sessionRow = await db.query.entranceTestSessions.findFirst({
    where: and(
      eq(entranceTestSessions.id, sessionId),
      eq(entranceTestSessions.userId, session.user.id),
    ),
  });

  if (!sessionRow) {
    redirect(DOTSCHOOL_URL);
  }

  const questionSet = getEntranceQuestionSetById(sessionRow.questionSetId);
  if (!questionSet) {
    redirect(DOTSCHOOL_URL);
  }

  const batchTitle =
    parseMaybeJson<{ title?: string }>(sessionRow.batchSnapshot)?.title ?? "";
  const questionFormats = Array.from(
    new Set(questionSet.questions.map((question) => question.format)),
  );

  const testType = (sessionRow.testType ?? "entrance") as
    | "entrance"
    | "weekly"
    | "custom";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <ETestRunner
        sessionId={sessionId}
        dotschoolUrl={DOTSCHOOL_URL}
        initialSession={{
          status: sessionRow.status,
          batchTitle,
          testTitle: questionSet.title,
          testType,
          testDescription: sessionRow.testDescription ?? null,
          category: questionSet.category,
          timeLimitMinutes: questionSet.timeLimitMinutes,
          totalQuestions: questionSet.questions.length,
          questionFormats,
        }}
      />
    </div>
  );
}
