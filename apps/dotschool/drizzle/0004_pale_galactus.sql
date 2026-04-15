CREATE TABLE "batch_interest_vote" (
	"userId" text NOT NULL,
	"batchId" text NOT NULL,
	"votedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "batch_interest_vote_userId_batchId_pk" PRIMARY KEY("userId","batchId")
);
--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "status" text DEFAULT 'confirmed' NOT NULL;--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "roadmap" text;--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "process" text;--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "projects" text;--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "leaderboard" text;--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "rewardPool" text;--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "hackathon" text;--> statement-breakpoint
ALTER TABLE "batch_interest_vote" ADD CONSTRAINT "batch_interest_vote_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch_interest_vote" ADD CONSTRAINT "batch_interest_vote_batchId_batch_id_fk" FOREIGN KEY ("batchId") REFERENCES "public"."batch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
UPDATE "batch" SET
	"roadmap" = 'Weeks 1–2: onboarding and tooling. Weeks 3–6: guided modules with checkpoints. Weeks 7–10: capstone prep. Final week: demo day.',
	"process" = 'Two live sessions per week, daily async exercises, and mentor office hours. Expect ~8–10 hours per week.',
	"projects" = 'One portfolio project (your choice within track constraints) with two milestone reviews.',
	"leaderboard" = 'Friendly cohort leaderboard for weekly challenges; top contributors highlighted. No grade impact—optional participation.',
	"rewardPool" = 'Completion badges, mentor shout-outs, and small merch stipends for standout demos (details per cohort email).',
	"hackathon" = NULL
WHERE "id" = '0198f0e0-0001-7000-8000-000000000001';--> statement-breakpoint
UPDATE "batch" SET
	"roadmap" = 'Sprint 0: scope and stack. Sprint 1–3: build with PR reviews. Sprint 4: hardening and launch checklist.',
	"process" = 'Async-first with weekly group critique. Pairing encouraged; office hours for blockers.',
	"projects" = 'Ship one production-leaning app or OSS contribution with deployment and README.',
	"leaderboard" = 'Optional build streaks and PR velocity stats shared in cohort channel only.',
	"rewardPool" = 'Featured project spotlights; potential referral to hiring partners (no guarantees).',
	"hackathon" = 'Closing weekend optional hackathon: 48h theme build with peer voting and mentor picks.'
WHERE "id" = '0198f0e0-0001-7000-8000-000000000002';--> statement-breakpoint
INSERT INTO "batch" ("id", "title", "description", "status", "startsAt", "endsAt", "createdAt") VALUES
	('0198f0e0-0001-7000-8000-000000000010', 'AI literacy for teens', 'Short sprint on safe, creative use of assistants and small models—not a full dev track.', 'pending', now() + interval '180 days', NULL, now()),
	('0198f0e0-0001-7000-8000-000000000011', 'Open-source game jam track', 'Weekend builds plus mentorship; we will schedule if interest is strong enough.', 'pending', now() + interval '200 days', NULL, now());