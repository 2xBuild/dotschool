import { integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

import { batches } from "./batches";
import { users } from "../auth/users";

export const peerVotes = pgTable(
  "peer_vote",
  {
    voterId: text("voterId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetUserId: text("targetUserId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    batchId: text("batchId")
      .notNull()
      .references(() => batches.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull().default(3),
    votedAt: timestamp("votedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.voterId, t.targetUserId, t.batchId] }),
  }),
);
