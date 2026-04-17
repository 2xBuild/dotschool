import "server-only";

import { and, asc, count, desc, eq, gt, inArray, notInArray } from "drizzle-orm";

import { batchHasProgramDetails } from "@/components/dashboard/batch-types";
import type { BatchProgramDetails } from "@/components/dashboard/batch-types";
import type { BatchTabItem } from "@/components/dashboard/batch-tabs";
import type { PossibleBatchItem } from "@/components/dashboard/possible-batches";
import { effectiveCardIconKeys } from "@/lib/batch-card-icon-keys";
import { db } from "@/server/db";
import {
  batchEnrollments,
  batchInterestVotes,
  batches,
  botMembers,
  entranceTestSessions,
  userProfiles,
} from "@/server/db/schema";
import { resolveEntranceQuestionSetId } from "@repo/entrance-test";

type BatchRow = typeof batches.$inferSelect;

type ProgramDetailFields = Pick<
  BatchRow,
  "roadmap" | "process" | "projects" | "leaderboard" | "rewardPool" | "hackathon" | "tips" | "rules"
>;

function pickProgramDetailsFromFields(row: ProgramDetailFields): BatchProgramDetails | null {
  const details: BatchProgramDetails = {
    roadmap: row.roadmap ?? null,
    process: row.process ?? null,
    projects: row.projects ?? null,
    leaderboard: row.leaderboard ?? null,
    rewardPool: row.rewardPool ?? null,
    hackathon: row.hackathon ?? null,
    tips: row.tips ?? null,
    rules: row.rules ?? null,
  };
  return batchHasProgramDetails(details) ? details : null;
}

function toBatchTabItem(row: {
  id: string;
  title: string;
  description: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  enrolledAt?: Date;
  status?: string;
  questionSetId?: string | null;
  cardIconKeys: string | null;
  batchNumber: number;
  totalSeats: number;
  roadmap: string | null;
  process: string | null;
  projects: string | null;
  leaderboard: string | null;
  rewardPool: string | null;
  hackathon: string | null;
  tips: string | null;
  rules: string | null;
  participantCount: number;
  testStatus?: string | null;
}): BatchTabItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startsAt: row.startsAt?.toISOString() ?? "",
    endsAt: row.endsAt ? row.endsAt.toISOString() : null,
    enrolledAt: row.enrolledAt?.toISOString(),
    status: row.status,
    questionSetId: resolveEntranceQuestionSetId(row.questionSetId),
    batchNumber: row.batchNumber,
    totalSeats: row.totalSeats,
    participantCount: row.participantCount,
    cardIconKeys: effectiveCardIconKeys(row.cardIconKeys, row.id),
    details: pickProgramDetailsFromFields(row),
    testStatus: row.testStatus ?? null,
  };
}

export async function getDashboardData(userId: string) {
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
    columns: {
      name: true,
      username: true,
      image: true,
      socials: true,
    },
  });

  const discordUsername = profile?.socials?.discord?.username?.trim() || null;

  let isInDiscordServer = false;
  if (discordUsername) {
    const member = await db.query.botMembers.findFirst({
      where: eq(botMembers.username, discordUsername),
      columns: { discordId: true },
    });
    isInDiscordServer = !!member;
  }

  const userRow = { id: userId };

  const now = new Date();
  let upcomingRows: BatchRow[] = [];
  let yourBatchRows: {
    id: string;
    title: string;
    description: string | null;
    startsAt: Date | null;
    endsAt: Date | null;
    enrolledAt: Date;
    status: string;
    questionSetId: string | null;
    cardIconKeys: string | null;
    batchNumber: number;
    totalSeats: number;
    roadmap: string | null;
    process: string | null;
    projects: string | null;
    leaderboard: string | null;
    rewardPool: string | null;
    hackathon: string | null;
    tips: string | null;
    rules: string | null;
  }[] = [];

  if (userRow) {
    const enrolled = await db
      .select({ batchId: batchEnrollments.batchId })
      .from(batchEnrollments)
      .where(eq(batchEnrollments.userId, userRow.id));

    const enrolledIds = enrolled.map((r) => r.batchId);

    upcomingRows =
      enrolledIds.length > 0
        ? await db
            .select()
            .from(batches)
            .where(
              and(
                eq(batches.status, "confirmed"),
                gt(batches.startsAt, now),
                notInArray(batches.id, enrolledIds),
              ),
            )
            .orderBy(batches.startsAt)
        : await db
            .select()
            .from(batches)
            .where(and(eq(batches.status, "confirmed"), gt(batches.startsAt, now)))
            .orderBy(batches.startsAt);

    yourBatchRows = await db
      .select({
        id: batches.id,
        title: batches.title,
        description: batches.description,
        startsAt: batches.startsAt,
        endsAt: batches.endsAt,
        enrolledAt: batchEnrollments.enrolledAt,
        status: batchEnrollments.status,
        questionSetId: batches.questionSetId,
        cardIconKeys: batches.cardIconKeys,
        batchNumber: batches.batchNumber,
        totalSeats: batches.totalSeats,
        roadmap: batches.roadmap,
        process: batches.process,
        projects: batches.projects,
        leaderboard: batches.leaderboard,
        rewardPool: batches.rewardPool,
        hackathon: batches.hackathon,
        tips: batches.tips,
        rules: batches.rules,
      })
      .from(batchEnrollments)
      .innerJoin(batches, eq(batchEnrollments.batchId, batches.id))
      .where(eq(batchEnrollments.userId, userRow.id))
      .orderBy(desc(batches.startsAt));
  } else {
    upcomingRows = await db
      .select()
      .from(batches)
      .where(and(eq(batches.status, "confirmed"), gt(batches.startsAt, now)))
      .orderBy(batches.startsAt);
  }

  const yourBatchIds = yourBatchRows.map((r) => r.id);
  const testStatusRows =
    userRow && yourBatchIds.length > 0
      ? await db
          .select({
            batchId: entranceTestSessions.batchId,
            status: entranceTestSessions.status,
          })
          .from(entranceTestSessions)
          .where(
            and(
              eq(entranceTestSessions.userId, userRow.id),
              inArray(entranceTestSessions.batchId, yourBatchIds),
            ),
          )
          .orderBy(desc(entranceTestSessions.createdAt))
      : [];
  const testStatusMap = new Map<string, string>();
  for (const row of testStatusRows) {
    if (row.batchId && !testStatusMap.has(row.batchId)) {
      testStatusMap.set(row.batchId, row.status);
    }
  }

  const participantCountBatchIds = [
    ...new Set([...upcomingRows.map((row) => row.id), ...yourBatchRows.map((row) => row.id)]),
  ];
  const participantCountRows =
    participantCountBatchIds.length > 0
      ? await db
          .select({
            batchId: batchEnrollments.batchId,
            n: count(batchEnrollments.userId),
          })
          .from(batchEnrollments)
          .where(inArray(batchEnrollments.batchId, participantCountBatchIds))
          .groupBy(batchEnrollments.batchId)
      : [];
  const participantCountMap = new Map(
    participantCountRows.map((row) => [row.batchId, Number(row.n)]),
  );

  const upcoming = upcomingRows
    .map((row) =>
      toBatchTabItem({
        ...row,
        participantCount: participantCountMap.get(row.id) ?? 0,
      }),
    )
    .slice(0, 4);
  const yourBatches = yourBatchRows
    .map((row) =>
      toBatchTabItem({
        ...row,
        participantCount: participantCountMap.get(row.id) ?? 0,
        testStatus: testStatusMap.get(row.id) ?? null,
      }),
    )
    .slice(0, 4);

  const possibleBatchRows = await db
    .select()
    .from(batches)
    .where(eq(batches.status, "pending"))
    .orderBy(asc(batches.batchNumber));

  const possibleIds = possibleBatchRows.map((row) => row.id);
  const possibleVoteRows =
    possibleIds.length > 0
      ? await db
          .select({
            batchId: batchInterestVotes.batchId,
            vote: batchInterestVotes.vote,
            n: count(batchInterestVotes.userId),
          })
          .from(batchInterestVotes)
          .where(inArray(batchInterestVotes.batchId, possibleIds))
          .groupBy(batchInterestVotes.batchId, batchInterestVotes.vote)
      : [];
  const upCountMap = new Map<string, number>();
  const downCountMap = new Map<string, number>();
  for (const row of possibleVoteRows) {
    if (row.vote === "up") upCountMap.set(row.batchId, Number(row.n));
    else if (row.vote === "down") downCountMap.set(row.batchId, Number(row.n));
  }

  const userVoteMap = new Map<string, "up" | "down">();
  if (userRow && possibleIds.length > 0) {
    const voted = await db
      .select({ batchId: batchInterestVotes.batchId, vote: batchInterestVotes.vote })
      .from(batchInterestVotes)
      .where(
        and(
          eq(batchInterestVotes.userId, userRow.id),
          inArray(batchInterestVotes.batchId, possibleIds),
        ),
      );
    for (const row of voted) userVoteMap.set(row.batchId, row.vote as "up" | "down");
  }

  const possibleBatches: PossibleBatchItem[] = possibleBatchRows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    batchNumber: row.batchNumber,
    totalSeats: row.totalSeats,
    cardIconKeys: effectiveCardIconKeys(row.cardIconKeys, row.id),
    upCount: upCountMap.get(row.id) ?? 0,
    downCount: downCountMap.get(row.id) ?? 0,
    userVote: userVoteMap.get(row.id) ?? null,
  }));

  return {
    profile: profile
      ? {
          name: profile.name,
          username: profile.username,
          image: profile.image,
        }
      : null,
    discordUsername,
    isInDiscordServer,
    upcoming,
    yourBatches,
    possibleBatches,
    canVotePossibleBatches: !!userRow,
  };
}
