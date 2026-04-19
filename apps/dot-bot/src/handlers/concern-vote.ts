import type { ButtonContext } from '../types';
import {
  getConcern,
  castVote,
  hasVoted,
  getUser,
  updateConcernStatus,
  getTotalMemberCount,
} from '../database/db';
import { refreshConcernBoardMessage } from '../lib/concern-message';
import { timeoutMember, banMember } from '../discord';
import {
  MIN_VOTERS_FOR_MUTE,
  VOTER_PERCENT_FOR_ACTION,
  HEALTHY_RATIO,
  MUTE_DURATION_MS,
} from '../lib/concern-vote-thresholds';

export async function handleConcernVote(ctx: ButtonContext): Promise<void> {
  const match = ctx.customId.match(/^(upvote|downvote)_concern_(.+)$/);
  if (!match) return;

  await ctx.deferReply({ ephemeral: true });

  const voteType = match[1] as 'upvote' | 'downvote';
  const concernId = match[2];
  const voterId = ctx.user.id;

  const voter = await getUser(voterId);
  if (!voter) {
    await ctx.editReply('You must be registered to vote. Use `/verify` first.');
    return;
  }

  const concern = await getConcern(concernId);
  if (!concern) {
    await ctx.editReply('This concern does not exist.');
    return;
  }

  if (concern.status !== 'open') {
    await ctx.editReply(
      `This concern is no longer open (status: ${concern.status}).`,
    );
    return;
  }

  if (concern.targetId === voterId) {
    await ctx.editReply('You cannot vote on a concern about yourself.');
    return;
  }

  if (await hasVoted(concernId, voterId)) {
    await ctx.editReply('You have already voted on this concern.');
    return;
  }

  const result = await castVote(concernId, voterId, voteType);
  if (!result) {
    await ctx.editReply(
      'Could not record your vote. You may have already voted.',
    );
    return;
  }

  const { upvotes, downvotes } = result;
  const totalVoters = upvotes + downvotes;
  const totalMembers = await getTotalMemberCount();
  const voterPercent = totalMembers > 0 ? totalVoters / totalMembers : 0;
  const ratio = downvotes === 0 ? Infinity : upvotes / downvotes;

  if (voterPercent >= VOTER_PERCENT_FOR_ACTION && ratio >= HEALTHY_RATIO) {
    if (concern.requestedAction === 'block') {
      await applyBlock(ctx, concern.targetId, concernId, upvotes, downvotes);
    } else {
      await applyMute(ctx, concern.targetId, concernId, upvotes, downvotes);
    }
  } else if (totalVoters >= MIN_VOTERS_FOR_MUTE && upvotes > downvotes) {
    await applyMute(ctx, concern.targetId, concernId, upvotes, downvotes);
  } else {
    const label = voteType === 'upvote' ? 'Upvote' : 'Downvote';
    await ctx.editReply(
      `${label} recorded. 👍 **${upvotes}** / 👎 **${downvotes}** (${totalVoters} voter${totalVoters === 1 ? '' : 's'}).`,
    );
  }

  await refreshConcernBoardMessage(concernId);
}

async function applyMute(
  ctx: ButtonContext,
  targetId: string,
  concernId: string,
  upvotes: number,
  downvotes: number,
): Promise<void> {
  if (!ctx.guildId) {
    await ctx.editReply('Cannot mute outside of a guild.');
    return;
  }
  try {
    await timeoutMember(
      ctx.guildId,
      targetId,
      MUTE_DURATION_MS,
      `Community concern: ${upvotes} upvotes / ${downvotes} downvotes.`,
    );
    await updateConcernStatus(concernId, 'actioned', 'muted');
    await ctx.editReply(
      `Vote recorded. 👍 **${upvotes}** / 👎 **${downvotes}** — user has been **muted for 1 hour**.`,
    );
  } catch (err) {
    console.error('[Vote] Failed to mute:', err);
    await ctx.editReply(
      `Vote recorded (👍 ${upvotes} / 👎 ${downvotes}). Mute threshold reached but could not timeout the user.`,
    );
  }
}

async function applyBlock(
  ctx: ButtonContext,
  targetId: string,
  concernId: string,
  upvotes: number,
  downvotes: number,
): Promise<void> {
  if (!ctx.guildId) {
    await ctx.editReply('Cannot block outside of a guild.');
    return;
  }
  try {
    await banMember(
      ctx.guildId,
      targetId,
      `Community concern: ${upvotes} upvotes / ${downvotes} downvotes.`,
    );
    await updateConcernStatus(concernId, 'actioned', 'blocked');
    await ctx.editReply(
      `Vote recorded. 👍 **${upvotes}** / 👎 **${downvotes}** — user has been **blocked** from the server.`,
    );
  } catch (err) {
    console.error('[Vote] Failed to block:', err);
    await ctx.editReply(
      `Vote recorded (👍 ${upvotes} / 👎 ${downvotes}). Block threshold reached but could not ban the user.`,
    );
  }
}
