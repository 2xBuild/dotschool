"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import type { UserProfileSocials } from "@/server/db/schema";
import { botMemberTags, botMembers, userProfiles, users } from "@/server/db/schema";
import { canUserManageProfileSupport } from "@/server/profile/support-access";
import { isValidUsername, normalizeUsername } from "@/server/profile/username";

const MAX_PROFILE_NAME_LENGTH = 80;
const MAX_ABOUT_LENGTH = 300;
const MAX_SUPPORT_LABEL_LENGTH = 40;
const SOCIAL_HANDLE_PATTERN = /^[a-z0-9._]{2,32}$/;

function normalizeSocialHandle(value: string) {
  return value.trim().replace(/^@+/, "").toLowerCase();
}

function normalizeSupportUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "";
    }

    return url.toString();
  } catch {
    return "";
  }
}

export async function updateProfile(formData: FormData) {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email) {
    return;
  }

  const userRecord = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true },
  });

  if (!userRecord) {
    return;
  }

  const nameInput = formData.get("name");
  const usernameInput = formData.get("username");
  const aboutInput = formData.get("about");
  const discordInput = formData.get("discordUsername");
  const twitterInput = formData.get("twitterUsername");
  const supportUrlInput = formData.get("supportUrl");
  const supportLabelInput = formData.get("supportLabel");

  const name = typeof nameInput === "string" ? nameInput.trim() : "";
  const username = normalizeUsername(typeof usernameInput === "string" ? usernameInput : "");
  const about = typeof aboutInput === "string" ? aboutInput.trim().slice(0, MAX_ABOUT_LENGTH) : "";
  const discordUsername = normalizeSocialHandle(
    typeof discordInput === "string" ? discordInput : "",
  );
  const twitterUsername = normalizeSocialHandle(
    typeof twitterInput === "string" ? twitterInput : "",
  );
  const rawSupportUrl = typeof supportUrlInput === "string" ? supportUrlInput : "";
  const rawSupportLabel = typeof supportLabelInput === "string" ? supportLabelInput : "";

  if (!name || name.length > MAX_PROFILE_NAME_LENGTH) {
    return;
  }

  if (!isValidUsername(username)) {
    return;
  }

  if (discordUsername && !SOCIAL_HANDLE_PATTERN.test(discordUsername)) {
    return;
  }

  if (twitterUsername && !SOCIAL_HANDLE_PATTERN.test(twitterUsername)) {
    return;
  }

  const duplicateUsername = await db.query.userProfiles.findFirst({
    where: and(eq(userProfiles.username, username), ne(userProfiles.userId, userRecord.id)),
    columns: { userId: true },
  });

  if (duplicateUsername) {
    return;
  }

  const [existingProfile, canManageSupport] = await Promise.all([
    db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userRecord.id),
      columns: { socials: true },
    }),
    canUserManageProfileSupport(userRecord.id),
  ]);

  const supportUrl = canManageSupport ? normalizeSupportUrl(rawSupportUrl) : "";
  const supportLabel = canManageSupport
    ? rawSupportLabel.trim().slice(0, MAX_SUPPORT_LABEL_LENGTH)
    : "";

  if (canManageSupport && rawSupportUrl.trim() && !supportUrl) {
    return;
  }

  const previousSocials = existingProfile?.socials ?? {};
  const previousDiscordUsername = normalizeSocialHandle(previousSocials.discord?.username ?? "");
  const existingDiscordUserId =
    previousDiscordUsername && previousDiscordUsername === discordUsername
      ? previousSocials.discord?.userId ?? null
      : null;
  const previousSupport = previousSocials.support ?? null;

  const socials: UserProfileSocials = {
    ...(discordUsername
      ? {
          discord: {
            username: discordUsername,
            userId: existingDiscordUserId,
          },
        }
      : {}),
    ...(twitterUsername
      ? {
          twitter: {
            username: twitterUsername,
          },
        }
      : {}),
    ...(supportUrl
      ? {
          support: {
            label: supportLabel || "Support",
            url: supportUrl,
          },
        }
      : !canManageSupport && previousSupport
        ? {
            support: previousSupport,
          }
      : {}),
  };

  const now = new Date();

  await db
    .insert(userProfiles)
    .values({
      userId: userRecord.id,
      email,
      name,
      username,
      about: about || null,
      socials,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        email,
        name,
        username,
        about: about || null,
        socials,
        updatedAt: now,
      },
    });

  await db.update(users).set({ name }).where(eq(users.id, userRecord.id));

  // If Discord username changed, transfer bot member tags to the new account
  if (
    previousDiscordUsername &&
    discordUsername &&
    previousDiscordUsername !== discordUsername
  ) {
    const oldMember = await db.query.botMembers.findFirst({
      where: eq(botMembers.username, previousDiscordUsername),
      columns: { discordId: true },
    });
    const newMember = await db.query.botMembers.findFirst({
      where: eq(botMembers.username, discordUsername),
      columns: { discordId: true },
    });

    if (oldMember && newMember && oldMember.discordId !== newMember.discordId) {
      const oldTags = await db
        .select({ tag: botMemberTags.tag, assignedBy: botMemberTags.assignedBy })
        .from(botMemberTags)
        .where(eq(botMemberTags.discordId, oldMember.discordId));

      if (oldTags.length > 0) {
        for (const t of oldTags) {
          await db
            .insert(botMemberTags)
            .values({
              discordId: newMember.discordId,
              tag: t.tag,
              assignedBy: t.assignedBy,
            })
            .onConflictDoNothing();
        }

        await db
          .delete(botMemberTags)
          .where(eq(botMemberTags.discordId, oldMember.discordId));
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/profile");
}

export async function updateDiscordUsername(formData: FormData) {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email) {
    return;
  }

  const userRecord = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true, name: true },
  });

  if (!userRecord) {
    return;
  }

  const discordInput = formData.get("discordUsername");
  const discordUsername = normalizeSocialHandle(
    typeof discordInput === "string" ? discordInput : "",
  );

  if (!discordUsername || !SOCIAL_HANDLE_PATTERN.test(discordUsername)) {
    return;
  }

  const existingProfile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userRecord.id),
    columns: { username: true, socials: true },
  });

  const previousSocials = existingProfile?.socials ?? {};
  const previousDiscordUsername = normalizeSocialHandle(
    previousSocials.discord?.username ?? "",
  );
  const existingDiscordUserId =
    previousDiscordUsername && previousDiscordUsername === discordUsername
      ? previousSocials.discord?.userId ?? null
      : null;

  const socials: UserProfileSocials = {
    ...previousSocials,
    discord: {
      username: discordUsername,
      userId: existingDiscordUserId,
    },
  };

  const now = new Date();

  if (existingProfile) {
    await db
      .update(userProfiles)
      .set({ socials, updatedAt: now })
      .where(eq(userProfiles.userId, userRecord.id));
  } else {
    // New profile: fall back to a derived username so we satisfy NOT NULL.
    const fallbackUsername = normalizeUsername(email.split("@")[0] ?? "");
    if (!isValidUsername(fallbackUsername)) {
      return;
    }
    const duplicateUsername = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.username, fallbackUsername),
      columns: { userId: true },
    });
    if (duplicateUsername) {
      return;
    }
    await db.insert(userProfiles).values({
      userId: userRecord.id,
      email,
      name: userRecord.name ?? null,
      username: fallbackUsername,
      socials,
      updatedAt: now,
    });
  }

  // Transfer bot member tags if the Discord handle changed.
  if (
    previousDiscordUsername &&
    previousDiscordUsername !== discordUsername
  ) {
    const oldMember = await db.query.botMembers.findFirst({
      where: eq(botMembers.username, previousDiscordUsername),
      columns: { discordId: true },
    });
    const newMember = await db.query.botMembers.findFirst({
      where: eq(botMembers.username, discordUsername),
      columns: { discordId: true },
    });

    if (oldMember && newMember && oldMember.discordId !== newMember.discordId) {
      const oldTags = await db
        .select({ tag: botMemberTags.tag, assignedBy: botMemberTags.assignedBy })
        .from(botMemberTags)
        .where(eq(botMemberTags.discordId, oldMember.discordId));

      if (oldTags.length > 0) {
        for (const t of oldTags) {
          await db
            .insert(botMemberTags)
            .values({
              discordId: newMember.discordId,
              tag: t.tag,
              assignedBy: t.assignedBy,
            })
            .onConflictDoNothing();
        }

        await db
          .delete(botMemberTags)
          .where(eq(botMemberTags.discordId, oldMember.discordId));
      }
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");
}
