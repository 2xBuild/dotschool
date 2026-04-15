ALTER TABLE "user_profile"
ADD COLUMN IF NOT EXISTS "socials" jsonb DEFAULT '{}'::jsonb NOT NULL;
