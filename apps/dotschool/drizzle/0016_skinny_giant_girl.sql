ALTER TABLE "user_profile" ADD COLUMN "showInDirectory" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "testOpensAt" timestamp;