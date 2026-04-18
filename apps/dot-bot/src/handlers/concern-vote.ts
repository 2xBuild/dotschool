import { ButtonInteraction, MessageFlags } from 'discord.js';
import {
  getConcern,
  castVote,
  hasVoted,
  getUser,
  updateConcernStatus,
  getTotalMemberCount,
} from '../database/db';
import { refreshConcernBoardMessage } from '../lib/concern-message';
import {
  MIN_VOTERS_FOR_MUTE,
  VOTER_PERCENT_FOR_ACTION,
  HEALTHY_RATIO,
  MUTE_DURATION_MS,
} from '../lib/concern-vote-thresholds';

export async function handleConcernVote(interaction: ButtonInteraction): Promise<void> {
  const match = interaction.customId.match(/^(upvote|downvote)_concern_(.+)$/);
  if (!match) return;

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const voteType = match[1] as 'upvote' | 'downvote';
  const concernId = match[2];
  const voterId = interaction.user.id;

  const voter = await getUser(voterId);
  if (!voter) {
    await interaction.editReply({
      content: 'You must be registered to vote. Use `/verify` first.',
    });
    return;
  }

  const concern = await getConcern(concernId);
  if (!concern) {
    await interaction.editReply({ content: 'This concern does not exist.' });
    return;
  }

  if (concern.status !== 'open') {
    await interaction.editReply({
      content: `This concern is no longer open (status: ${concern.status}).`,
    });
    return;
  }

  if (concern.targetId === voterId) {
    await interaction.editReply({ content: 'You cannot vote on a concern about yourself.' });
    return;
  }

  if (await hasVoted(concernId, voterId)) {
    await interaction.editReply({ content: 'You have already voted on this concern.' });
    return;
  }

  const result = await castVote(concernId, voterId, voteType);
  if (!result) {
    await interaction.editReply({
      content: 'Could not record your vote. You may have already voted.',
    });
    return;
  }

  const { upvotes, downvotes } = result;
  const totalVoters = upvotes + downvotes;
  const totalMembers = await getTotalMemberCount();
  const voterPercent = totalMembers > 0 ? totalVoters / totalMembers : 0;
  const ratio = downvotes === 0 ? Infinity : upvotes / downvotes;

  if (voterPercent >= VOTER_PERCENT_FOR_ACTION && ratio >= HEALTHY_RATIO) {
    if (concern.requestedAction === 'block') {
      await applyBlock(interaction, concern.targetId, concernId, upvotes, downvotes);
    } else {
      await applyMute(interaction, concern.targetId, concernId, upvotes, downvotes);
    }
  } else if (totalVoters >= MIN_VOTERS_FOR_MUTE && upvotes > downvotes) {
    await applyMute(interaction, concern.targetId, concernId, upvotes, downvotes);
  } else {
    const label = voteType === 'upvote' ? 'Upvote' : 'Downvote';
    await interaction.editReply(
      `${label} recorded. 👍 **${upvotes}** / 👎 **${downvotes}** (${totalVoters} voter${totalVoters === 1 ? '' : 's'}).`,
    );
  }

  await refreshConcernBoardMessage(interaction.client, concernId);
}

async function applyMute(
  interaction: ButtonInteraction,
  targetId: string,
  concernId: string,
  upvotes: number,
  downvotes: number,
): Promise<void> {
  if (!interaction.guild) {
    await interaction.editReply('Cannot mute outside of a guild.');
    return;
  }
  try {
    const member = await interaction.guild.members.fetch(targetId);
    await member.timeout(
      MUTE_DURATION_MS,
      `Community concern: ${upvotes} upvotes / ${downvotes} downvotes.`,
    );
    await updateConcernStatus(concernId, 'actioned', 'muted');
    await interaction.editReply(
      `Vote recorded. 👍 **${upvotes}** / 👎 **${downvotes}** — user has been **muted for 1 hour**.`,
    );
  } catch (err) {
    console.error('[Vote] Failed to mute:', err);
    await interaction.editReply(
      `Vote recorded (👍 ${upvotes} / 👎 ${downvotes}). Mute threshold reached but could not timeout the user.`,
    );
  }
}

async function applyBlock(
  interaction: ButtonInteraction,
  targetId: string,
  concernId: string,
  upvotes: number,
  downvotes: number,
): Promise<void> {
  if (!interaction.guild) {
    await interaction.editReply('Cannot block outside of a guild.');
    return;
  }
  try {
    const member = await interaction.guild.members.fetch(targetId);
    await member.ban({
      reason: `Community concern: ${upvotes} upvotes / ${downvotes} downvotes.`,
    });
    await updateConcernStatus(concernId, 'actioned', 'blocked');
    await interaction.editReply(
      `Vote recorded. 👍 **${upvotes}** / 👎 **${downvotes}** — user has been **blocked** from the server.`,
    );
  } catch (err) {
    console.error('[Vote] Failed to block:', err);
    await interaction.editReply(
      `Vote recorded (👍 ${upvotes} / 👎 ${downvotes}). Block threshold reached but could not ban the user.`,
    );
  }
}
