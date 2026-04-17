import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Discord from "next-auth/providers/discord";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

export const providers = [Google, GitHub, Discord];

/**
 * Creates a base NextAuth config with shared defaults (providers, adapter,
 * database session strategy, and common callbacks). Spread the result and
 * override/extend as needed per-app.
 */
export function createBaseAuthConfig(
  db: Parameters<typeof DrizzleAdapter>[0],
  tables: NonNullable<Parameters<typeof DrizzleAdapter>[1]>,
): NextAuthConfig {
  return {
    trustHost: true,
    adapter: DrizzleAdapter(db, tables),
    providers,
    session: { strategy: "database" },
    callbacks: {
      signIn({ user }) {
        return Boolean(user.email?.trim());
      },
      redirect({ url, baseUrl }) {
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        try {
          if (new URL(url).origin === baseUrl) return url;
        } catch {
          return `${baseUrl}/`;
        }
        return `${baseUrl}/`;
      },
    },
  };
}
