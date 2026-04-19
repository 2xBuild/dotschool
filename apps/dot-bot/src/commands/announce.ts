import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits,
} from 'discord.js';
import { saveAnnouncement } from '../database/db';
import { sendMessage, fetchRoles } from '../discord';
import type { Command, InteractionContext } from '../types';

const ANNOUNCE_ALLOWED_ROLES = new Set(['admin', 'volunteer', 'owner']);

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send an announcement to a channel')
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription('The announcement message')
        .setRequired(true),
    )
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription(
          'Channel to post the announcement in (defaults to current channel)',
        )
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false),
    ),

  async execute(ctx: InteractionContext): Promise<void> {
    if (!(await canSendAnnouncement(ctx))) {
      await ctx.reply({
        content: 'Only admin, volunteer, or owner can use this command.',
        flags: 64,
      });
      return;
    }

    const message = ctx.options.getString('message', true)!;
    const targetChannel = ctx.options.getChannel('channel');
    const channelId = targetChannel?.id ?? ctx.channelId;

    await ctx.deferReply({ ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle('Announcement')
      .setDescription(message)
      .setColor(0x5865f2)
      .setFooter({ text: 'Anonymous' })
      .setTimestamp();

    try {
      await sendMessage(channelId, { embeds: [embed.toJSON()] });
      await saveAnnouncement(ctx.user.id, message, channelId);
      await ctx.editReply({
        content: `Announcement posted in <#${channelId}>.`,
      });
    } catch (err) {
      console.error('[announce] Failed to send announcement:', err);
      await ctx.editReply({
        content:
          'Failed to send the announcement. Check my permissions in that channel.',
      });
    }
  },
};

async function canSendAnnouncement(
  ctx: InteractionContext,
): Promise<boolean> {
  if (ctx.memberPermissions.has(PermissionFlagsBits.Administrator)) {
    return true;
  }

  if (!ctx.guildId) return false;

  const guildRoles = await fetchRoles(ctx.guildId);
  const memberRoleSet = new Set(ctx.memberRoles);
  return guildRoles.some(
    (role) =>
      memberRoleSet.has(role.id) &&
      ANNOUNCE_ALLOWED_ROLES.has(role.name.toLowerCase().trim()),
  );
}

export default command;
