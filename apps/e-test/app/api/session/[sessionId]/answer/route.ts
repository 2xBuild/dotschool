import { auth } from "@/server/auth/config";
import {
  getCorrectOptionText,
  getEntranceQuestionById,
  getEntranceQuestionPublic,
  getEntranceQuestionSetById,
  isEntranceAnswerCorrect,
} from "@repo/entrance-test";
import {
  appendRedisAnswer,
  redisGet,
  redisSadd,
  redisSismember,
  redisSet,
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
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }

  const { sessionId } = await params;

  const body = (await request.json().catch(() => null)) as {
    questionId?: string;
    selectedOption?: string;
    responseMs?: number;
  } | null;

  const questionId = body?.questionId?.trim();
  const selectedOption = body?.selectedOption?.trim();
  const responseMs =
    typeof body?.responseMs === "number" && Number.isFinite(body.responseMs)
      ? Math.floor(body.responseMs)
      : null;

  if (!questionId || !selectedOption) {
    return Response.json(
      { ok: false, error: "questionId and selectedOption are required" },
      { status: 400 },
    );
  }

  // Everything below is Redis-only — no PostgreSQL
  const raw = await redisGet(metaKey(sessionId));
  if (!raw) {
    return Response.json({ ok: false, error: "Session not found" }, { status: 404 });
  }

  const meta = JSON.parse(raw) as RedisSessionMeta;

  if (meta.userId !== userId) {
    return Response.json({ ok: false, error: "Session not found" }, { status: 404 });
  }

  if (meta.status !== "in_progress") {
    return Response.json({ ok: false, error: "Session is not active" }, { status: 409 });
  }

  const alreadyAnswered = await redisSismember(answeredSetKey(sessionId), questionId);
  if (alreadyAnswered) {
    return Response.json(
      { ok: false, error: "Question already answered" },
      { status: 409 },
    );
  }

  const questionSet = getEntranceQuestionSetById(meta.questionSetId);
  if (!questionSet) {
    return Response.json(
      { ok: false, error: "Question set unavailable" },
      { status: 500 },
    );
  }

  const now = new Date();
  const timeLimitMs = questionSet.timeLimitMinutes * 60 * 1000;
  if (now.getTime() - new Date(meta.startedAt).getTime() > timeLimitMs) {
    return Response.json(
      { ok: false, error: "Time limit exceeded" },
      { status: 408 },
    );
  }

  const question = getEntranceQuestionById(meta.questionSetId, questionId);
  if (!question) {
    return Response.json({ ok: false, error: "Question not found" }, { status: 404 });
  }

  const isCorrect = isEntranceAnswerCorrect(question, selectedOption);
  const correctOption = getCorrectOptionText(question);
  const answeredCount = meta.answeredCount + 1;
  const correctCount = meta.correctCount + (isCorrect ? 1 : 0);

  const updatedMeta: RedisSessionMeta = { ...meta, answeredCount, correctCount };

  await Promise.all([
    redisSet(metaKey(sessionId), JSON.stringify(updatedMeta)),
    redisSadd(answeredSetKey(sessionId), questionId),
    appendRedisAnswer(
      answersKey(sessionId),
      JSON.stringify({
        sessionId: meta.sessionId,
        questionId,
        selectedOption,
        correctOption,
        isCorrect,
        answeredAt: now.toISOString(),
        responseMs,
        answeredCount,
        correctCount,
      }),
    ),
  ]);

  const nextQuestion = questionSet.questions[answeredCount] ?? null;
  const isComplete = answeredCount >= meta.totalQuestions;

  return Response.json({
    ok: true,
    data: {
      sessionId: meta.sessionId,
      answeredCount,
      totalQuestions: meta.totalQuestions,
      isComplete,
      question: nextQuestion ? getEntranceQuestionPublic(nextQuestion) : null,
    },
  });
}
