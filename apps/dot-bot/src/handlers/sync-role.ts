import type { Client } from 'discord.js';
import { config } from '../config';
import { findRole, findOrCreateRole } from '../lib/roles';
import { addTag, removeTag } from '../database/db';

export interface SyncRoleBody {
  discordId: string;
  tag: string;
  action: 'add' | 'remove';
}

export async function handleSyncRole(client: Client, body: SyncRoleBody) {
  const guild = client.guilds.cache.get(config.guildId);
  if (!guild) return { error: 'Guild not found' };

  const { discordId, tag, action } = body;
  if (!discordId || !tag || !action) return { error: 'Missing discordId, tag, or action' };

  if (action === 'add') {
    await addTag(discordId, tag, 'system');
  } else {
    await removeTag(discordId, tag);
  }

  let member;
  try {
    member = await guild.members.fetch(discordId);
  } catch {
    return { ok: false, reason: `Member ${discordId} not found in guild` };
  }

  try {
    if (action === 'add') {
      const role = await findOrCreateRole(guild, tag);
      await member.roles.add(role, `Role "${tag}" assigned`);
    } else {
      const role = await findRole(guild, tag);
      if (!role) return { ok: false, reason: `Role "${tag}" not found` };
      await member.roles.remove(role, `Role "${tag}" revoked`);
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: `Failed to ${action} role: ${err}` };
  }
}
