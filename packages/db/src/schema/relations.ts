import { relations } from "drizzle-orm";

import { batchEnrollments } from "./app/batch-enrollments";
import { batchInterestVotes } from "./app/batch-interest-votes";
import { batchModules } from "./app/batch-modules";
import { batchVolunteers } from "./app/batch-volunteers";
import { batches } from "./app/batches";
import { moduleResources } from "./app/module-resources";
import { peerVotes } from "./app/peer-votes";
import { volunteerApplications } from "./app/volunteer-applications";
import { userTags } from "./auth/user-tags";
import { users } from "./auth/users";
import { botConcernVotes } from "./bot/bot-concern-votes";
import { botConcerns } from "./bot/bot-concerns";
import { botGroupPollVotes, botGroupPolls } from "./bot/bot-group-polls";
import { botMemberTags } from "./bot/bot-member-tags";
import { botMembers } from "./bot/bot-members";
import { botModActions } from "./bot/bot-mod-actions";

export const volunteerApplicationsRelations = relations(volunteerApplications, ({ one }) => ({
  user: one(users, {
    fields: [volunteerApplications.userId],
    references: [users.id],
  }),
}));

export const userTagsRelations = relations(userTags, ({ one }) => ({
  user: one(users, {
    fields: [userTags.userId],
    references: [users.id],
  }),
  granter: one(users, {
    fields: [userTags.grantedBy],
    references: [users.id],
    relationName: "grantedByUser",
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  tags: many(userTags),
  batchEnrollments: many(batchEnrollments),
  batchInterestVotes: many(batchInterestVotes),
  batchVolunteers: many(batchVolunteers),
  volunteerApplications: many(volunteerApplications),
  peerVotesGiven: many(peerVotes, { relationName: "voter" }),
  peerVotesReceived: many(peerVotes, { relationName: "target" }),
}));

export const batchesRelations = relations(batches, ({ many }) => ({
  enrollments: many(batchEnrollments),
  interestVotes: many(batchInterestVotes),
  volunteers: many(batchVolunteers),
  modules: many(batchModules),
}));

export const batchModulesRelations = relations(batchModules, ({ one, many }) => ({
  batch: one(batches, {
    fields: [batchModules.batchId],
    references: [batches.id],
  }),
  resources: many(moduleResources),
}));

export const moduleResourcesRelations = relations(moduleResources, ({ one }) => ({
  module: one(batchModules, {
    fields: [moduleResources.moduleId],
    references: [batchModules.id],
  }),
}));

export const batchVolunteersRelations = relations(batchVolunteers, ({ one }) => ({
  batch: one(batches, {
    fields: [batchVolunteers.batchId],
    references: [batches.id],
  }),
  user: one(users, {
    fields: [batchVolunteers.userId],
    references: [users.id],
  }),
}));

export const batchInterestVotesRelations = relations(batchInterestVotes, ({ one }) => ({
  batch: one(batches, {
    fields: [batchInterestVotes.batchId],
    references: [batches.id],
  }),
  user: one(users, {
    fields: [batchInterestVotes.userId],
    references: [users.id],
  }),
}));

export const peerVotesRelations = relations(peerVotes, ({ one }) => ({
  batch: one(batches, {
    fields: [peerVotes.batchId],
    references: [batches.id],
  }),
  voter: one(users, {
    fields: [peerVotes.voterId],
    references: [users.id],
    relationName: "voter",
  }),
  target: one(users, {
    fields: [peerVotes.targetUserId],
    references: [users.id],
    relationName: "target",
  }),
}));

export const batchEnrollmentsRelations = relations(batchEnrollments, ({ one }) => ({
  batch: one(batches, {
    fields: [batchEnrollments.batchId],
    references: [batches.id],
  }),
  user: one(users, {
    fields: [batchEnrollments.userId],
    references: [users.id],
  }),
}));

/* ------------------------------------------------------------------ */
/*  Bot relations                                                       */
/* ------------------------------------------------------------------ */

export const botMembersRelations = relations(botMembers, ({ one, many }) => ({
  user: one(users, {
    fields: [botMembers.userId],
    references: [users.id],
  }),
  tags: many(botMemberTags),
  concernsReported: many(botConcerns, { relationName: "reporter" }),
  concernsReceived: many(botConcerns, { relationName: "target" }),
  modActions: many(botModActions),
}));

export const botMemberTagsRelations = relations(botMemberTags, ({ one }) => ({
  member: one(botMembers, {
    fields: [botMemberTags.discordId],
    references: [botMembers.discordId],
  }),
}));

export const botConcernsRelations = relations(botConcerns, ({ one, many }) => ({
  reporter: one(botMembers, {
    fields: [botConcerns.reporterId],
    references: [botMembers.discordId],
    relationName: "reporter",
  }),
  target: one(botMembers, {
    fields: [botConcerns.targetId],
    references: [botMembers.discordId],
    relationName: "target",
  }),
  votes: many(botConcernVotes),
}));

export const botConcernVotesRelations = relations(botConcernVotes, ({ one }) => ({
  concern: one(botConcerns, {
    fields: [botConcernVotes.concernId],
    references: [botConcerns.id],
  }),
  voter: one(botMembers, {
    fields: [botConcernVotes.voterId],
    references: [botMembers.discordId],
  }),
}));

export const botModActionsRelations = relations(botModActions, ({ one }) => ({
  target: one(botMembers, {
    fields: [botModActions.targetDiscordId],
    references: [botMembers.discordId],
  }),
}));

export const botGroupPollsRelations = relations(botGroupPolls, ({ one, many }) => ({
  target: one(botMembers, {
    fields: [botGroupPolls.targetId],
    references: [botMembers.discordId],
    relationName: "pollTarget",
  }),
  initiator: one(botMembers, {
    fields: [botGroupPolls.initiatedBy],
    references: [botMembers.discordId],
    relationName: "pollInitiator",
  }),
  votes: many(botGroupPollVotes),
}));

export const botGroupPollVotesRelations = relations(botGroupPollVotes, ({ one }) => ({
  poll: one(botGroupPolls, {
    fields: [botGroupPollVotes.pollId],
    references: [botGroupPolls.id],
  }),
  voter: one(botMembers, {
    fields: [botGroupPollVotes.voterId],
    references: [botMembers.discordId],
  }),
}));
