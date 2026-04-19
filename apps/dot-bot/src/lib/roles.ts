import { fetchRoles, createRole, type APIRole } from '../discord';

export async function findRole(
  guildId: string,
  name: string,
): Promise<APIRole | null> {
  const roles = await fetchRoles(guildId);
  return (
    roles.find((r) => r.name.toLowerCase() === name.toLowerCase()) ?? null
  );
}

export async function findOrCreateRole(
  guildId: string,
  name: string,
  reason?: string,
): Promise<APIRole> {
  const existing = await findRole(guildId, name);
  if (existing) return existing;
  return createRole(guildId, name, reason);
}
