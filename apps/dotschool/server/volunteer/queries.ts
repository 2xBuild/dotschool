import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { volunteerApplications } from "@/server/db/schema";

/** True if this user already has a row in `volunteer_application` (by `user.id`). */
export async function hasExistingApplication(userId: string) {
  const existing = await db
    .select({ id: volunteerApplications.id })
    .from(volunteerApplications)
    .where(eq(volunteerApplications.userId, userId))
    .limit(1);

  return existing.length > 0;
}
