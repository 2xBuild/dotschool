import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

import { users } from "./users";

export const userTags = pgTable(
  "user_tag",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tag: text("tag", { enum: ["admin", "mod"] }).notNull(),
    grantedAt: timestamp("grantedAt", { mode: "date" }).notNull().defaultNow(),
    grantedBy: text("grantedBy").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.tag] }),
  }),
);
