import NextAuth from "next-auth";
import { createBaseAuthConfig } from "@repo/auth";

import { db } from "@/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/server/db/schema";

const baseConfig = createBaseAuthConfig(db, {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
});

export const { handlers, auth } = NextAuth({
  ...baseConfig,
  callbacks: {
    ...baseConfig.callbacks,
    async session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
});
