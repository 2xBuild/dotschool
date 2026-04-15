import "server-only";

import { eq, desc } from "drizzle-orm";

import { db } from "@/server/db";
import { volunteerApplications, userProfiles } from "@/server/db/schema";

export async function getVolunteerApplications(
  statusFilter?: "pending" | "accepted" | "declined",
) {
  let query = db
    .select({
      id: volunteerApplications.id,
      userId: volunteerApplications.userId,
      email: volunteerApplications.email,
      name: volunteerApplications.name,
      role: volunteerApplications.role,
      motivation: volunteerApplications.motivation,
      experience: volunteerApplications.experience,
      status: volunteerApplications.status,
      createdAt: volunteerApplications.createdAt,
      username: userProfiles.username,
      image: userProfiles.image,
    })
    .from(volunteerApplications)
    .leftJoin(
      userProfiles,
      eq(volunteerApplications.userId, userProfiles.userId),
    )
    .orderBy(desc(volunteerApplications.createdAt))
    .$dynamic();

  if (statusFilter) {
    query = query.where(eq(volunteerApplications.status, statusFilter));
  }

  return query;
}
