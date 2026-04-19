import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and, sql } from 'drizzle-orm';
import postgres from 'postgres';
import {
  botMembers,
  botMemberTags,
  botConcerns,
  botConcernVotes,
  botAnnouncements,
  userProfiles,
} from '@repo/db/schema';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('[DB] Missing DATABASE_URL in environment.');
  process.exit(1);
}

const isLocal =
  DATABASE_URL.includes('localhost') || DATABASE_URL.includes('127.0.0.1');

const client = postgres(DATABASE_URL, {
  ssl: isLocal ? false : 'require',
  connect_timeout: 10,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

export const db = drizzle(client, {
  schema: { botMembers, botMemberTags, botConcerns, botConcernVotes, botAnnouncements },
});

export async function testConnection(): Promise<void> {
  await db.execute(sql`SELECT 1`);
}

export async function registerUser(discordId: string, username: string) {
  const existing = await db.query.botMembers.findFirst({
    where: eq(botMembers.discordId, discordId),
  });
  if (existing) return existing;

  const [row] = await db
    .insert(botMembers)
    .values({ discordId, username })
    .onConflictDoNothing()
    .returning();

  return row ?? existing;
}

export async function getUser(discordId: string) {
  return db.query.botMembers.findFirst({
    where: eq(botMembers.discordId, discordId),
  });
}

export async function findDotschoolUserByDiscordUsername(discordUsername: string) {
  const normalizedUsername = discordUsername.trim().replace(/^@+/, '').toLowerCase();
  if (!normalizedUsername) {
    return null;
  }

  const normalizedDiscordUsername = sql<string>`
    lower(coalesce(${userProfiles.socials} -> 'discord' ->> 'username', ''))
  `;

  const [row] = await db
    .select({
      userId: userProfiles.userId,
      profileUsername: userProfiles.username,
      name: userProfiles.name,
    })
    .from(userProfiles)
    .where(eq(normalizedDiscordUsername, normalizedUsername))
    .limit(1);

  return row ?? null;
}

export async function upsertVerifiedUser(
  discordId: string,
  username: string,
  userId: string,
) {
  const normalizedUsername = username.trim().replace(/^@+/, '').toLowerCase();

  const [row] = await db
    .insert(botMembers)
    .values({ discordId, username: normalizedUsername, userId })
    .onConflictDoUpdate({
      target: botMembers.discordId,
      set: {
        username: normalizedUsername,
        userId,
      },
    })
    .returning();

  return row!;
}

export async function addTag(
  discordId: string,
  tag: string,
  assignedBy: string,
): Promise<boolean> {
  try {
    await db
      .insert(botMemberTags)
      .values({ discordId, tag, assignedBy })
      .onConflictDoNothing();
    const exists = await db.query.botMemberTags.findFirst({
      where: and(eq(botMemberTags.discordId, discordId), eq(botMemberTags.tag, tag)),
    });
    return !!exists;
  } catch (err) {
    console.error('[DB] addTag failed:', err);
    return false;
  }
}

export async function removeTag(discordId: string, tag: string): Promise<boolean> {
  const result = await db
    .delete(botMemberTags)
    .where(and(eq(botMemberTags.discordId, discordId), eq(botMemberTags.tag, tag)));
  return (result as unknown as { rowCount: number }).rowCount > 0;
}

export async function getTagsForUser(discordId: string) {
  return db
    .select({ tag: botMemberTags.tag, assignedBy: botMemberTags.assignedBy })
    .from(botMemberTags)
    .where(eq(botMemberTags.discordId, discordId));
}

export async function createConcern(
  reporterId: string,
  targetId: string,
  reason: string,
  reporterAnonymous = false,
  requestedAction: 'mute' | 'block' = 'mute',
) {
  const [row] = await db
    .insert(botConcerns)
    .values({ reporterId, targetId, reason, reporterAnonymous, requestedAction })
    .returning();
  return row!;
}

export async function setConcernDiscordPost(
  concernId: string,
  channelId: string,
  messageId: string,
): Promise<void> {
  await db
    .update(botConcerns)
    .set({ channelId, messageId })
    .where(eq(botConcerns.id, concernId));
}

export async function getConcern(concernId: string) {
  return db.query.botConcerns.findFirst({
    where: eq(botConcerns.id, concernId),
  });
}

export async function getOpenConcerns() {
  return db
    .select()
    .from(botConcerns)
    .where(eq(botConcerns.status, 'open'))
    .orderBy(botConcerns.createdAt);
}

export async function updateConcernStatus(
  concernId: string,
  status: 'open' | 'resolved' | 'actioned' | 'dismissed',
  actionTaken?: string | null,
) {
  await db
    .update(botConcerns)
    .set({
      status,
      resolvedAt: status !== 'open' ? new Date() : null,
      ...(actionTaken !== undefined ? { actionTaken } : {}),
    })
    .where(eq(botConcerns.id, concernId));
}

/**
 * Records a vote. Returns { upvotes, downvotes } or null if the voter already voted.
 */
export async function castVote(
  concernId: string,
  voterId: string,
  voteType: 'upvote' | 'downvote',
): Promise<{ upvotes: number; downvotes: number } | null> {
  const existing = await db.query.botConcernVotes.findFirst({
    where: and(
      eq(botConcernVotes.concernId, concernId),
      eq(botConcernVotes.voterId, voterId),
    ),
  });
  if (existing) return null;

  try {
    await db.insert(botConcernVotes).values({ concernId, voterId, voteType });
  } catch (err) {
    console.error('[DB] castVote insert failed:', err);
    return null;
  }

  await db
    .update(botConcerns)
    .set(
      voteType === 'upvote'
        ? { upvoteCount: sql`${botConcerns.upvoteCount} + 1` }
        : { downvoteCount: sql`${botConcerns.downvoteCount} + 1` },
    )
    .where(eq(botConcerns.id, concernId));

  const concern = await db.query.botConcerns.findFirst({
    where: eq(botConcerns.id, concernId),
    columns: { upvoteCount: true, downvoteCount: true },
  });

  return concern
    ? { upvotes: concern.upvoteCount, downvotes: concern.downvoteCount }
    : null;
}

/** Returns the total number of registered bot members. */
export async function getTotalMemberCount(): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(botMembers);
  return Number(result[0]?.count ?? 0);
}

export async function hasVoted(
  concernId: string,
  voterId: string,
): Promise<boolean> {
  const row = await db.query.botConcernVotes.findFirst({
    where: and(
      eq(botConcernVotes.concernId, concernId),
      eq(botConcernVotes.voterId, voterId),
    ),
  });
  return !!row;
}

export async function saveAnnouncement(
  authorId: string,
  content: string,
  channelId: string,
) {
  const [row] = await db
    .insert(botAnnouncements)
    .values({ authorId, content, channelId })
    .returning();
  return row!;
}

export default db;
