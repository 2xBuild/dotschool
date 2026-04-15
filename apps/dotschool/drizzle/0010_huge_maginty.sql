CREATE TABLE "batch_volunteer" (
	"userId" text NOT NULL,
	"batchId" text NOT NULL,
	"role" text NOT NULL,
	"assignedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "batch_volunteer_userId_batchId_role_pk" PRIMARY KEY("userId","batchId","role")
);
--> statement-breakpoint
ALTER TABLE "batch_volunteer" ADD CONSTRAINT "batch_volunteer_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch_volunteer" ADD CONSTRAINT "batch_volunteer_batchId_batch_id_fk" FOREIGN KEY ("batchId") REFERENCES "public"."batch"("id") ON DELETE cascade ON UPDATE no action;