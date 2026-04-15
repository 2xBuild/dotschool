import { integer, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

import { batches } from "./batches";

export const batchModules = pgTable(
  "batch_module",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    batchId: text("batchId")
      .notNull()
      .references(() => batches.id, { onDelete: "cascade" }),
    /** Which week this module belongs to (1-indexed) */
    weekNumber: integer("weekNumber").notNull(),
    /** 1 or 2 — two modules per week */
    moduleNumber: integer("moduleNumber").notNull(),
    title: text("title").notNull(),
    /** Overview of all concepts and topics covered in this module */
    description: text("description"),
    /** JSON string array of topic names, e.g. `["Variables","Functions","Closures"]` */
    topics: text("topics"),
    /** Explicit ordering (defaults to weekNumber * 10 + moduleNumber logic) */
    sortOrder: integer("sortOrder").notNull().default(0),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [unique("batch_module_week_uniq").on(t.batchId, t.weekNumber, t.moduleNumber)],
);
