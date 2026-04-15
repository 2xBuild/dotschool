"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getAdminUser, isMod } from "@/server/auth/access";
import { db } from "@/server/db";
import { volunteerApplications } from "@/server/db/schema";

export async function updateApplicationStatus(
  applicationId: string,
  status: "accepted" | "declined",
) {
  const user = await getAdminUser();
  if (!user || !isMod(user)) return { error: "Unauthorized" };

  await db
    .update(volunteerApplications)
    .set({ status })
    .where(eq(volunteerApplications.id, applicationId));

  revalidatePath("/volunteers");
  return { ok: true };
}
