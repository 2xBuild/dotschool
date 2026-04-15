import { and, eq } from "drizzle-orm";

import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import { entranceTestSessions } from "@/server/db/schema";
import {
  getEntranceQuestionPublic,
  getEntranceQuestionSetById,
} from "@repo/entrance-test";
import {
  initializeRedisSession,
  redisGet,
} from "@/server/tests/entrance/redis";

type RedisSessionMeta = {
  sessionId: string;
  userId: string;
  batchId: string;
  questionSetId: string;
  startedAt: string;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  status: string;
  userSnapshot: string;
  batchSnapshot: string;
};

function parseMaybeJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function metaKey(id: string) {
  return `entrance:session:${id}:meta`;
}
function answersKey(id: string) {
  return `entrance:session:${id}:answers`;
}
function answeredSetKey(id: string) {
  return `entrance:session:${id}:answered`;
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }

  const { sessionId } = await params;

  const sessionRow = await db.query.entranceTestSessions.findFirst({
    where: and(
      eq(entranceTestSessions.id, sessionId),
      eq(entranceTestSessions.userId, userId),
    ),
  });

  if (!sessionRow) {
    return Response.json({ ok: false, error: "Session not found" }, { status: 404 });
  }

  if (sessionRow.status === "submitted") {
    const batchSnapshot = parseMaybeJson<{ title?: string }>(
      sessionRow.batchSnapshot,
    );
    const durationSeconds =
      sessionRow.finishedAt && sessionRow.startedAt
        ? Math.max(
            1,
            Math.floor(
              (sessionRow.finishedAt.getTime() - sessionRow.startedAt.getTime()) /
                1000,
            ),
          )
        : 0;
    return Response.json({
      ok: true,
      data: {
        status: "submitted" as const,
        sessionId: sessionRow.id,
        batchTitle: batchSnapshot?.title ?? null,
        totalQuestions: sessionRow.totalQuestions,
        answeredCount: sessionRow.answeredCount,
        correctCount: sessionRow.correctCount,
        scorePercent: sessionRow.scorePercent,
        durationSeconds,
      },
    });
  }

  if (sessionRow.status === "abandoned") {
    return Response.json(
      { ok: false, error: "Session was abandoned" },
      { status: 409 },
    );
  }

  const questionSet = getEntranceQuestionSetById(sessionRow.questionSetId);
  if (!questionSet) {
    return Response.json(
      { ok: false, error: "Question set unavailable" },
      { status: 500 },
    );
  }

  if (sessionRow.status === "in_progress") {
    const raw = await redisGet(metaKey(sessionId));
    if (raw) {
      const meta = JSON.parse(raw) as RedisSessionMeta;
      const batchSnapshot = parseMaybeJson<{ title?: string }>(meta.batchSnapshot);
      const nextQuestion = questionSet.questions[meta.answeredCount] ?? null;
      return Response.json({
        ok: true,
        data: {
          status: "in_progress" as const,
          sessionId: sessionRow.id,
          batchTitle: batchSnapshot?.title ?? null,
          questionSet: {
            setId: questionSet.setId,
            title: questionSet.title,
            category: questionSet.category,
            timeLimitMinutes: questionSet.timeLimitMinutes,
          },
          startedAt: meta.startedAt,
          totalQuestions: meta.totalQuestions,
          answeredCount: meta.answeredCount,
          question: nextQuestion
            ? getEntranceQuestionPublic(nextQuestion)
            : null,
        },
      });
    }
    return Response.json(
      { ok: false, error: "Session state expired" },
      { status: 410 },
    );
  }

  const now = new Date();
  const meta: RedisSessionMeta = {
    sessionId: sessionRow.id,
    userId: sessionRow.userId,
    batchId: sessionRow.batchId ?? "",
    questionSetId: sessionRow.questionSetId,
    startedAt: now.toISOString(),
    totalQuestions: questionSet.questions.length,
    answeredCount: 0,
    correctCount: 0,
    status: "in_progress",
    userSnapshot: sessionRow.userSnapshot,
    batchSnapshot: sessionRow.batchSnapshot ?? "{}",
  };

  await initializeRedisSession(
    metaKey(sessionRow.id),
    answersKey(sessionRow.id),
    answeredSetKey(sessionRow.id),
    JSON.stringify(meta),
  );

  return Response.json({
    ok: true,
    data: {
      status: "started" as const,
      sessionId: sessionRow.id,
      batchTitle:
        parseMaybeJson<{ title?: string }>(sessionRow.batchSnapshot)?.title ??
        null,
      questionSet: {
        setId: questionSet.setId,
        title: questionSet.title,
        category: questionSet.category,
        timeLimitMinutes: questionSet.timeLimitMinutes,
      },
      startedAt: now.toISOString(),
      totalQuestions: questionSet.questions.length,
      answeredCount: 0,
      question: questionSet.questions[0]
        ? getEntranceQuestionPublic(questionSet.questions[0])
        : null,
    },
  });
}
