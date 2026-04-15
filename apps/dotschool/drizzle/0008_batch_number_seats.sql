ALTER TABLE "batch" ADD COLUMN "batchNumber" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "totalSeats" integer DEFAULT 24 NOT NULL;--> statement-breakpoint
UPDATE "batch" SET "batchNumber" = 1, "totalSeats" = 28 WHERE "id" = '0198f0e0-0001-7000-8000-000000000001';--> statement-breakpoint
UPDATE "batch" SET "batchNumber" = 2, "totalSeats" = 20 WHERE "id" = '0198f0e0-0001-7000-8000-000000000002';--> statement-breakpoint
UPDATE "batch" SET "batchNumber" = 6, "totalSeats" = 36 WHERE "id" = '0198f0e0-0001-7000-8000-000000000010';--> statement-breakpoint
UPDATE "batch" SET "batchNumber" = 7, "totalSeats" = 48 WHERE "id" = '0198f0e0-0001-7000-8000-000000000011';--> statement-breakpoint
UPDATE "batch" SET "batchNumber" = 3, "totalSeats" = 32 WHERE "id" = '0198f0e0-0001-7000-8000-000000000012';--> statement-breakpoint
UPDATE "batch" SET "batchNumber" = 4, "totalSeats" = 24 WHERE "id" = '0198f0e0-0001-7000-8000-000000000013';--> statement-breakpoint
UPDATE "batch" SET "batchNumber" = 5, "totalSeats" = 30 WHERE "id" = '0198f0e0-0001-7000-8000-000000000014';--> statement-breakpoint
