import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { batches } from "./batches";
import { entranceTestSessions } from "./entrance-test-sessions";
import { users } from "../auth/users";

export const entranceTestStats = pgTable("entrance_test_stat", {
  sessionId: text("sessionId")
    .primaryKey()
    .references(() => entranceTestSessions.id, { onDelete: "cascade" }),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  batchId: text("batchId").references(() => batches.id, { onDelete: "set null" }),
  questionSetId: text("questionSetId").notNull(),
  totalQuestions: integer("totalQuestions").notNull(),
  answeredCount: integer("answeredCount").notNull(),
  correctCount: integer("correctCount").notNull(),
  scorePercent: integer("scorePercent").notNull(),
  durationSeconds: integer("durationSeconds").notNull(),
  statsJson: text("statsJson").notNull(),
  dumpedAt: timestamp("dumpedAt", { mode: "date" }).notNull().defaultNow(),
});
