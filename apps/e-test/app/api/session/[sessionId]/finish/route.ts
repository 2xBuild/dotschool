import { asc, eq } from "drizzle-orm";

import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import {
  entranceTestResponses,
  entranceTestSessions,
  entranceTestStats,
} from "@/server/db/schema";
import { redisGet, redisLrange } from "@/server/tests/entrance/redis";

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

function metaKey(id: string) {
  return `entrance:session:${id}:meta`;
}
function answersKey(id: string) {
  return `entrance:session:${id}:answers`;
}

function parseMaybeJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
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

  const raw = await redisGet(metaKey(sessionId));
  if (!raw) {
    return Response.json({ ok: false, error: "Session not found" }, { status: 404 });
  }

  const meta = JSON.parse(raw) as RedisSessionMeta;

  if (meta.userId !== userId) {
    return Response.json({ ok: false, error: "Session not found" }, { status: 404 });
  }

  const finishedAt = new Date();
  const startedMs = new Date(meta.startedAt).getTime();
  const durationSeconds = Math.max(
    1,
    Math.floor((finishedAt.getTime() - startedMs) / 1000),
  );
  const scorePercent =
    meta.totalQuestions > 0
      ? Math.round((meta.correctCount / meta.totalQuestions) * 100)
      : 0;

  const rawAnswers = await redisLrange(answersKey(sessionId));
  const parsedAnswers = rawAnswers
    .map((entry) =>
      parseMaybeJson<{
        questionId: string;
        selectedOption: string;
        correctOption: string;
        isCorrect: boolean;
        responseMs: number | null;
        answeredAt: string;
      }>(entry),
    )
    .filter(Boolean);

  if (parsedAnswers.length > 0) {
    await db
      .insert(entranceTestResponses)
      .values(
        parsedAnswers.map((a) => ({
          sessionId,
          questionId: a!.questionId,
          selectedOption: a!.selectedOption,
          correctOption: a!.correctOption,
          isCorrect: a!.isCorrect,
          responseMs: a!.responseMs,
          answeredAt: new Date(a!.answeredAt),
          payload: JSON.stringify(a),
        })),
      )
      .onConflictDoNothing();
  }

  const dbResponses = await db
    .select({
      questionId: entranceTestResponses.questionId,
      selectedOption: entranceTestResponses.selectedOption,
      correctOption: entranceTestResponses.correctOption,
      isCorrect: entranceTestResponses.isCorrect,
      responseMs: entranceTestResponses.responseMs,
      answeredAt: entranceTestResponses.answeredAt,
    })
    .from(entranceTestResponses)
    .where(eq(entranceTestResponses.sessionId, sessionId))
    .orderBy(asc(entranceTestResponses.answeredAt));

  const statsJson = JSON.stringify({
    session: {
      id: sessionId,
      questionSetId: meta.questionSetId,
      status: "submitted",
      startedAt: meta.startedAt,
      finishedAt: finishedAt.toISOString(),
      totalQuestions: meta.totalQuestions,
      answeredCount: meta.answeredCount,
      correctCount: meta.correctCount,
      scorePercent,
      durationSeconds,
    },
    user: parseMaybeJson(meta.userSnapshot),
    batch: parseMaybeJson(meta.batchSnapshot),
    responses: dbResponses,
  });

  await db
    .insert(entranceTestStats)
    .values({
      sessionId,
      userId: meta.userId,
      batchId: meta.batchId || null,
      questionSetId: meta.questionSetId,
      totalQuestions: meta.totalQuestions,
      answeredCount: meta.answeredCount,
      correctCount: meta.correctCount,
      scorePercent,
      durationSeconds,
      statsJson,
      dumpedAt: finishedAt,
    })
    .onConflictDoUpdate({
      target: entranceTestStats.sessionId,
      set: {
        totalQuestions: meta.totalQuestions,
        answeredCount: meta.answeredCount,
        correctCount: meta.correctCount,
        scorePercent,
        durationSeconds,
        statsJson,
        dumpedAt: finishedAt,
      },
    });

  await db
    .update(entranceTestSessions)
    .set({
      status: "submitted",
      answeredCount: meta.answeredCount,
      correctCount: meta.correctCount,
      scorePercent,
      finishedAt,
      statsDumpedAt: finishedAt,
      updatedAt: finishedAt,
    })
    .where(eq(entranceTestSessions.id, sessionId));

  return Response.json({
    ok: true,
    data: {
      sessionId,
      questionSetId: meta.questionSetId,
      totalQuestions: meta.totalQuestions,
      answeredCount: meta.answeredCount,
      correctCount: meta.correctCount,
      scorePercent,
      durationSeconds,
      finishedAt: finishedAt.toISOString(),
    },
  });
}
