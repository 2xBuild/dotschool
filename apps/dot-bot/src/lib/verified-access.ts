import {
  ChannelType,
  Guild,
  GuildMember,
  Role,
} from 'discord.js';
import { findDotschoolUserByDiscordUsername, upsertVerifiedUser } from '../database/db';

export const VERIFIED_ROLE_NAME = 'verified';
const GENERAL_CHANNEL_NAME = 'general';

export function normalizeDiscordUsername(value: string): string {
  return value.trim().replace(/^@+/, '').toLowerCase();
}

export async function ensureVerifiedRole(guild: Guild): Promise<Role> {
  await guild.roles.fetch();

  const existing = guild.roles.cache.find(
    (role) => role.name.toLowerCase() === VERIFIED_ROLE_NAME,
  );
  if (existing) {
    return existing;
  }

  return guild.roles.create({
    name: VERIFIED_ROLE_NAME,
    reason: 'Required for verified dotschool members',
  });
}

export async function lockGeneralToVerified(guild: Guild, verifiedRole: Role): Promise<boolean> {
  await guild.channels.fetch();

  const generalChannel = guild.channels.cache.find(
    (channel) =>
      channel?.type === ChannelType.GuildText &&
      channel.name.toLowerCase() === GENERAL_CHANNEL_NAME,
  );

  if (!generalChannel || generalChannel.type !== ChannelType.GuildText) {
    return false;
  }

  await generalChannel.permissionOverwrites.edit(
    guild.roles.everyone,
    {
      SendMessages: false,
      CreatePublicThreads: false,
      SendMessagesInThreads: false,
    },
    { reason: 'Only verified members can talk in #general' },
  );

  await generalChannel.permissionOverwrites.edit(
    verifiedRole,
    {
      SendMessages: true,
      CreatePublicThreads: true,
      SendMessagesInThreads: true,
    },
    { reason: 'Allow verified members to talk in #general' },
  );

  return true;
}

export async function verifyMember(member: GuildMember): Promise<
  | {
      ok: true;
      matchedProfileUsername: string;
      roleAdded: boolean;
    }
  | {
      ok: false;
      reason: string;
    }
> {
  if (member.user.bot) {
    return { ok: false, reason: 'Bots are not eligible for verification.' };
  }

  const normalizedUsername = normalizeDiscordUsername(member.user.username);
  if (!normalizedUsername) {
    return { ok: false, reason: 'Discord username is empty.' };
  }

  const matchedUser = await findDotschoolUserByDiscordUsername(normalizedUsername);
  if (!matchedUser) {
    return {
      ok: false,
      reason: 'No dotschool profile matched this Discord username.',
    };
  }

  await upsertVerifiedUser(member.user.id, normalizedUsername, matchedUser.userId);

  const verifiedRole = await ensureVerifiedRole(member.guild);
  const alreadyVerified = member.roles.cache.has(verifiedRole.id);

  if (!alreadyVerified) {
    await member.roles.add(
      verifiedRole,
      `Verified against dotschool profile "${matchedUser.profileUsername}"`,
    );
  }

  return {
    ok: true,
    matchedProfileUsername: matchedUser.profileUsername,
    roleAdded: !alreadyVerified,
  };
}

export async function initializeVerifiedAccess(guild: Guild): Promise<{
  roleCreatedOrFound: Role;
  generalLocked: boolean;
}> {
  const roleCreatedOrFound = await ensureVerifiedRole(guild);
  const generalLocked = await lockGeneralToVerified(guild, roleCreatedOrFound);

  return { roleCreatedOrFound, generalLocked };
}
