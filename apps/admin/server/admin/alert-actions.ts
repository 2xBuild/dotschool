"use server";

import { eq } from "drizzle-orm";

import { getAdminUser, isMod } from "@/server/auth/access";
import { db } from "@/server/db";
import { batchEnrollments, userProfiles } from "@/server/db/schema";

export type AlertPayload = {
  batchId: string;
  subject: string;
  message: string;
  channel: "email" | "in-app";
};

/**
 * Send an alert to all members of a batch.
 *
 * Right now this collects the recipients and returns them — the actual
 * delivery mechanism (email provider, in-app notification table, etc.)
 * can be wired up once the infrastructure is ready.
 */
export async function sendAlert(payload: AlertPayload) {
  const user = await getAdminUser();
  if (!user || !isMod(user)) return { error: "Unauthorized" };

  const { batchId, subject, message, channel } = payload;
  if (!batchId || !subject?.trim() || !message?.trim()) {
    return { error: "All fields are required" };
  }

  const recipients = await db
    .select({
      userId: batchEnrollments.userId,
      email: userProfiles.email,
      name: userProfiles.name,
    })
    .from(batchEnrollments)
    .leftJoin(userProfiles, eq(batchEnrollments.userId, userProfiles.userId))
    .where(eq(batchEnrollments.batchId, batchId));

  // TODO: Wire up actual delivery (email service, push notification, etc.)
  // For now, return the list so the UI can confirm.

  return {
    ok: true,
    recipientCount: recipients.length,
    channel,
  };
}
