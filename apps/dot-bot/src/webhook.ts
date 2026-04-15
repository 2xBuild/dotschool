import http from 'http';
import {
  Client,
  ChannelType,
  PermissionFlagsBits,
  type Guild,
  type Role,
  type GuildMember,
} from 'discord.js';
import { addTag, removeTag } from './database/db';

const WEBHOOK_PORT = Number(process.env.WEBHOOK_PORT) || 3100;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';
const STAFF_CHANNEL_ROLE_NAMES = ['admin', 'mod', 'owner', 'volunteer'] as const;

function getGuild(client: Client): Guild | null {
  const guildId = process.env.GUILD_ID;
  if (!guildId) return null;
  return client.guilds.cache.get(guildId) ?? null;
}

async function findOrCreateRole(guild: Guild, name: string): Promise<Role> {
  await guild.roles.fetch();

  const existing = guild.roles.cache.find(
    (r) => r.name.toLowerCase() === name.toLowerCase(),
  );
  if (existing) return existing;
  return guild.roles.create({ name, reason: `Auto-created for batch tag "${name}"` });
}

async function findRoleByName(guild: Guild, name: string): Promise<Role | null> {
  await guild.roles.fetch();

  return (
    guild.roles.cache.find((role) => role.name.toLowerCase() === name.toLowerCase()) ?? null
  );
}

function normalizeCategoryName(value: string): string {
  return value.trim().slice(0, 100) || 'Batch';
}

function deduplicateRoles(roles: (Role | null)[]): Role[] {
  const seen = new Set<string>();
  return roles.filter((role): role is Role => {
    if (!role || seen.has(role.id)) return false;
    seen.add(role.id);
    return true;
  });
}

function buildPrivateChannelOverwrites(guild: Guild, roles: Role[]) {
  return [
    {
      id: guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    ...roles.map((role) => ({
      id: role.id,
      allow: [PermissionFlagsBits.ViewChannel],
    })),
  ];
}

function buildVolunteerOnlyOverwrites(guild: Guild, staffRoles: Role[]) {
  return [
    {
      id: guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    ...staffRoles.map((role) => ({
      id: role.id,
      allow: [PermissionFlagsBits.ViewChannel],
    })),
  ];
}

async function assignRoleToMember(
  guild: Guild,
  discordId: string,
  roleName: string,
): Promise<{ ok: boolean; reason?: string }> {
  let member: GuildMember;
  try {
    member = await guild.members.fetch(discordId);
  } catch {
    return { ok: false, reason: `Member ${discordId} not found in guild` };
  }

  const role = await findOrCreateRole(guild, roleName);
  try {
    await member.roles.add(role, `Batch start: auto-assigned "${roleName}"`);
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: `Failed to assign role: ${err}` };
  }
}

async function removeRoleFromMember(
  guild: Guild,
  discordId: string,
  roleName: string,
): Promise<{ ok: boolean; reason?: string }> {
  let member: GuildMember;
  try {
    member = await guild.members.fetch(discordId);
  } catch {
    return { ok: false, reason: `Member ${discordId} not found in guild` };
  }

  const role = guild.roles.cache.find(
    (r) => r.name.toLowerCase() === roleName.toLowerCase(),
  );
  if (!role) return { ok: false, reason: `Role "${roleName}" not found` };

  try {
    await member.roles.remove(role, `Role "${roleName}" revoked`);
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: `Failed to remove role: ${err}` };
  }
}

// POST /start-batch — body: { batchLabel, tag, batchNumber, members: [{ discordId }] }
interface StartBatchBody {
  batchLabel: string;
  tag: string;
  batchNumber: number;
  members: { discordId: string }[];
}

async function handleStartBatch(client: Client, body: StartBatchBody) {
  const guild = getGuild(client);
  if (!guild) return { error: 'Guild not found' };

  const { batchLabel, tag, batchNumber, members } = body;
  if (!batchLabel || !tag) return { error: 'Missing batchLabel or tag' };
  const categoryName = normalizeCategoryName(`Batch ${batchNumber} — ${batchLabel}`);

  // Create proper named roles
  const batchMemberRole = await findOrCreateRole(guild, `Batch ${batchNumber}`);
  const batchVolunteerRole = await findOrCreateRole(guild, `Batch ${batchNumber} Volunteer`);

  // Resolve global staff roles
  const globalStaffRoles = (
    await Promise.all(STAFF_CHANNEL_ROLE_NAMES.map((name) => findRoleByName(guild, name)))
  ).filter((r): r is Role => r !== null);

  // All roles that can see batch channels (members + volunteers + staff)
  const allAccessRoles = deduplicateRoles([batchMemberRole, batchVolunteerRole, ...globalStaffRoles]);
  const batchOverwrites = buildPrivateChannelOverwrites(guild, allAccessRoles);

  // Only volunteers + staff can see the volunteers channel
  const volunteerAccessRoles = deduplicateRoles([batchVolunteerRole, ...globalStaffRoles]);
  const volunteerOverwrites = buildVolunteerOnlyOverwrites(guild, volunteerAccessRoles);

  // QNA: everyone who can view can only create/use threads, not send top-level messages
  const qnaOverwrites = [
    {
      id: guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    ...allAccessRoles.map((role) => ({
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

  const category = await guild.channels.create({
    name: categoryName,
    type: ChannelType.GuildCategory,
    permissionOverwrites: batchOverwrites,
    reason: `Batch started: ${categoryName}`,
  });

  type ChannelDef = {
    name: string;
    type: ChannelType.GuildText | ChannelType.GuildVoice;
    overwrites?: typeof batchOverwrites | typeof qnaOverwrites;
  };

  const channelDefs: ChannelDef[] = [
    { name: 'volunteers', type: ChannelType.GuildText, overwrites: volunteerOverwrites },
    { name: 'announcement', type: ChannelType.GuildText },
    { name: 'main', type: ChannelType.GuildText },
    { name: 'voice', type: ChannelType.GuildVoice },
    { name: 'voice-2', type: ChannelType.GuildVoice },
    { name: 'off-topic', type: ChannelType.GuildText },
    { name: 'concerns', type: ChannelType.GuildText },
    { name: 'qna', type: ChannelType.GuildText, overwrites: qnaOverwrites },
  ];

  const createdChannels: string[] = [];
  for (const ch of channelDefs) {
    const created = await guild.channels.create({
      name: ch.name,
      type: ch.type,
      parent: category.id,
      permissionOverwrites: ch.overwrites ?? batchOverwrites,
      reason: `Batch channel for ${categoryName}`,
    });
    createdChannels.push(created.name);
  }

  // Assign both the legacy tag role and the new Batch N role to members
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

// POST /sync-role — body: { discordId, tag, action: "add" | "remove" }
interface SyncRoleBody {
  discordId: string;
  tag: string;
  action: 'add' | 'remove';
}

async function handleSyncRole(client: Client, body: SyncRoleBody) {
  const guild = getGuild(client);
  if (!guild) return { error: 'Guild not found' };

  const { discordId, tag, action } = body;
  if (!discordId || !tag || !action) return { error: 'Missing discordId, tag, or action' };

  if (action === 'add') {
    await addTag(discordId, tag, 'system');
  } else {
    await removeTag(discordId, tag);
  }

  if (action === 'add') {
    return assignRoleToMember(guild, discordId, tag);
  } else {
    return removeRoleFromMember(guild, discordId, tag);
  }
}

// GET /redirect — OAuth2 redirect URI landing page
function handleRedirect(req: http.IncomingMessage, res: http.ServerResponse) {
  const reqUrl = new URL(req.url ?? '/', `http://${req.headers.host}`);
  const guildId = reqUrl.searchParams.get('guild_id') ?? '';
  const guildName = reqUrl.searchParams.get('guild_name') ?? 'your server';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>dot.school Bot — Added</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f0f10; color: #e4e4e7; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { max-width: 440px; width: 100%; padding: 2.5rem; border-radius: 1rem; background: #18181b; border: 1px solid #27272a; text-align: center; }
    .icon { width: 64px; height: 64px; margin: 0 auto 1.25rem; background: #22c55e20; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .icon svg { width: 32px; height: 32px; color: #22c55e; }
    h1 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; }
    p { font-size: 0.9rem; color: #a1a1aa; line-height: 1.5; margin-bottom: 1.25rem; }
    .guild { display: inline-block; padding: 0.25rem 0.75rem; background: #27272a; border-radius: 9999px; font-size: 0.8rem; color: #d4d4d8; margin-bottom: 1.25rem; }
    .steps { text-align: left; margin: 1rem 0; }
    .steps li { font-size: 0.85rem; color: #a1a1aa; line-height: 1.8; }
    .steps li strong { color: #e4e4e7; }
    a { color: #3b82f6; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    </div>
    <h1>Bot added successfully</h1>
    ${guildId ? `<div class="guild">${guildName}</div>` : ''}
    <p>The dot.school bot is now in your server. Here's what to do next:</p>
    <ol class="steps">
      <li>Make sure the bot role is <strong>above</strong> other roles it needs to manage</li>
      <li>Run <strong>/verify</strong> to register yourself</li>
      <li>Use <strong>/tag</strong>, <strong>/concern</strong>, and <strong>/announce</strong> to get started</li>
    </ol>
    <p>You can close this page now.</p>
  </div>
</body>
</html>`;

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

function json(res: http.ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

export function startWebhookServer(client: Client): void {
  const server = http.createServer(async (req, res) => {
    const url = req.url?.split('?')[0] ?? '';

    // /redirect is the OAuth2 landing page and does not require auth
    if (req.method === 'GET' && url === '/redirect') {
      handleRedirect(req, res);
      return;
    }

    if (WEBHOOK_SECRET) {
      const auth = req.headers.authorization;
      if (auth !== `Bearer ${WEBHOOK_SECRET}`) {
        json(res, 401, { error: 'Unauthorized' });
        return;
      }
    }

    if (req.method !== 'POST') {
      json(res, 405, { error: 'Method not allowed' });
      return;
    }

    let body: any;
    try {
      const raw = await readBody(req);
      body = JSON.parse(raw);
    } catch {
      json(res, 400, { error: 'Invalid JSON' });
      return;
    }

    try {
      if (url === '/start-batch') {
        const result = await handleStartBatch(client, body);
        json(res, result.error ? 400 : 200, result);
      } else if (url === '/sync-role') {
        const result = await handleSyncRole(client, body);
        json(res, 'error' in result ? 400 : 200, result);
      } else {
        json(res, 404, { error: 'Not found' });
      }
    } catch (err) {
      console.error('[Webhook] Handler error:', err);
      json(res, 500, { error: String(err) });
    }
  });

  server.listen(WEBHOOK_PORT, () => {
    console.log(`[Webhook] HTTP server listening on port ${WEBHOOK_PORT}`);
  });
}
