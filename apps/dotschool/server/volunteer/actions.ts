"use server";

import { eq } from "drizzle-orm";

import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import { users, volunteerApplications } from "@/server/db/schema";

type VolunteerRole = "developer" | "discord_mod" | "content_writer" | "mentor" | "other";

const VALID_ROLES: VolunteerRole[] = [
  "developer",
  "discord_mod",
  "content_writer",
  "mentor",
  "other",
];

const MAX_MOTIVATION_LENGTH = 2000;
const MAX_EXPERIENCE_LENGTH = 2000;
const MAX_NAME_LENGTH = 100;

export async function submitVolunteerApplication(formData: FormData) {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email) {
    return { ok: false, error: "You must be signed in to apply." } as const;
  }

  const userRecord = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true, name: true },
  });

  if (!userRecord) {
    return { ok: false, error: "User account not found." } as const;
  }

  const nameInput = formData.get("name");
  const roleInput = formData.get("role");
  const motivationInput = formData.get("motivation");
  const experienceInput = formData.get("experience");

  const name = typeof nameInput === "string" ? nameInput.trim() : "";
  const role = typeof roleInput === "string" ? roleInput.trim() : "";
  const motivation = typeof motivationInput === "string" ? motivationInput.trim() : "";
  const experience = typeof experienceInput === "string" ? experienceInput.trim() : "";

  if (!name || name.length > MAX_NAME_LENGTH) {
    return { ok: false, error: "Please enter a valid name." } as const;
  }

  if (!VALID_ROLES.includes(role as VolunteerRole)) {
    return { ok: false, error: "Please select a valid role." } as const;
  }

  if (!motivation || motivation.length > MAX_MOTIVATION_LENGTH) {
    return { ok: false, error: "Please tell us why you want to join (max 2000 chars)." } as const;
  }

  if (experience.length > MAX_EXPERIENCE_LENGTH) {
    return { ok: false, error: "Experience section is too long (max 2000 chars)." } as const;
  }

  await db.insert(volunteerApplications).values({
    userId: userRecord.id,
    email,
    name,
    role: role as VolunteerRole,
    motivation,
    experience: experience || null,
  });

  return { ok: true } as const;
}
