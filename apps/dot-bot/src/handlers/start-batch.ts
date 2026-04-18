import {
  ChannelType,
  PermissionFlagsBits,
  type Client,
  type Guild,
  type Role,
} from 'discord.js';
import { config } from '../config';
import { findRole, findOrCreateRole } from '../lib/roles';
import { addTag } from '../database/db';

const STAFF_ROLE_NAMES = ['admin', 'mod', 'owner', 'volunteer'] as const;

export interface StartBatchBody {
  batchLabel: string;
  tag: string;
  batchNumber: number;
  members: { discordId: string }[];
}

export async function handleStartBatch(client: Client, body: StartBatchBody) {
  const guild = client.guilds.cache.get(config.guildId);
  if (!guild) return { error: 'Guild not found' };

  const { batchLabel, tag, batchNumber, members } = body;
  if (!batchLabel || !tag) return { error: 'Missing batchLabel or tag' };

  const categoryName = `Batch ${batchNumber} — ${batchLabel}`.trim().slice(0, 100) || 'Batch';

  const batchMemberRole = await findOrCreateRole(guild, `Batch ${batchNumber}`);
  const batchVolunteerRole = await findOrCreateRole(guild, `Batch ${batchNumber} Volunteer`);

  const staffRoles = (
    await Promise.all(STAFF_ROLE_NAMES.map((name) => findRole(guild, name)))
  ).filter((r): r is Role => r !== null);

  const allAccessRoles = deduplicateRoles([batchMemberRole, batchVolunteerRole, ...staffRoles]);
  const volunteerAccessRoles = deduplicateRoles([batchVolunteerRole, ...staffRoles]);

  const category = await guild.channels.create({
    name: categoryName,
    type: ChannelType.GuildCategory,
    permissionOverwrites: privateOverwrites(guild, allAccessRoles),
    reason: `Batch started: ${categoryName}`,
  });

  const defaultOverwrites = privateOverwrites(guild, allAccessRoles);

  const channelDefs: {
    name: string;
    type: ChannelType.GuildText | ChannelType.GuildVoice;
    overwrites?: ReturnType<typeof privateOverwrites>;
  }[] = [
    { name: 'volunteers', type: ChannelType.GuildText, overwrites: privateOverwrites(guild, volunteerAccessRoles) },
    { name: 'announcement', type: ChannelType.GuildText },
    { name: 'main', type: ChannelType.GuildText },
    { name: 'voice', type: ChannelType.GuildVoice },
    { name: 'voice-2', type: ChannelType.GuildVoice },
    { name: 'off-topic', type: ChannelType.GuildText },
    { name: 'concerns', type: ChannelType.GuildText },
    { name: 'qna', type: ChannelType.GuildText, overwrites: qnaOverwrites(guild, allAccessRoles) },
  ];

  const createdChannels: string[] = [];
  for (const ch of channelDefs) {
    const created = await guild.channels.create({
      name: ch.name,
      type: ch.type,
      parent: category.id,
      permissionOverwrites: ch.overwrites ?? defaultOverwrites,
      reason: `Batch channel for ${categoryName}`,
    });
    createdChannels.push(created.name);
  }

  const legacyRole = await findOrCreateRole(guild, tag);
  const roleResults: { discordId: string; ok: boolean; reason?: string }[] = [];

  for (const m of members) {
    await addTag(m.discordId, tag, 'system');
    try {
      const member = await guild.members.fetch(m.discordId);
      await member.roles.add(
        [legacyRole, batchMemberRole],
        `Batch start: auto-assigned "${tag}" + "Batch ${batchNumber}"`,
      );
      roleResults.push({ discordId: m.discordId, ok: true });
    } catch (err) {
      roleResults.push({ discordId: m.discordId, ok: false, reason: String(err) });
    }
  }

  return {
    ok: true,
    category: category.name,
    channels: createdChannels,
    roleAssignments: roleResults,
  };
}

function deduplicateRoles(roles: (Role | null)[]): Role[] {
  const seen = new Set<string>();
  return roles.filter((role): role is Role => {
    if (!role || seen.has(role.id)) return false;
    seen.add(role.id);
    return true;
  });
}

function privateOverwrites(guild: Guild, roles: Role[]) {
  return [
    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    ...roles.map((role) => ({
      id: role.id,
      allow: [PermissionFlagsBits.ViewChannel],
    })),
  ];
}

function qnaOverwrites(guild: Guild, roles: Role[]) {
  return [
    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    ...roles.map((role) => ({
      id: role.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.CreatePublicThreads,
        PermissionFlagsBits.SendMessagesInThreads,
        PermissionFlagsBits.ReadMessageHistory,
      ],
      deny: [PermissionFlagsBits.SendMessages],
    })),
  ];
}
