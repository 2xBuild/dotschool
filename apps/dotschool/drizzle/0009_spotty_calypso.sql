CREATE TABLE "volunteer_application" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"motivation" text NOT NULL,
	"experience" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "questionSetId" text;--> statement-breakpoint
ALTER TABLE "volunteer_application" ADD CONSTRAINT "volunteer_application_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;