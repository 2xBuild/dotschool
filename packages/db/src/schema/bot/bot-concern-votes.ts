import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

import { botConcerns } from "./bot-concerns";
import { botMembers } from "./bot-members";

export const botConcernVotes = pgTable(
  "bot_concern_vote",
  {
    concernId: text("concernId")
      .notNull()
      .references(() => botConcerns.id, { onDelete: "cascade" }),
    voterId: text("voterId")
      .notNull()
      .references(() => botMembers.discordId, { onDelete: "cascade" }),
    voteType: text("voteType", { enum: ["upvote", "downvote"] })
      .notNull()
      .default("upvote"),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.concernId, t.voterId] }),
  }),
);
