import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { batchModules } from "./batch-modules";

export const moduleResources = pgTable("module_resource", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  moduleId: text("moduleId")
    .notNull()
    .references(() => batchModules.id, { onDelete: "cascade" }),
  /** "text" = inline text/notes, "blog" = external article link, "video" = video link */
  type: text("type").notNull().default("text"),
  title: text("title").notNull(),
  /** External URL for blog/video resources */
  url: text("url"),
  /** Inline text content (for type="text") */
  content: text("content"),
  /** Thumbnail/preview image URL (primarily for videos) */
  thumbnailUrl: text("thumbnailUrl"),
  /** Duration string for videos, e.g. "12:34" */
  duration: text("duration"),
  /** Ordering within the module */
  sortOrder: integer("sortOrder").notNull().default(0),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});
