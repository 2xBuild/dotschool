import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { userProfiles } from "@/server/db/schema";
import { canUserManageProfileSupport } from "@/server/profile/support-access";

export async function getProfilePageData(userId: string) {
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
  });

  const canManageSupport = await canUserManageProfileSupport(userId);

  return { canManageSupport, profile: profile ?? null };
}
