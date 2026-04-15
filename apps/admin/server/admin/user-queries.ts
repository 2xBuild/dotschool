import "server-only";

import { eq, desc, like, or, count, sql } from "drizzle-orm";

import { db } from "@/server/db";
import { users, userProfiles, userTags } from "@/server/db/schema";

type StaffTag = "admin" | "mod";

export async function getUsers(search?: string) {
  let query = db
    .select({
      id: users.id,
      name: userProfiles.name,
      email: userProfiles.email,
      username: userProfiles.username,
      image: userProfiles.image,
      lastLoginAt: userProfiles.lastLoginAt,
      createdAt: userProfiles.createdAt,
    })
    .from(users)
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .orderBy(desc(userProfiles.lastLoginAt))
    .limit(100)
    .$dynamic();

  if (search?.trim()) {
    const term = `%${search.trim()}%`;
    query = query.where(
      or(
        like(userProfiles.email, term),
        like(userProfiles.username, term),
        like(userProfiles.name, term),
      ),
    );
  }

  return query;
}

export async function getRoleUsers() {
  const rows = await db
    .select({
      id: users.id,
      name: userProfiles.name,
      email: userProfiles.email,
      username: userProfiles.username,
      image: userProfiles.image,
      lastLoginAt: userProfiles.lastLoginAt,
      tag: userTags.tag,
    })
    .from(userTags)
    .innerJoin(users, eq(userTags.userId, users.id))
    .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
    .orderBy(desc(userProfiles.lastLoginAt));

  const byUser = new Map<
    string,
    {
      id: string;
      name: string | null;
      email: string;
      username: string;
      image: string | null;
      lastLoginAt: Date | null;
      roles: StaffTag[];
    }
  >();

  for (const row of rows) {
    const role = row.tag as StaffTag;
    if (!byUser.has(row.id)) {
      byUser.set(row.id, {
        id: row.id,
        name: row.name,
        email: row.email,
        username: row.username,
        image: row.image,
        lastLoginAt: row.lastLoginAt,
        roles: [role],
      });
      continue;
    }

    const current = byUser.get(row.id);
    if (!current) continue;
    if (!current.roles.includes(role)) current.roles.push(role);
  }

  return Array.from(byUser.values());
}

export async function getUserWithTags(userId: string) {
  const [profile, tags] = await Promise.all([
    db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    }),
    db
      .select({ tag: userTags.tag, grantedAt: userTags.grantedAt })
      .from(userTags)
      .where(eq(userTags.userId, userId)),
  ]);

  return { profile, tags };
}
