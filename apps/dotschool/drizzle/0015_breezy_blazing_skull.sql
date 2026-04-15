CREATE TABLE "user_tag" (
	"userId" text NOT NULL,
	"tag" text NOT NULL,
	"grantedAt" timestamp DEFAULT now() NOT NULL,
	"grantedBy" text,
	CONSTRAINT "user_tag_userId_tag_pk" PRIMARY KEY("userId","tag")
);
--> statement-breakpoint
CREATE TABLE "batch_module" (
	"id" text PRIMARY KEY NOT NULL,
	"batchId" text NOT NULL,
	"weekNumber" integer NOT NULL,
	"moduleNumber" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"topics" text,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "batch_module_week_uniq" UNIQUE("batchId","weekNumber","moduleNumber")
);
--> statement-breakpoint
CREATE TABLE "module_resource" (
	"id" text PRIMARY KEY NOT NULL,
	"moduleId" text NOT NULL,
	"type" text DEFAULT 'text' NOT NULL,
	"title" text NOT NULL,
	"url" text,
	"content" text,
	"thumbnailUrl" text,
	"duration" text,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "peer_vote" (
	"voterId" text NOT NULL,
	"targetUserId" text NOT NULL,
	"batchId" text NOT NULL,
	"rating" integer DEFAULT 3 NOT NULL,
	"votedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "peer_vote_voterId_targetUserId_batchId_pk" PRIMARY KEY("voterId","targetUserId","batchId")
);
--> statement-breakpoint
CREATE TABLE "bot_member" (
	"discordId" text PRIMARY KEY NOT NULL,
	"userId" text,
	"username" text NOT NULL,
	"joinedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bot_member_tag" (
	"discordId" text NOT NULL,
	"tag" text NOT NULL,
	"assignedBy" text,
	"assignedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bot_member_tag_discordId_tag_pk" PRIMARY KEY("discordId","tag")
);
--> statement-breakpoint
CREATE TABLE "bot_mod_action" (
	"id" text PRIMARY KEY NOT NULL,
	"targetDiscordId" text NOT NULL,
	"action" text NOT NULL,
	"reason" text,
	"performedBy" text NOT NULL,
	"durationSeconds" integer,
	"concernId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bot_concern" (
	"id" text PRIMARY KEY NOT NULL,
	"reporterId" text NOT NULL,
	"targetId" text NOT NULL,
	"reason" text NOT NULL,
	"reporterAnonymous" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"requestedAction" text DEFAULT 'mute' NOT NULL,
	"upvoteCount" integer DEFAULT 0 NOT NULL,
	"downvoteCount" integer DEFAULT 0 NOT NULL,
	"actionTaken" text,
	"messageId" text,
	"channelId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"resolvedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "bot_concern_vote" (
	"concernId" text NOT NULL,
	"voterId" text NOT NULL,
	"voteType" text DEFAULT 'upvote' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bot_concern_vote_concernId_voterId_pk" PRIMARY KEY("concernId","voterId")
);
--> statement-breakpoint
CREATE TABLE "bot_announcement" (
	"id" text PRIMARY KEY NOT NULL,
	"authorId" text NOT NULL,
	"content" text NOT NULL,
	"channelId" text NOT NULL,
	"messageId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bot_group_poll_vote" (
	"pollId" text NOT NULL,
	"voterId" text NOT NULL,
	"vote" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bot_group_poll_vote_pollId_voterId_pk" PRIMARY KEY("pollId","voterId")
);
--> statement-breakpoint
CREATE TABLE "bot_group_poll" (
	"id" text PRIMARY KEY NOT NULL,
	"targetId" text NOT NULL,
	"proposedAction" text NOT NULL,
	"reason" text NOT NULL,
	"initiatedBy" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"yesCount" integer DEFAULT 0 NOT NULL,
	"noCount" integer DEFAULT 0 NOT NULL,
	"threshold" integer DEFAULT 60 NOT NULL,
	"messageId" text,
	"channelId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"closesAt" timestamp,
	"closedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "user_profile" RENAME COLUMN "tp" TO "about";--> statement-breakpoint
ALTER TABLE "batch" ALTER COLUMN "startsAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "batch" ALTER COLUMN "totalSeats" SET DEFAULT 500;--> statement-breakpoint
ALTER TABLE "entrance_test_session" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "batch_interest_vote" ADD COLUMN "vote" text DEFAULT 'up' NOT NULL;--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "tips" text;--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "rules" text;--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "discordCategoryId" text;--> statement-breakpoint
ALTER TABLE "entrance_test_session" ADD COLUMN "testType" text DEFAULT 'entrance' NOT NULL;--> statement-breakpoint
ALTER TABLE "entrance_test_session" ADD COLUMN "testDescription" text;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "socials" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "user_tag" ADD CONSTRAINT "user_tag_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tag" ADD CONSTRAINT "user_tag_grantedBy_user_id_fk" FOREIGN KEY ("grantedBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch_module" ADD CONSTRAINT "batch_module_batchId_batch_id_fk" FOREIGN KEY ("batchId") REFERENCES "public"."batch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_resource" ADD CONSTRAINT "module_resource_moduleId_batch_module_id_fk" FOREIGN KEY ("moduleId") REFERENCES "public"."batch_module"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "peer_vote" ADD CONSTRAINT "peer_vote_voterId_user_id_fk" FOREIGN KEY ("voterId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "peer_vote" ADD CONSTRAINT "peer_vote_targetUserId_user_id_fk" FOREIGN KEY ("targetUserId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "peer_vote" ADD CONSTRAINT "peer_vote_batchId_batch_id_fk" FOREIGN KEY ("batchId") REFERENCES "public"."batch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_member" ADD CONSTRAINT "bot_member_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_member_tag" ADD CONSTRAINT "bot_member_tag_discordId_bot_member_discordId_fk" FOREIGN KEY ("discordId") REFERENCES "public"."bot_member"("discordId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_mod_action" ADD CONSTRAINT "bot_mod_action_targetDiscordId_bot_member_discordId_fk" FOREIGN KEY ("targetDiscordId") REFERENCES "public"."bot_member"("discordId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_concern" ADD CONSTRAINT "bot_concern_reporterId_bot_member_discordId_fk" FOREIGN KEY ("reporterId") REFERENCES "public"."bot_member"("discordId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_concern" ADD CONSTRAINT "bot_concern_targetId_bot_member_discordId_fk" FOREIGN KEY ("targetId") REFERENCES "public"."bot_member"("discordId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_concern_vote" ADD CONSTRAINT "bot_concern_vote_concernId_bot_concern_id_fk" FOREIGN KEY ("concernId") REFERENCES "public"."bot_concern"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_concern_vote" ADD CONSTRAINT "bot_concern_vote_voterId_bot_member_discordId_fk" FOREIGN KEY ("voterId") REFERENCES "public"."bot_member"("discordId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_group_poll_vote" ADD CONSTRAINT "bot_group_poll_vote_pollId_bot_group_poll_id_fk" FOREIGN KEY ("pollId") REFERENCES "public"."bot_group_poll"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_group_poll_vote" ADD CONSTRAINT "bot_group_poll_vote_voterId_bot_member_discordId_fk" FOREIGN KEY ("voterId") REFERENCES "public"."bot_member"("discordId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_group_poll" ADD CONSTRAINT "bot_group_poll_targetId_bot_member_discordId_fk" FOREIGN KEY ("targetId") REFERENCES "public"."bot_member"("discordId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_group_poll" ADD CONSTRAINT "bot_group_poll_initiatedBy_bot_member_discordId_fk" FOREIGN KEY ("initiatedBy") REFERENCES "public"."bot_member"("discordId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entrance_test_session" DROP COLUMN "redisMetaKey";--> statement-breakpoint
ALTER TABLE "entrance_test_session" DROP COLUMN "redisAnswersKey";