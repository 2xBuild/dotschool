import { integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

import { botMembers } from "./bot-members";

/**
 * Group polls — community votes on a specific action against a member.
 * When the vote ratio crosses the threshold the bot auto-executes the action.
 */
export const botGroupPolls = pgTable("bot_group_poll", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  targetId: text("targetId")
    .notNull()
    .references(() => botMembers.discordId, { onDelete: "cascade" }),
  /** The proposed action: mute, kick, ban, warn. */
  proposedAction: text("proposedAction", {
    enum: ["warn", "mute", "kick", "ban"],
  }).notNull(),
  reason: text("reason").notNull(),
  initiatedBy: text("initiatedBy")
    .notNull()
    .references(() => botMembers.discordId, { onDelete: "cascade" }),
  status: text("status", {
    enum: ["open", "passed", "failed", "cancelled"],
  })
    .notNull()
    .default("open"),
  yesCount: integer("yesCount").notNull().default(0),
  noCount: integer("noCount").notNull().default(0),
  /** Ratio threshold (0-100) at which the action is auto-executed. e.g. 60 = 60% yes votes needed. */
  threshold: integer("threshold").notNull().default(60),
  /** Discord message ID of the poll embed. */
  messageId: text("messageId"),
  channelId: text("channelId"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  closesAt: timestamp("closesAt", { mode: "date" }),
  closedAt: timestamp("closedAt", { mode: "date" }),
});

export const botGroupPollVotes = pgTable(
  "bot_group_poll_vote",
  {
    pollId: text("pollId")
      .notNull()
      .references(() => botGroupPolls.id, { onDelete: "cascade" }),
    voterId: text("voterId")
      .notNull()
      .references(() => botMembers.discordId, { onDelete: "cascade" }),
    vote: text("vote", { enum: ["yes", "no"] }).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.pollId, t.voterId] }),
  }),
);
