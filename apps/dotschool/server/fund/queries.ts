import "server-only";

import { eq, sql } from "drizzle-orm";

import { roleName } from "@/lib/batch-volunteers";
import { db } from "@/server/db";
import type { UserProfileSocials } from "@/server/db/schema";
import {
  batchEnrollments,
  batchVolunteers,
  userProfiles,
  volunteerApplications,
} from "@/server/db/schema";

export type FundSupportPerson = {
  about: string | null;
  image: string | null;
  name: string;
  role: string;
  supportUrl: string | null;
  username: string | null;
  batchCount: number;
};

function normalizeExternalUrl(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function getSupportUrl(socials: UserProfileSocials | null | undefined) {
  return normalizeExternalUrl(socials?.support?.url);
}

/** Count distinct batches a user is enrolled in or volunteering for. */
async function getBatchCounts(userIds: string[]): Promise<Map<string, number>> {
  if (userIds.length === 0) return new Map();

  const rows = await db
    .select({
      userId: sql<string>`user_id`,
      n: sql<number>`count(distinct batch_id)`,
    })
    .from(
      sql`(
        SELECT ${batchEnrollments.userId} AS user_id, ${batchEnrollments.batchId} AS batch_id
        FROM ${batchEnrollments}
        WHERE ${batchEnrollments.userId} IN ${userIds}
        UNION
        SELECT ${batchVolunteers.userId} AS user_id, ${batchVolunteers.batchId} AS batch_id
        FROM ${batchVolunteers}
        WHERE ${batchVolunteers.userId} IN ${userIds}
      ) AS combined`,
    )
    .groupBy(sql`user_id`);

  return new Map(rows.map((r) => [r.userId, Number(r.n)]));
}

export async function getFundPageData() {
  const creatorUserId = process.env.DOTSCHOOL_CREATOR_USER_ID?.trim() || null;

  let creator: FundSupportPerson | null = null;
  if (creatorUserId) {
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, creatorUserId),
    });
    if (profile) {
      const counts = await getBatchCounts([creatorUserId]);
      creator = {
        about: profile.about,
        image: profile.image,
        name: profile.name || profile.username || "Creator",
        role: "Creator",
        supportUrl: getSupportUrl(profile.socials),
        username: profile.username,
        batchCount: counts.get(creatorUserId) ?? 0,
      };
    }
  }

  const appRows = await db
    .select({
      userId: volunteerApplications.userId,
      role: volunteerApplications.role,
    })
    .from(volunteerApplications)
    .where(eq(volunteerApplications.status, "accepted"));

  const batchVolRows = await db
    .select({
      userId: batchVolunteers.userId,
      role: batchVolunteers.role,
    })
    .from(batchVolunteers);

  // Deduplicate by userId, prefer application role over batch role
  const volunteerMap = new Map<string, string>();
  for (const row of batchVolRows) {
    if (!volunteerMap.has(row.userId)) {
      volunteerMap.set(row.userId, row.role);
    }
  }
  for (const row of appRows) {
    volunteerMap.set(row.userId, row.role);
  }

  if (creatorUserId) {
    volunteerMap.delete(creatorUserId);
  }

  const volunteerUserIds = [...volunteerMap.keys()];
  if (volunteerUserIds.length === 0) {
    return {
      creator,
      organisationSupportUrl:
        normalizeExternalUrl(process.env.DOTSCHOOL_ORG_SUPPORT_URL) || "mailto:contact@dotschool.org",
      volunteers: [] as FundSupportPerson[],
    };
  }

  const profiles = await db
    .select()
    .from(userProfiles)
    .where(sql`${userProfiles.userId} IN ${volunteerUserIds}`);

  const profileMap = new Map(profiles.map((p) => [p.userId, p]));
  const batchCounts = await getBatchCounts(volunteerUserIds);

  const volunteers: FundSupportPerson[] = volunteerUserIds
    .map((userId) => {
      const profile = profileMap.get(userId);
      const role = volunteerMap.get(userId)!;
      return {
        about: profile?.about ?? null,
        image: profile?.image ?? null,
        name: profile?.name || profile?.username || "Volunteer",
        role: roleName(role),
        supportUrl: getSupportUrl(profile?.socials),
        username: profile?.username ?? null,
        batchCount: batchCounts.get(userId) ?? 0,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    creator,
    organisationSupportUrl:
      normalizeExternalUrl(process.env.DOTSCHOOL_ORG_SUPPORT_URL) || "mailto:contact@dotschool.org",
    volunteers,
  };
}
