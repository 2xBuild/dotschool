import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { botMembers } from "./bot-members";

export const botConcerns = pgTable("bot_concern", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  reporterId: text("reporterId")
    .notNull()
    .references(() => botMembers.discordId, { onDelete: "cascade" }),
  targetId: text("targetId")
    .notNull()
    .references(() => botMembers.discordId, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  /** When true, the public embed hides the reporter's @mention. */
  reporterAnonymous: boolean("reporterAnonymous").notNull().default(false),
  status: text("status", {
    enum: ["open", "resolved", "actioned", "dismissed"],
  })
    .notNull()
    .default("open"),
  /** Action the concern creator wants taken if the vote passes (mute / block). */
  requestedAction: text("requestedAction", {
    enum: ["mute", "block"],
  })
    .notNull()
    .default("mute"),
  /** Cached upvote tally. */
  upvoteCount: integer("upvoteCount").notNull().default(0),
  /** Cached downvote tally. */
  downvoteCount: integer("downvoteCount").notNull().default(0),
  /** The action taken when threshold was hit (mute / block). */
  actionTaken: text("actionTaken"),
  /** Discord message ID of the concern embed (for button interactions). */
  messageId: text("messageId"),
  channelId: text("channelId"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  resolvedAt: timestamp("resolvedAt", { mode: "date" }),
});
