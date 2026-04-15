import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
} from 'discord.js';
import type { InferSelectModel } from 'drizzle-orm';
import { botConcerns } from '@repo/db/schema';
import { getConcern } from '../database/db';
import { MIN_VOTERS_FOR_MUTE, HEALTHY_RATIO } from './concern-vote-thresholds';

export type ConcernRow = InferSelectModel<typeof botConcerns>;

const EMBED_FIELD_MAX = 1024;

function truncateField(value: string, max = EMBED_FIELD_MAX): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

function statusField(concern: ConcernRow): string {
  const up = concern.upvoteCount;
  const down = concern.downvoteCount;
  const total = up + down;

  if (concern.status === 'open') {
    return truncateField(
      `Open  **${up}** / 👎 **${down}** (${total} total voter${total === 1 ? '' : 's'}) · Requested action: **${concern.requestedAction}**\nMute at **${MIN_VOTERS_FOR_MUTE}** voters · Full action requires **10%** of members with **${HEALTHY_RATIO}x** ratio`,
    );
  }
  const action = concern.actionTaken
    ? ` (${concern.actionTaken})`
    : '';
  return truncateField(`**${concern.status}**${action} • ⬆️ **${up}** / ⬇️ **${down}**`);
}

/** Embed for the public concern board message (kept in sync as votes come in). */
export function buildConcernEmbed(concern: ConcernRow): EmbedBuilder {
  const reporterValue = concern.reporterAnonymous
    ? 'Anonymous'
    : `<@${concern.reporterId}>`;

  return new EmbedBuilder()
    .setTitle('New concern raised')
    .setColor(concern.status === 'open' ? 0xed4245 : 0x99aab5)
    .addFields(
      { name: 'Concern ID', value: concern.id.slice(0, 8), inline: true },
      { name: 'Reported by', value: reporterValue, inline: true },
      { name: 'Against', value: `<@${concern.targetId}>`, inline: true },
      { name: 'Reason', value: truncateField(concern.reason) },
      { name: 'Requested Action', value: concern.requestedAction, inline: true },
      { name: 'Status', value: statusField(concern), inline: false },
    )
    .setFooter({
      text:
        concern.status === 'open'
          ? 'Use ⬆️ to support or ⬇️ to reject.'
          : 'This concern is closed.',
    })
    .setTimestamp(concern.createdAt);
}

/** Upvote / Downvote buttons while open; components cleared when closed. */
export function buildConcernComponents(concern: ConcernRow): ActionRowBuilder<ButtonBuilder>[] {
  if (concern.status !== 'open') {
    return [];
  }

  const up = concern.upvoteCount;
  const down = concern.downvoteCount;

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`upvote_concern_${concern.id}`)
      .setLabel(`Upvote · ${up}`.slice(0, 80))
      .setStyle(ButtonStyle.Success)
      .setEmoji('⬆️'),
    new ButtonBuilder()
      .setCustomId(`downvote_concern_${concern.id}`)
      .setLabel(`Downvote · ${down}`.slice(0, 80))
      .setStyle(ButtonStyle.Danger)
      .setEmoji('⬇️'),
  );

  return [row];
}

/** Re-fetch concern from DB and edit the board message (channel/message ids must be set). */
export async function refreshConcernBoardMessage(
  client: Client,
  concernId: string,
): Promise<void> {
  const concern = await getConcern(concernId);
  if (!concern?.channelId || !concern.messageId) return;

  try {
    const raw = await client.channels.fetch(concern.channelId);
    if (!raw?.isTextBased()) return;

    const message = await raw.messages.fetch(concern.messageId);
    await message.edit({
      embeds: [buildConcernEmbed(concern)],
      components: buildConcernComponents(concern),
    });
  } catch (err) {
    console.error('[concern] refreshConcernBoardMessage failed:', err);
  }
}
