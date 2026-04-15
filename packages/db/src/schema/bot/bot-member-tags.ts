import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

import { botMembers } from "./bot-members";

export const botMemberTags = pgTable(
  "bot_member_tag",
  {
    discordId: text("discordId")
      .notNull()
      .references(() => botMembers.discordId, { onDelete: "cascade" }),
    tag: text("tag").notNull(),
    assignedBy: text("assignedBy"),
    assignedAt: timestamp("assignedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.discordId, t.tag] }),
  }),
);
