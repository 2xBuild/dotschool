CREATE TABLE "entrance_test_response" (
	"id" text PRIMARY KEY NOT NULL,
	"sessionId" text NOT NULL,
	"questionId" text NOT NULL,
	"selectedOption" text NOT NULL,
	"correctOption" text NOT NULL,
	"isCorrect" boolean NOT NULL,
	"responseMs" integer,
	"answeredAt" timestamp DEFAULT now() NOT NULL,
	"payload" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entrance_test_session" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"batchId" text,
	"questionSetId" text NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"totalQuestions" integer NOT NULL,
	"answeredCount" integer DEFAULT 0 NOT NULL,
	"correctCount" integer DEFAULT 0 NOT NULL,
	"scorePercent" integer DEFAULT 0 NOT NULL,
	"userSnapshot" text NOT NULL,
	"batchSnapshot" text,
	"redisMetaKey" text NOT NULL,
	"redisAnswersKey" text NOT NULL,
	"startedAt" timestamp DEFAULT now() NOT NULL,
	"finishedAt" timestamp,
	"statsDumpedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entrance_test_stat" (
	"sessionId" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"batchId" text,
	"questionSetId" text NOT NULL,
	"totalQuestions" integer NOT NULL,
	"answeredCount" integer NOT NULL,
	"correctCount" integer NOT NULL,
	"scorePercent" integer NOT NULL,
	"durationSeconds" integer NOT NULL,
	"statsJson" text NOT NULL,
	"dumpedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "entrance_test_response" ADD CONSTRAINT "entrance_test_response_sessionId_entrance_test_session_id_fk" FOREIGN KEY ("sessionId") REFERENCES "public"."entrance_test_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entrance_test_session" ADD CONSTRAINT "entrance_test_session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entrance_test_session" ADD CONSTRAINT "entrance_test_session_batchId_batch_id_fk" FOREIGN KEY ("batchId") REFERENCES "public"."batch"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entrance_test_stat" ADD CONSTRAINT "entrance_test_stat_sessionId_entrance_test_session_id_fk" FOREIGN KEY ("sessionId") REFERENCES "public"."entrance_test_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entrance_test_stat" ADD CONSTRAINT "entrance_test_stat_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entrance_test_stat" ADD CONSTRAINT "entrance_test_stat_batchId_batch_id_fk" FOREIGN KEY ("batchId") REFERENCES "public"."batch"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "entrance_test_session_question_unique" ON "entrance_test_response" USING btree ("sessionId","questionId");
