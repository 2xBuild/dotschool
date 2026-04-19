import { ChannelType, PermissionFlagsBits } from 'discord.js';
import {
  findDotschoolUserByDiscordUsername,
  upsertVerifiedUser,
} from '../database/db';
import { findOrCreateRole } from './roles';
import {
  fetchChannels,
  editChannelPermissions,
  addRole,
  permBits,
  type APIRole,
} from '../discord';

export const VERIFIED_ROLE_NAME = 'verified';
const GENERAL_CHANNEL_NAME = 'general';

export function normalizeDiscordUsername(value: string): string {
  return value.trim().replace(/^@+/, '').toLowerCase();
}

export async function ensureVerifiedRole(guildId: string): Promise<APIRole> {
  return findOrCreateRole(
    guildId,
    VERIFIED_ROLE_NAME,
    'Required for verified dotschool members',
  );
}

export async function lockGeneralToVerified(
  guildId: string,
  verifiedRoleId: string,
): Promise<boolean> {
  const channels = await fetchChannels(guildId);
  const general = channels.find(
    (ch) =>
      ch.type === ChannelType.GuildText &&
      ch.name?.toLowerCase() === GENERAL_CHANNEL_NAME,
  );
  if (!general) return false;

  const denyBits = permBits(
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.CreatePublicThreads,
    PermissionFlagsBits.SendMessagesInThreads,
  );

  const allowBits = permBits(
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.CreatePublicThreads,
    PermissionFlagsBits.SendMessagesInThreads,
  );

  // @everyone role ID equals the guild ID
  await editChannelPermissions(
    general.id,
    guildId,
    { deny: denyBits, type: 0 },
    'Only verified members can talk in #general',
  );

  await editChannelPermissions(
    general.id,
    verifiedRoleId,
    { allow: allowBits, type: 0 },
    'Allow verified members to talk in #general',
  );

  return true;
}

export async function verifyMember(
  guildId: string,
  userId: string,
  username: string,
  memberRoleIds: string[],
): Promise<
  | { ok: true; matchedProfileUsername: string; roleAdded: boolean }
  | { ok: false; reason: string }
> {
  const normalizedUsername = normalizeDiscordUsername(username);
  if (!normalizedUsername) {
    return { ok: false, reason: 'Discord username is empty.' };
  }

  const matchedUser =
    await findDotschoolUserByDiscordUsername(normalizedUsername);
  if (!matchedUser) {
    return {
      ok: false,
      reason: 'No dotschool profile matched this Discord username.',
    };
  }

  await upsertVerifiedUser(userId, normalizedUsername, matchedUser.userId);

  const verifiedRole = await ensureVerifiedRole(guildId);
  const alreadyVerified = memberRoleIds.includes(verifiedRole.id);

  if (!alreadyVerified) {
    await addRole(
      guildId,
      userId,
      verifiedRole.id,
      `Verified against dotschool profile "${matchedUser.profileUsername}"`,
    );
  }

  return {
    ok: true,
    matchedProfileUsername: matchedUser.profileUsername,
    roleAdded: !alreadyVerified,
  };
}

export async function initializeVerifiedAccess(guildId: string): Promise<{
  roleCreatedOrFound: APIRole;
  generalLocked: boolean;
}> {
  const roleCreatedOrFound = await ensureVerifiedRole(guildId);
  const generalLocked = await lockGeneralToVerified(
    guildId,
    roleCreatedOrFound.id,
  );
  return { roleCreatedOrFound, generalLocked };
}
