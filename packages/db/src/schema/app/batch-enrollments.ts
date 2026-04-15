import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

import { batches } from "./batches";
import { users } from "../auth/users";

export const batchEnrollments = pgTable(
  "batch_enrollment",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    batchId: text("batchId")
      .notNull()
      .references(() => batches.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["applied", "approved"] }).notNull().default("applied"),
    enrolledAt: timestamp("enrolledAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.batchId] }),
  }),
);
