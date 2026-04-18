import type { Guild, Role } from 'discord.js';

export async function findRole(guild: Guild, name: string): Promise<Role | null> {
  await guild.roles.fetch();
  return (
    guild.roles.cache.find((r) => r.name.toLowerCase() === name.toLowerCase()) ?? null
  );
}

export async function findOrCreateRole(
  guild: Guild,
  name: string,
  reason?: string,
): Promise<Role> {
  const existing = await findRole(guild, name);
  if (existing) return existing;
  return guild.roles.create({ name, reason: reason ?? `Auto-created role "${name}"` });
}
