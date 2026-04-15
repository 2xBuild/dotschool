import NextAuth from "next-auth";
import { createBaseAuthConfig } from "@repo/auth";

import { db } from "@/server/db";
import {
  accounts,
  sessions,
  userProfiles,
  users,
  verificationTokens,
} from "@/server/db/schema";
import { buildDefaultUsername } from "@/server/profile/username";

const baseConfig = createBaseAuthConfig(db, {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...baseConfig,
  callbacks: {
    ...baseConfig.callbacks,
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      try {
        if (new URL(url).origin === baseUrl) {
          return url;
        }
      } catch {
        return `${baseUrl}/`;
      }
      return `${baseUrl}/`;
    },
  },
  events: {
    async signIn({ user, account }) {
      const userId = user.id?.trim();
      const email = user.email?.trim().toLowerCase();

      if (!userId || !email) {
        return;
      }

      const now = new Date();
      const name = user.name?.trim() || null;
      const image = user.image ?? null;
      const provider = account?.provider ?? null;
      const username = buildDefaultUsername(email, userId);

      await db
        .insert(userProfiles)
        .values({
          userId,
          email,
          name,
          username,
          image,
          provider,
          updatedAt: now,
          lastLoginAt: now,
        })
        .onConflictDoUpdate({
          target: userProfiles.userId,
          set: {
            email,
            name,
            image,
            provider,
            updatedAt: now,
            lastLoginAt: now,
          },
        });
    },
  },
});
