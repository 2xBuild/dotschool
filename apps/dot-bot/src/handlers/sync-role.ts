import { config } from '../config';
import {
  fetchMember,
  addRole as addDiscordRole,
  removeRole as removeDiscordRole,
} from '../discord';
import { findRole, findOrCreateRole } from '../lib/roles';
import { addTag, removeTag } from '../database/db';

export interface SyncRoleBody {
  discordId: string;
  tag: string;
  action: 'add' | 'remove';
}

export async function handleSyncRole(body: SyncRoleBody) {
  const guildId = config.guildId;
  const { discordId, tag, action } = body;
  if (!discordId || !tag || !action)
    return { error: 'Missing discordId, tag, or action' };

  if (action === 'add') {
    await addTag(discordId, tag, 'system');
  } else {
    await removeTag(discordId, tag);
  }

  try {
    await fetchMember(guildId, discordId);
  } catch {
    return { ok: false, reason: `Member ${discordId} not found in guild` };
  }

  try {
    if (action === 'add') {
      const role = await findOrCreateRole(guildId, tag);
      await addDiscordRole(guildId, discordId, role.id, `Role "${tag}" assigned`);
    } else {
      const role = await findRole(guildId, tag);
      if (!role) return { ok: false, reason: `Role "${tag}" not found` };
      await removeDiscordRole(
        guildId,
        discordId,
        role.id,
        `Role "${tag}" revoked`,
      );
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: `Failed to ${action} role: ${err}` };
  }
}
