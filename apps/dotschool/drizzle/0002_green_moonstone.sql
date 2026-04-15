ALTER TABLE "user_profile" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "tp" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE "user_profile"
SET "username" = 'u1_' || lower(regexp_replace("userId", '[^a-zA-Z0-9]', '', 'g')) || '.0'
WHERE "username" IS NULL;--> statement-breakpoint
ALTER TABLE "user_profile" ALTER COLUMN "username" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_username_unique" UNIQUE("username");
