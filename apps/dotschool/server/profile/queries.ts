import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { userProfiles, users } from "@/server/db/schema";
import { canUserManageProfileSupport } from "@/server/profile/support-access";

export async function getProfilePageData(email: string) {
  const [profile, userRecord] = await Promise.all([
    db.query.userProfiles.findFirst({
      where: eq(userProfiles.email, email),
    }),
    db.query.users.findFirst({
      where: eq(users.email, email),
      columns: { id: true },
    }),
  ]);

  const canManageSupport = userRecord
    ? await canUserManageProfileSupport(userRecord.id)
    : false;

  return { canManageSupport, profile: profile ?? null };
}
