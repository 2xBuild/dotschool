import "server-only";

import { eq } from "drizzle-orm";

import { auth } from "./config";
import { db } from "@/server/db";
import { userProfiles, userTags } from "@/server/db/schema";

export type UserTag = "admin" | "mod";

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  username: string;
  image: string | null;
  tags: UserTag[];
};

/**
 * Returns the current admin user with their tags, or null if unauthenticated
 * or the user has no admin/mod/volunteer tag.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const session = await auth();
  if (!session?.user?.email) return null;

  const userId = (session.user as { id?: string }).id;
  if (!userId) return null;

  const [profile, tags] = await Promise.all([
    db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    }),
    db
      .select({ tag: userTags.tag })
      .from(userTags)
      .where(eq(userTags.userId, userId)),
  ]);

  if (!profile) return null;

  const userTagList = tags.map((t) => t.tag) as UserTag[];
  if (userTagList.length === 0) return null;

  return {
    id: userId,
    email: profile.email,
    name: profile.name,
    username: profile.username,
    image: profile.image,
    tags: userTagList,
  };
}

export function hasTag(user: AdminUser, tag: UserTag): boolean {
  return user.tags.includes(tag);
}

export function isAdmin(user: AdminUser): boolean {
  return hasTag(user, "admin");
}

/** Check if user is at least a mod (admin or mod) */
export function isMod(user: AdminUser): boolean {
  return hasTag(user, "admin") || hasTag(user, "mod");
}
