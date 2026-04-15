import { boolean, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { entranceTestSessions } from "./entrance-test-sessions";

export const entranceTestResponses = pgTable(
  "entrance_test_response",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sessionId: text("sessionId")
      .notNull()
      .references(() => entranceTestSessions.id, { onDelete: "cascade" }),
    questionId: text("questionId").notNull(),
    selectedOption: text("selectedOption").notNull(),
    correctOption: text("correctOption").notNull(),
    isCorrect: boolean("isCorrect").notNull(),
    responseMs: integer("responseMs"),
    answeredAt: timestamp("answeredAt", { mode: "date" }).notNull().defaultNow(),
    payload: text("payload").notNull(),
  },
  (t) => ({
    sessionQuestionUnique: uniqueIndex("entrance_test_session_question_unique").on(
      t.sessionId,
      t.questionId,
    ),
  }),
);
