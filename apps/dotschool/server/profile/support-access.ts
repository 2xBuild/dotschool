import "server-only";

import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/server/db";
import {
  batchVolunteers,
  userTags,
  volunteerApplications,
} from "@/server/db/schema";

const SUPPORT_EDITOR_TAGS = ["admin", "mod"] as const;

export async function canUserManageProfileSupport(userId: string) {
  const tags = await db
    .select({ tag: userTags.tag })
    .from(userTags)
    .where(
      and(
        eq(userTags.userId, userId),
        inArray(userTags.tag, [...SUPPORT_EDITOR_TAGS]),
      ),
    );

  if (tags.length > 0) return true;

  const accepted = await db
    .select({ id: volunteerApplications.id })
    .from(volunteerApplications)
    .where(
      and(
        eq(volunteerApplications.userId, userId),
        eq(volunteerApplications.status, "accepted"),
      ),
    )
    .limit(1);

  if (accepted.length > 0) return true;

  const assigned = await db
    .select({ userId: batchVolunteers.userId })
    .from(batchVolunteers)
    .where(eq(batchVolunteers.userId, userId))
    .limit(1);

  return assigned.length > 0;
}
