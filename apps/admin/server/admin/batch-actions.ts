"use server";

import { eq, and, ne, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getAdminUser, isMod } from "@/server/auth/access";
import { db } from "@/server/db";
import {
  batches,
  batchEnrollments,
  batchVolunteers,
  botMemberTags,
  botMembers,
  entranceTestSessions,
  userProfiles,
} from "@/server/db/schema";

const VOLUNTEER_ROLES = [
  "developer",
  "discord_mod",
  "content_writer",
  "mentor",
  "other",
] as const;
type VolunteerRole = (typeof VOLUNTEER_ROLES)[number];

export async function createBatch(formData: FormData) {
  const user = await getAdminUser();
  if (!user || !isMod(user)) return { error: "Unauthorized" };

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "confirmed";
  const startsAt = formData.get("startsAt") as string;
  const endsAt = (formData.get("endsAt") as string) || null;
  const batchNumber = Number(formData.get("batchNumber")) || 1;
  const totalSeats = Number(formData.get("totalSeats")) || 500;
  const questionSetId =
    (formData.get("questionSetId") as string)?.trim() || null;
  const cardIconKeys =
    (formData.get("cardIconKeys") as string)?.trim() || null;

  if (!title) return { error: "Title is required" };
  if (status === "confirmed" && !startsAt)
    return { error: "Start date is required for confirmed batches" };

  const existingBatch = await db.query.batches.findFirst({
    where: eq(batches.batchNumber, batchNumber),
    columns: { id: true },
  });
  if (existingBatch) {
    return { error: `Batch number ${batchNumber} is already in use` };
  }

  const [row] = await db
    .insert(batches)
    .values({
      title,
      description,
      status,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
      batchNumber,
      totalSeats,
      questionSetId,
      cardIconKeys: cardIconKeys === "[]" ? null : cardIconKeys,
    })
    .returning({ id: batches.id });

  revalidatePath("/batches");
  return { ok: true, id: row?.id };
}

export async function updateBatch(batchId: string, formData: FormData) {
  const user = await getAdminUser();
  if (!user || !isMod(user)) return { error: "Unauthorized" };

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "confirmed";
  const startsAt = formData.get("startsAt") as string;
  const endsAt = (formData.get("endsAt") as string) || null;
  const batchNumber = Number(formData.get("batchNumber")) || 1;
  const totalSeats = Number(formData.get("totalSeats")) || 500;
  const questionSetId =
    (formData.get("questionSetId") as string)?.trim() || null;
  const cardIconKeys =
    (formData.get("cardIconKeys") as string)?.trim() || null;
  const roadmap = (formData.get("roadmap") as string)?.trim() || null;
  const process = (formData.get("process") as string)?.trim() || null;
  const projects = (formData.get("projects") as string)?.trim() || null;
  const leaderboard = (formData.get("leaderboard") as string)?.trim() || null;
  const rewardPool = (formData.get("rewardPool") as string)?.trim() || null;
  const hackathon = (formData.get("hackathon") as string)?.trim() || null;

  if (!title) return { error: "Title is required" };
  if (status === "confirmed" && !startsAt)
    return { error: "Start date is required for confirmed batches" };

  const existingBatch = await db.query.batches.findFirst({
    where: and(
      eq(batches.batchNumber, batchNumber),
      ne(batches.id, batchId),
    ),
    columns: { id: true },
  });
  if (existingBatch) {
    return { error: `Batch number ${batchNumber} is already in use` };
  }

  await db
    .update(batches)
    .set({
      title,
      description,
      status,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
      batchNumber,
      totalSeats,
      questionSetId,
      cardIconKeys: cardIconKeys === "[]" ? null : cardIconKeys,
      roadmap,
      process,
      projects,
      leaderboard,
      rewardPool,
      hackathon,
    })
    .where(eq(batches.id, batchId));

  revalidatePath(`/batches/${batchId}`);
  revalidatePath("/batches");
  return { ok: true };
}

function batchTag(batchNumber: number) {
  return `batch-${batchNumber}`;
}

/**
 * Find the bot_member row for a user by looking up their Discord username
 * in their profile, then matching it to bot_member.username.
 */
async function findBotMemberForUser(userId: string) {
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
    columns: { socials: true },
  });
  const discordUsername = profile?.socials?.discord?.username?.trim();
  if (!discordUsername) return null;

  const member = await db.query.botMembers.findFirst({
    where: eq(botMembers.username, discordUsername),
    columns: { discordId: true },
  });
  return member ?? null;
}

const BOT_WEBHOOK_URL = process.env.BOT_WEBHOOK_URL ?? "http://localhost:3100";
const BOT_WEBHOOK_SECRET = process.env.BOT_WEBHOOK_SECRET ?? "";

async function botWebhook(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${BOT_WEBHOOK_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(BOT_WEBHOOK_SECRET
        ? { Authorization: `Bearer ${BOT_WEBHOOK_SECRET}` }
        : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`[botWebhook] ${path} failed:`, data);
  }
  return data;
}

export async function updateEnrollmentStatus(
  userId: string,
  batchId: string,
  status: "applied" | "approved",
) {
  const user = await getAdminUser();
  if (!user || !isMod(user)) return { error: "Unauthorized" };

  await db
    .update(batchEnrollments)
    .set({ status })
    .where(
      and(
        eq(batchEnrollments.userId, userId),
        eq(batchEnrollments.batchId, batchId),
      ),
    );

  const [batch] = await db
    .select({ batchNumber: batches.batchNumber })
    .from(batches)
    .where(eq(batches.id, batchId))
    .limit(1);

  if (batch) {
    const tag = batchTag(batch.batchNumber);
    const botMember = await findBotMemberForUser(userId);

    if (botMember) {
      if (status === "approved") {
        await db
          .insert(botMemberTags)
          .values({ discordId: botMember.discordId, tag, assignedBy: "system" })
          .onConflictDoNothing();
      } else {
        await db
          .delete(botMemberTags)
          .where(
            and(
              eq(botMemberTags.discordId, botMember.discordId),
              eq(botMemberTags.tag, tag),
            ),
          );
      }

      botWebhook("/sync-role", {
        discordId: botMember.discordId,
        tag,
        action: status === "approved" ? "add" : "remove",
      }).catch((err) => console.error("[updateEnrollmentStatus] bot sync failed:", err));
    }
  }

  revalidatePath(`/batches/${batchId}`);
  return { ok: true };
}

export async function startBatch(batchId: string) {
  const user = await getAdminUser();
  if (!user) return { error: "Unauthorized" };
  if (!user.tags.includes("admin")) return { error: "Admin only" };

  const [batch] = await db
    .select({
      id: batches.id,
      title: batches.title,
      batchNumber: batches.batchNumber,
      totalSeats: batches.totalSeats,
      status: batches.status,
    })
    .from(batches)
    .where(eq(batches.id, batchId))
    .limit(1);

  if (!batch) return { error: "Batch not found" };
  if (batch.status === "started") return { error: "Batch already started" };

  const topSessions = await db
    .select({
      userId: entranceTestSessions.userId,
      scorePercent: entranceTestSessions.scorePercent,
      correctCount: entranceTestSessions.correctCount,
      finishedAt: entranceTestSessions.finishedAt,
    })
    .from(entranceTestSessions)
    .where(
      and(
        eq(entranceTestSessions.batchId, batchId),
        eq(entranceTestSessions.status, "submitted"),
      ),
    )
    .orderBy(
      desc(entranceTestSessions.scorePercent),
      desc(entranceTestSessions.correctCount),
    )
    .limit(batch.totalSeats);

  if (topSessions.length === 0) {
    return { error: "No submitted test sessions found for this batch" };
  }

  const approvedUserIds = topSessions.map((s) => s.userId);
  const tag = batchTag(batch.batchNumber);

  await db
    .update(batchEnrollments)
    .set({ status: "approved" })
    .where(
      and(
        eq(batchEnrollments.batchId, batchId),
        inArray(batchEnrollments.userId, approvedUserIds),
      ),
    );

  const discordMembers: { discordId: string }[] = [];
  for (const userId of approvedUserIds) {
    const botMember = await findBotMemberForUser(userId);
    if (botMember) {
      await db
        .insert(botMemberTags)
        .values({ discordId: botMember.discordId, tag, assignedBy: "system" })
        .onConflictDoNothing();
      discordMembers.push({ discordId: botMember.discordId });
    }
  }

  await db
    .update(batches)
    .set({ status: "started" })
    .where(eq(batches.id, batchId));

  const batchLabel = batch.title.trim() || `Batch ${batch.batchNumber}`;
  let discord: Record<string, unknown>;
  try {
    discord = await botWebhook("/start-batch", {
      batchLabel,
      tag,
      batchNumber: batch.batchNumber,
      members: discordMembers,
    });
    if (discord?.category && !discord.error && !discord.skipped) {
      await db
        .update(batches)
        .set({ discordCategoryId: String(discord.category) })
        .where(eq(batches.id, batchId));
    }
  } catch (err) {
    discord = { skipped: true, reason: String(err) };
  }

  revalidatePath(`/batches/${batchId}`);
  revalidatePath("/batches");

  return {
    ok: true,
    approved: approvedUserIds.length,
    totalApplicants: topSessions.length,
    discord,
  };
}

export async function createBatchDiscordChannels(batchId: string) {
  const user = await getAdminUser();
  if (!user) return { error: "Unauthorized" };
  if (!user.tags.includes("admin")) return { error: "Admin only" };

  const [batch] = await db
    .select({
      id: batches.id,
      title: batches.title,
      batchNumber: batches.batchNumber,
      discordCategoryId: batches.discordCategoryId,
    })
    .from(batches)
    .where(eq(batches.id, batchId))
    .limit(1);

  if (!batch) return { error: "Batch not found" };
  if (batch.discordCategoryId) {
    return { error: "Discord channels already exist for this batch" };
  }

  const tag = batchTag(batch.batchNumber);
  const batchLabel = batch.title.trim() || `Batch ${batch.batchNumber}`;

  // Gather approved members for the batch
  const enrollments = await db
    .select({ userId: batchEnrollments.userId })
    .from(batchEnrollments)
    .where(
      and(
        eq(batchEnrollments.batchId, batchId),
        eq(batchEnrollments.status, "approved"),
      ),
    );

  const discordMembers: { discordId: string }[] = [];
  for (const enrollment of enrollments) {
    const botMember = await findBotMemberForUser(enrollment.userId);
    if (botMember) {
      discordMembers.push({ discordId: botMember.discordId });
    }
  }

  let discord: Record<string, unknown>;
  try {
    discord = await botWebhook("/start-batch", {
      batchLabel,
      tag,
      batchNumber: batch.batchNumber,
      members: discordMembers,
    });
  } catch (err) {
    return { error: `Discord webhook failed: ${String(err)}` };
  }

  if (discord.error) {
    return { error: `Discord: ${discord.error}` };
  }

  if (discord.category) {
    await db
      .update(batches)
      .set({ discordCategoryId: String(discord.category) })
      .where(eq(batches.id, batchId));
  }

  revalidatePath(`/batches/${batchId}`);
  return {
    ok: true,
    discord,
  };
}

export async function assignBatchVolunteer(
  batchId: string,
  userId: string,
  role: string,
) {
  const user = await getAdminUser();
  if (!user || !isMod(user)) return { error: "Unauthorized" };

  if (!userId) return { error: "User is required" };
  if (!VOLUNTEER_ROLES.includes(role as VolunteerRole))
    return { error: "Invalid role" };

  await db
    .insert(batchVolunteers)
    .values({ batchId, userId, role: role as VolunteerRole })
    .onConflictDoNothing();

  revalidatePath(`/batches/${batchId}`);
  return { ok: true };
}

export async function removeBatchVolunteer(
  batchId: string,
  userId: string,
  role: string,
) {
  const user = await getAdminUser();
  if (!user || !isMod(user)) return { error: "Unauthorized" };

  if (!VOLUNTEER_ROLES.includes(role as VolunteerRole))
    return { error: "Invalid role" };

  await db
    .delete(batchVolunteers)
    .where(
      and(
        eq(batchVolunteers.batchId, batchId),
        eq(batchVolunteers.userId, userId),
        eq(batchVolunteers.role, role as VolunteerRole),
      ),
    );

  revalidatePath(`/batches/${batchId}`);
  return { ok: true };
}

export async function deleteBatch(batchId: string) {
  const user = await getAdminUser();
  if (!user) return { error: "Unauthorized" };
  if (!user.tags.includes("admin")) return { error: "Admin only" };

  await db.delete(batches).where(eq(batches.id, batchId));
  revalidatePath("/batches");
  return { ok: true };
}
