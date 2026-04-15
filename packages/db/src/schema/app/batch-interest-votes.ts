import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

import { batches } from "./batches";
import { users } from "../auth/users";

export const batchInterestVotes = pgTable(
  "batch_interest_vote",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    batchId: text("batchId")
      .notNull()
      .references(() => batches.id, { onDelete: "cascade" }),
    vote: text("vote").notNull().default("up"),
    votedAt: timestamp("votedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.batchId] }),
  }),
);
