import { fetchRoles, createRole, type APIRole } from '../discord';

const DISCORD_API_TIMEOUT_MS = 10_000;

async function withTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fn(controller.signal);
  } catch (err) {
    if (controller.signal.aborted) {
      throw new Error(`${label} timed out after ${ms}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function findRole(
  guildId: string,
  name: string,
): Promise<APIRole | null> {
  const roles = await withTimeout(
    (signal) => fetchRoles(guildId, signal),
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
    (signal) => createRole(guildId, name, reason, signal),
    DISCORD_API_TIMEOUT_MS,
    'createRole',
  );
}
