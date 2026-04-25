import "server-only";

import type { InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { userProfiles } from "@/server/db/schema";
import { canUserManageProfileSupport } from "@/server/profile/support-access";

export type ProfilePageProfile = InferSelectModel<typeof userProfiles>;

export async function getProfilePageData(userId: string) {
  const [profiles, canManageSupport] = await Promise.all([
    db
      .select({
        userId: userProfiles.userId,
        email: userProfiles.email,
        name: userProfiles.name,
        username: userProfiles.username,
        about: userProfiles.about,
        socials: userProfiles.socials,
        image: userProfiles.image,
        showInDirectory: userProfiles.showInDirectory,
        provider: userProfiles.provider,
        createdAt: userProfiles.createdAt,
        updatedAt: userProfiles.updatedAt,
        lastLoginAt: userProfiles.lastLoginAt,
      })
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1),
    canUserManageProfileSupport(userId),
  ]);

  const profile: ProfilePageProfile | null = profiles[0] ?? null;

  return { canManageSupport, profile: profile ?? null };
}
