import { REST, Routes, PermissionFlagsBits } from 'discord.js';
import { config } from './config';

export const rest = new REST({ version: '10' }).setToken(config.discordToken);

/** Combine permission flags into a bitfield string for the REST API. */
export function permBits(...flags: bigint[]): string {
  return flags.reduce((acc, flag) => acc | flag, 0n).toString();
}

// ---- Roles ----

export interface APIRole {
  id: string;
  name: string;
  position: number;
  permissions: string;
}

export async function fetchRoles(guildId: string, signal?: AbortSignal): Promise<APIRole[]> {
  return rest.get(Routes.guildRoles(guildId), { signal }) as Promise<APIRole[]>;
}

export async function createRole(guildId: string, name: string, reason?: string, signal?: AbortSignal): Promise<APIRole> {
  return rest.post(Routes.guildRoles(guildId), {
    body: { name },
    reason: reason ?? `Auto-created role "${name}"`,
    signal,
  }) as Promise<APIRole>;
}

// ---- Channels ----

export interface APIChannel {
  id: string;
  name?: string;
  type: number;
}

export async function fetchChannels(guildId: string): Promise<APIChannel[]> {
  return rest.get(Routes.guildChannels(guildId)) as Promise<APIChannel[]>;
}

export async function createChannel(
  guildId: string,
  body: Record<string, unknown>,
  reason?: string,
): Promise<APIChannel> {
  return rest.post(Routes.guildChannels(guildId), { body, reason }) as Promise<APIChannel>;
}

// ---- Members ----

export interface APIMember {
  user?: { id: string; username: string };
  roles: string[];
}

export async function fetchMember(guildId: string, userId: string): Promise<APIMember> {
  return rest.get(Routes.guildMember(guildId, userId)) as Promise<APIMember>;
}

export async function addRole(
  guildId: string,
  userId: string,
  roleId: string,
  reason?: string,
): Promise<void> {
  await rest.put(Routes.guildMemberRole(guildId, userId, roleId), { reason });
}

export async function removeRole(
  guildId: string,
  userId: string,
  roleId: string,
  reason?: string,
): Promise<void> {
  await rest.delete(Routes.guildMemberRole(guildId, userId, roleId), { reason });
}

export async function addRoles(
  guildId: string,
  userId: string,
  roleIds: string[],
  reason?: string,
): Promise<void> {
  const member = await fetchMember(guildId, userId);
  const merged = [...new Set([...member.roles, ...roleIds])];
  await rest.patch(Routes.guildMember(guildId, userId), {
    body: { roles: merged },
    reason,
  });
}

export async function timeoutMember(
  guildId: string,
  userId: string,
  durationMs: number,
  reason?: string,
): Promise<void> {
  await rest.patch(Routes.guildMember(guildId, userId), {
    body: {
      communication_disabled_until: new Date(Date.now() + durationMs).toISOString(),
    },
    reason,
  });
}

export async function banMember(
  guildId: string,
  userId: string,
  reason?: string,
): Promise<void> {
  await rest.put(Routes.guildBan(guildId, userId), { body: {}, reason });
}

// ---- Messages ----

export async function sendMessage(
  channelId: string,
  body: Record<string, unknown>,
): Promise<{ id: string; channel_id: string }> {
  return rest.post(Routes.channelMessages(channelId), { body }) as Promise<{
    id: string;
    channel_id: string;
  }>;
}

export async function editMessage(
  channelId: string,
  messageId: string,
  body: Record<string, unknown>,
): Promise<void> {
  await rest.patch(Routes.channelMessage(channelId, messageId), { body });
}

// ---- Permissions ----

export async function editChannelPermissions(
  channelId: string,
  overwriteId: string,
  data: { allow?: string; deny?: string; type: 0 | 1 },
  reason?: string,
): Promise<void> {
  await rest.put(
    `/channels/${channelId}/permissions/${overwriteId}` as `/${string}`,
    { body: data, reason },
  );
}
