import "server-only";

type RedisConfig = {
  url: string;
  token: string;
};

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7;

function getRedisConfig(): RedisConfig | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return { url, token };
}

function requireRedisConfig(): RedisConfig {
  const config = getRedisConfig();
  if (!config) {
    throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required");
  }
  return config;
}

async function redisCall(command: string, ...args: string[]): Promise<unknown> {
  const config = requireRedisConfig();
  const encodedArgs = args.map((arg) => encodeURIComponent(arg));
  const endpoint = `${config.url.replace(/\/$/, "")}/${command}/${encodedArgs.join("/")}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Redis command failed: ${command} (${response.status})`);
  }

  const payload = (await response.json()) as { result?: unknown; error?: string };
  if (payload.error) {
    throw new Error(`Redis error: ${payload.error}`);
  }

  return payload.result ?? null;
}

export async function redisGet(key: string): Promise<string | null> {
  const result = await redisCall("get", key);
  return typeof result === "string" ? result : null;
}

export async function redisSet(
  key: string,
  value: string,
  ttlSeconds = DEFAULT_TTL_SECONDS,
) {
  await redisCall("set", key, value);
  await redisCall("expire", key, String(ttlSeconds));
}

async function redisDel(...keys: string[]) {
  for (const key of keys) {
    await redisCall("del", key);
  }
}

export async function redisSadd(
  key: string,
  member: string,
  ttlSeconds = DEFAULT_TTL_SECONDS,
) {
  await redisCall("sadd", key, member);
  await redisCall("expire", key, String(ttlSeconds));
}

export async function redisSismember(key: string, member: string): Promise<boolean> {
  const result = await redisCall("sismember", key, member);
  return result === 1;
}

async function redisRpush(
  key: string,
  value: string,
  ttlSeconds = DEFAULT_TTL_SECONDS,
) {
  await redisCall("rpush", key, value);
  await redisCall("expire", key, String(ttlSeconds));
}

export async function redisLrange(key: string, start = 0, stop = -1): Promise<string[]> {
  const result = await redisCall("lrange", key, String(start), String(stop));
  return Array.isArray(result)
    ? result.filter((v): v is string => typeof v === "string")
    : [];
}

export async function initializeRedisSession(
  metaKey: string,
  answersKey: string,
  answeredKey: string,
  metaPayload: string,
  ttlSeconds = DEFAULT_TTL_SECONDS,
) {
  await redisSet(metaKey, metaPayload, ttlSeconds);
  await redisDel(answersKey, answeredKey);
  await redisCall("expire", answersKey, String(ttlSeconds));
  await redisCall("expire", answeredKey, String(ttlSeconds));
}

export async function appendRedisAnswer(
  answersKey: string,
  answerPayload: string,
  ttlSeconds = DEFAULT_TTL_SECONDS,
) {
  await redisRpush(answersKey, answerPayload, ttlSeconds);
}
