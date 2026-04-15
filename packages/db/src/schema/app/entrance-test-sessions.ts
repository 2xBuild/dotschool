import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { batches } from "./batches";
import { users } from "../auth/users";

export const entranceTestSessions = pgTable("entrance_test_session", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  batchId: text("batchId").references(() => batches.id, { onDelete: "set null" }),
  questionSetId: text("questionSetId").notNull(),
  testType: text("testType", { enum: ["entrance", "weekly", "custom"] })
    .notNull()
    .default("entrance"),
  testDescription: text("testDescription"),
  status: text("status", { enum: ["pending", "in_progress", "submitted", "abandoned"] })
    .notNull()
    .default("pending"),
  totalQuestions: integer("totalQuestions").notNull(),
  answeredCount: integer("answeredCount").notNull().default(0),
  correctCount: integer("correctCount").notNull().default(0),
  scorePercent: integer("scorePercent").notNull().default(0),
  userSnapshot: text("userSnapshot").notNull(),
  batchSnapshot: text("batchSnapshot"),
  startedAt: timestamp("startedAt", { mode: "date" }).notNull().defaultNow(),
  finishedAt: timestamp("finishedAt", { mode: "date" }),
  statsDumpedAt: timestamp("statsDumpedAt", { mode: "date" }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});
