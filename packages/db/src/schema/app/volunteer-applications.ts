import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { users } from "../auth/users";

export const volunteerApplications = pgTable("volunteer_application", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: text("role", {
    enum: ["developer", "discord_mod", "content_writer", "mentor", "other"],
  }).notNull(),
  motivation: text("motivation").notNull(),
  experience: text("experience"),
  status: text("status", {
    enum: ["pending", "accepted", "declined"],
  })
    .notNull()
    .default("pending"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});
