import { fetchRoles, createRole, type APIRole } from '../discord';

const DISCORD_API_TIMEOUT_MS = 10_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms),
    ),
  ]);
}

export async function findRole(
  guildId: string,
  name: string,
): Promise<APIRole | null> {
  const roles = await withTimeout(
    fetchRoles(guildId),
    DISCORD_API_TIMEOUT_MS,
    'fetchRoles',
  );
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
  return withTimeout(
    createRole(guildId, name, reason),
    DISCORD_API_TIMEOUT_MS,
    'createRole',
  );
}
