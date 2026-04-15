import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export function createDb<T extends Record<string, unknown>>(
  schema: T,
  globalKey: string,
) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  const g = globalThis as typeof globalThis & Record<string, ReturnType<typeof postgres> | undefined>;

  const client = g[globalKey] ?? postgres(url);

  if (process.env.NODE_ENV !== "production") {
    g[globalKey] = client;
  }

  return drizzle(client, { schema });
}
