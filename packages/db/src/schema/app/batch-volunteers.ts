import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

import { batches } from "./batches";
import { users } from "../auth/users";

export const batchVolunteers = pgTable(
  "batch_volunteer",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    batchId: text("batchId")
      .notNull()
      .references(() => batches.id, { onDelete: "cascade" }),
    role: text("role", {
      enum: ["developer", "discord_mod", "content_writer", "mentor", "other"],
    }).notNull(),
    assignedAt: timestamp("assignedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.batchId, t.role] }),
  }),
);
