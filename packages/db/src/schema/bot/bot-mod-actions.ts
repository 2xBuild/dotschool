import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { botMembers } from "./bot-members";

export const botModActions = pgTable("bot_mod_action", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  targetDiscordId: text("targetDiscordId")
    .notNull()
    .references(() => botMembers.discordId, { onDelete: "cascade" }),
  action: text("action", {
    enum: ["warn", "mute", "kick", "ban", "block", "unblock", "unmute"],
  }).notNull(),
  reason: text("reason"),
  performedBy: text("performedBy").notNull(),
  /** Duration in seconds for timed actions (mute). Null = permanent or N/A. */
  durationSeconds: integer("durationSeconds"),
  /** ID of the concern vote that triggered this, if auto-actioned. */
  concernId: text("concernId"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});
