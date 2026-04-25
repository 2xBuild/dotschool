import NextAuth from "next-auth";
import { and, eq, ne } from "drizzle-orm";
import { createBaseAuthConfig } from "@repo/auth";

import { db } from "@/server/db";
import {
  accounts,
  sessions,
  userProfiles,
  users,
  verificationTokens,
} from "@/server/db/schema";
import {
  buildDefaultUsername,
  DEFAULT_USERNAME_MAX_ATTEMPTS,
} from "@/server/profile/username";

const providerLabels: Record<string, string> = {
  google: "Google",
  github: "GitHub",
  discord: "Discord",
};

function isUniqueViolation(error: unknown): error is {
  code: string;
  constraint_name?: string;
} {
  return Boolean(
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: string }).code === "23505",
  );
}

const baseConfig = createBaseAuthConfig(db, {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...baseConfig,
  pages: {
    error: "/auth/error",
  },
  callbacks: {
    ...baseConfig.callbacks,
    async signIn({ user, account }) {
      const email = user.email?.trim().toLowerCase();
      if (!email || !account) return true;

      // Check if this email is already registered with a different provider
      const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        const existingAccount = await db
          .select({ provider: accounts.provider })
          .from(accounts)
          .where(
            and(
              eq(accounts.userId, existingUser[0].id),
              ne(accounts.provider, account.provider),
            ),
          )
          .limit(1);

        if (
          existingAccount.length > 0 &&
          // Allow sign-in if this provider is already linked
          !(await db
            .select({ provider: accounts.provider })
            .from(accounts)
            .where(
              and(
                eq(accounts.userId, existingUser[0].id),
                eq(accounts.provider, account.provider),
              ),
            )
            .limit(1)
          ).length
        ) {
          const label =
            providerLabels[existingAccount[0].provider] ??
            existingAccount[0].provider;
          return `/auth/error?error=EmailExists&provider=${encodeURIComponent(label)}`;
        }
      }

      return true;
    },
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
      const existingProfile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, userId),
        columns: { userId: true },
      });

      if (existingProfile) {
        await db
          .update(userProfiles)
          .set({
            email,
            name,
            image,
            provider,
            updatedAt: now,
            lastLoginAt: now,
          })
          .where(eq(userProfiles.userId, userId));
        return;
      }

      for (let attempt = 0; attempt < DEFAULT_USERNAME_MAX_ATTEMPTS; attempt += 1) {
        const username = buildDefaultUsername(name);

        try {
          await db.insert(userProfiles).values({
            userId,
            email,
            name,
            username,
            image,
            showInDirectory: true,
            provider,
            updatedAt: now,
            lastLoginAt: now,
          });
          return;
        } catch (error) {
          if (!isUniqueViolation(error)) {
            throw error;
          }

          const concurrentProfile = await db.query.userProfiles.findFirst({
            where: eq(userProfiles.userId, userId),
            columns: { userId: true },
          });

          if (concurrentProfile) {
            await db
              .update(userProfiles)
              .set({
                email,
                name,
                image,
                provider,
                updatedAt: now,
                lastLoginAt: now,
              })
              .where(eq(userProfiles.userId, userId));
            return;
          }

          if (error.constraint_name === "user_profile_username_unique") {
            continue;
          }

          throw error;
        }
      }

      throw new Error("Unable to generate a unique default username.");
    },
  },
});
