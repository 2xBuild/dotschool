"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getAdminUser, isAdmin } from "@/server/auth/access";
import { db } from "@/server/db";
import { userTags } from "@/server/db/schema";

export async function grantTag(
  targetUserId: string,
  tag: "admin" | "mod",
) {
  const user = await getAdminUser();
  if (!user || !isAdmin(user)) return { error: "Admin only" };

  await db
    .insert(userTags)
    .values({
      userId: targetUserId,
      tag,
      grantedBy: user.id,
    })
    .onConflictDoNothing();

  revalidatePath(`/users/${targetUserId}`);
  revalidatePath("/users");
  return { ok: true };
}

export async function revokeTag(targetUserId: string, tag: string) {
  const user = await getAdminUser();
  if (!user || !isAdmin(user)) return { error: "Admin only" };

  await db
    .delete(userTags)
    .where(
      and(eq(userTags.userId, targetUserId), sql`${userTags.tag} = ${tag}`),
    );

  revalidatePath(`/users/${targetUserId}`);
  revalidatePath("/users");
  return { ok: true };
}
