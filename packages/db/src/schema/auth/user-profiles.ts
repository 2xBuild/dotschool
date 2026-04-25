import { sql } from "drizzle-orm";
import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { users } from "./users";

export type UserProfileSocials = {
  discord?: {
    username?: string | null;
    userId?: string | null;
  } | null;
  support?: {
    label?: string | null;
    url?: string | null;
  } | null;
  twitter?: {
    username?: string | null;
  } | null;
};

export const userProfiles = pgTable("user_profile", {
  userId: text("userId")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull().unique(),
  name: text("name"),
  username: text("username").notNull().unique(),
  about: text("about"),
  socials: jsonb("socials")
    .$type<UserProfileSocials>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  image: text("image"),
  showInDirectory: boolean("showInDirectory").notNull().default(true),
  provider: text("provider"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  lastLoginAt: timestamp("lastLoginAt", { mode: "date" })
    .notNull()
    .defaultNow(),
});
