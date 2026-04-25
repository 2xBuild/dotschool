import "server-only";

import { eq, sql, and } from "drizzle-orm";

import { db } from "@/server/db";
import {
  userProfiles,
  batchEnrollments,
  batches,
  batchVolunteers,
  entranceTestSessions,
} from "@/server/db/schema";

export type DirectoryBadge = {
  key: string;
  label: string;
  tone: "emerald" | "amber" | "sky" | "violet" | "rose" | "orange";
};

export type DirectoryPerson = {
  name: string;
  username: string;
  about: string | null;
  image: string | null;
  twitter: string | null;
  joinedAt: string;
  batches: { title: string; batchNumber: number }[];
  roles: string[];
  badges: DirectoryBadge[];
};

function deriveBadges(opts: {
  batchCount: number;
  roles: string[];
  testsPassed: number;
}): DirectoryBadge[] {
  const badges: DirectoryBadge[] = [];

  if (opts.batchCount >= 1) {
    badges.push({ key: "learner", label: "Learner", tone: "sky" });
  }
  if (opts.batchCount >= 3) {
    badges.push({ key: "veteran", label: "Veteran", tone: "violet" });
  }

  if (opts.testsPassed >= 1) {
    badges.push({ key: "test-ace", label: "Test Ace", tone: "emerald" });
  }

  if (opts.roles.includes("mentor")) {
    badges.push({ key: "mentor", label: "Mentor", tone: "amber" });
  }
  if (opts.roles.includes("developer")) {
    badges.push({ key: "builder", label: "Builder", tone: "orange" });
  }
  if (opts.roles.includes("discord_mod")) {
    badges.push({ key: "moderator", label: "Moderator", tone: "rose" });
  }
  if (opts.roles.includes("content_writer")) {
    badges.push({ key: "writer", label: "Writer", tone: "violet" });
  }

  return badges;
}

export async function getDirectoryData(): Promise<DirectoryPerson[]> {
  const profiles = await db
    .select({
      userId: userProfiles.userId,
      name: userProfiles.name,
      username: userProfiles.username,
      about: userProfiles.about,
      image: userProfiles.image,
      socials: userProfiles.socials,
      createdAt: userProfiles.createdAt,
    })
    .from(userProfiles)
    .where(eq(userProfiles.showInDirectory, true))
    .orderBy(userProfiles.createdAt);

  if (profiles.length === 0) return [];

  const userIds = profiles.map((p) => p.userId);

  const [enrollmentRows, volunteerRows, testRows] = await Promise.all([
    db
      .select({
        userId: batchEnrollments.userId,
        batchTitle: batches.title,
        batchNumber: batches.batchNumber,
      })
      .from(batchEnrollments)
      .innerJoin(batches, eq(batchEnrollments.batchId, batches.id))
      .where(sql`${batchEnrollments.userId} IN ${userIds}`),

    db
      .select({
        userId: batchVolunteers.userId,
        role: batchVolunteers.role,
      })
      .from(batchVolunteers)
      .where(sql`${batchVolunteers.userId} IN ${userIds}`),

    db
      .select({
        userId: entranceTestSessions.userId,
      })
      .from(entranceTestSessions)
      .where(
        and(
          sql`${entranceTestSessions.userId} IN ${userIds}`,
          eq(entranceTestSessions.status, "submitted"),
        ),
      ),
  ]);

  // Build lookup maps
  const batchMap = new Map<string, { title: string; batchNumber: number }[]>();
  for (const row of enrollmentRows) {
    const list = batchMap.get(row.userId) ?? [];
    if (!list.some((b) => b.batchNumber === row.batchNumber)) {
      list.push({ title: row.batchTitle, batchNumber: row.batchNumber });
    }
    batchMap.set(row.userId, list);
  }

  const roleMap = new Map<string, Set<string>>();
  for (const row of volunteerRows) {
    const set = roleMap.get(row.userId) ?? new Set();
    set.add(row.role);
    roleMap.set(row.userId, set);
  }

  const testPassMap = new Map<string, number>();
  for (const row of testRows) {
    testPassMap.set(row.userId, (testPassMap.get(row.userId) ?? 0) + 1);
  }

  return profiles.map((p) => {
    const userBatches = batchMap.get(p.userId) ?? [];
    const roles = [...(roleMap.get(p.userId) ?? [])];
    const testsPassed = testPassMap.get(p.userId) ?? 0;

    return {
      name: p.name ?? p.username,
      username: p.username,
      about: p.about,
      image: p.image,
      twitter: p.socials?.twitter?.username ?? null,
      joinedAt: p.createdAt.toISOString(),
      batches: userBatches,
      roles,
      badges: deriveBadges({
        batchCount: userBatches.length,
        roles,
        testsPassed,
      }),
    };
  });
}
