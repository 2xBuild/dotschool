import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { config } from '../config';
import { createChannel, addRoles, permBits } from '../discord';
import { findRole, findOrCreateRole } from '../lib/roles';
import { addTag } from '../database/db';

const STAFF_ROLE_NAMES = ['admin', 'mod', 'owner', 'volunteer'] as const;

export interface StartBatchBody {
  batchLabel: string;
  tag: string;
  batchNumber: number;
  members: { discordId: string }[];
}

export async function handleStartBatch(body: StartBatchBody) {
  const guildId = config.guildId;
  const everyoneRoleId = guildId; // @everyone role ID === guild ID

  const { batchLabel, tag, batchNumber, members } = body;
  if (!batchLabel || !tag) return { error: 'Missing batchLabel or tag' };

  const categoryName =
    `Batch ${batchNumber} — ${batchLabel}`.trim().slice(0, 100) || 'Batch';

  const batchMemberRole = await findOrCreateRole(
    guildId,
    `Batch ${batchNumber}`,
  );
  const batchVolunteerRole = await findOrCreateRole(
    guildId,
    `Batch ${batchNumber} Volunteer`,
  );

  const staffRoles = (
    await Promise.all(
      STAFF_ROLE_NAMES.map((name) => findRole(guildId, name)),
    )
  ).filter((r): r is NonNullable<typeof r> => r !== null);

  const allAccessRoleIds = deduplicateIds([
    batchMemberRole.id,
    batchVolunteerRole.id,
    ...staffRoles.map((r) => r.id),
  ]);
  const volunteerAccessRoleIds = deduplicateIds([
    batchVolunteerRole.id,
    ...staffRoles.map((r) => r.id),
  ]);

  const category = await createChannel(
    guildId,
    {
      name: categoryName,
      type: ChannelType.GuildCategory,
      permission_overwrites: privateOverwrites(
        everyoneRoleId,
        allAccessRoleIds,
      ),
    },
    `Batch started: ${categoryName}`,
  );

  const defaultOverwrites = privateOverwrites(everyoneRoleId, allAccessRoleIds);

  const channelDefs: {
    name: string;
    type: ChannelType.GuildText | ChannelType.GuildVoice;
    overwrites?: ReturnType<typeof privateOverwrites>;
  }[] = [
    {
      name: 'volunteers',
      type: ChannelType.GuildText,
      overwrites: privateOverwrites(everyoneRoleId, volunteerAccessRoleIds),
    },
    { name: 'announcement', type: ChannelType.GuildText },
    { name: 'main', type: ChannelType.GuildText },
    { name: 'voice', type: ChannelType.GuildVoice },
    { name: 'voice-2', type: ChannelType.GuildVoice },
    { name: 'off-topic', type: ChannelType.GuildText },
    { name: 'concerns', type: ChannelType.GuildText },
    {
      name: 'qna',
      type: ChannelType.GuildText,
      overwrites: qnaOverwrites(everyoneRoleId, allAccessRoleIds),
    },
  ];

  const createdChannels: string[] = [];
  for (const ch of channelDefs) {
    const created = await createChannel(
      guildId,
      {
        name: ch.name,
        type: ch.type,
        parent_id: category.id,
        permission_overwrites: ch.overwrites ?? defaultOverwrites,
      },
      `Batch channel for ${categoryName}`,
    );
    createdChannels.push(created.name ?? ch.name);
  }

  const legacyRole = await findOrCreateRole(guildId, tag);
  const roleResults: { discordId: string; ok: boolean; reason?: string }[] = [];

  for (const m of members) {
    await addTag(m.discordId, tag, 'system');
    try {
      await addRoles(
        guildId,
        m.discordId,
        [legacyRole.id, batchMemberRole.id],
        `Batch start: auto-assigned "${tag}" + "Batch ${batchNumber}"`,
      );
      roleResults.push({ discordId: m.discordId, ok: true });
    } catch (err) {
      roleResults.push({
        discordId: m.discordId,
        ok: false,
        reason: String(err),
      });
    }
  }

  return {
    ok: true,
    category: category.name ?? categoryName,
    channels: createdChannels,
    roleAssignments: roleResults,
  };
}

function deduplicateIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

function privateOverwrites(everyoneRoleId: string, roleIds: string[]) {
  return [
    {
      id: everyoneRoleId,
      type: 0,
      deny: String(PermissionFlagsBits.ViewChannel),
    },
    ...roleIds.map((id) => ({
      id,
      type: 0,
      allow: String(PermissionFlagsBits.ViewChannel),
    })),
  ];
}

function qnaOverwrites(everyoneRoleId: string, roleIds: string[]) {
  return [
    {
      id: everyoneRoleId,
      type: 0,
      deny: String(PermissionFlagsBits.ViewChannel),
    },
    ...roleIds.map((id) => ({
      id,
      type: 0,
      allow: permBits(
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.CreatePublicThreads,
        PermissionFlagsBits.SendMessagesInThreads,
        PermissionFlagsBits.ReadMessageHistory,
      ),
      deny: String(PermissionFlagsBits.SendMessages),
    })),
  ];
}
