CREATE TABLE "batch_enrollment" (
	"userId" text NOT NULL,
	"batchId" text NOT NULL,
	"enrolledAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "batch_enrollment_userId_batchId_pk" PRIMARY KEY("userId","batchId")
);
--> statement-breakpoint
CREATE TABLE "batch" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"startsAt" timestamp NOT NULL,
	"endsAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "batch_enrollment" ADD CONSTRAINT "batch_enrollment_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch_enrollment" ADD CONSTRAINT "batch_enrollment_batchId_batch_id_fk" FOREIGN KEY ("batchId") REFERENCES "public"."batch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
INSERT INTO "batch" ("id", "title", "description", "startsAt", "endsAt", "createdAt") VALUES
	('0198f0e0-0001-7000-8000-000000000001', 'Foundations — Spring cohort', 'Core skills and weekly live sessions for new learners.', now() + interval '14 days', now() + interval '98 days', now()),
	('0198f0e0-0001-7000-8000-000000000002', 'Advanced build track', 'Ship a real project with feedback from mentors.', now() + interval '45 days', now() + interval '120 days', now());