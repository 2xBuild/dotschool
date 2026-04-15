import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const botAnnouncements = pgTable("bot_announcement", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  authorId: text("authorId").notNull(),
  content: text("content").notNull(),
  channelId: text("channelId").notNull(),
  messageId: text("messageId"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});
