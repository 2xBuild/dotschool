import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { users } from "../auth/users";

export const botMembers = pgTable("bot_member", {
  discordId: text("discordId").primaryKey(),
  userId: text("userId").references(() => users.id, { onDelete: "set null" }),
  username: text("username").notNull(),
  joinedAt: timestamp("joinedAt", { mode: "date" }).notNull().defaultNow(),
});
