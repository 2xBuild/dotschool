import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const batches = pgTable("batch", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  /** `confirmed` = scheduled cohort (enrollment when upcoming); `pending` = exploring interest only */
  status: text("status").notNull().default("confirmed"),
  startsAt: timestamp("startsAt", { mode: "date" }),
  endsAt: timestamp("endsAt", { mode: "date" }),
  roadmap: text("roadmap"),
  process: text("process"),
  projects: text("projects"),
  leaderboard: text("leaderboard"),
  rewardPool: text("rewardPool"),
  hackathon: text("hackathon"),
  tips: text("tips"),
  rules: text("rules"),
  /** JSON string array of icon keys, e.g. `["si-javascript","si-react"]` - see batch-card-icon-registry */
  cardIconKeys: text("cardIconKeys"),
  /** Entrance test question set ID assigned to this batch (null = no test configured) */
  questionSetId: text("questionSetId"),
  /** Display cohort label, e.g. "Batch 3" */
  batchNumber: integer("batchNumber").notNull().default(1),
  /** Maximum enrollments for this cohort */
  totalSeats: integer("totalSeats").notNull().default(500),
  /** Discord category ID created by /start-batch webhook — null means channels haven't been created yet */
  discordCategoryId: text("discordCategoryId"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});
