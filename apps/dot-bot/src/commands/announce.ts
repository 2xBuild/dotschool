import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  TextChannel,
  ChannelType,
  MessageFlags,
  GuildMember,
} from 'discord.js';
import { saveAnnouncement } from '../database/db';
import { Command } from '../types';

const ANNOUNCE_ALLOWED_ROLES = new Set(['admin', 'volunteer', 'owner']);

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send an announcement to a channel')
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription('The announcement message')
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Channel to post the announcement in (defaults to current channel)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!(await canSendAnnouncement(interaction))) {
      await interaction.reply({
        content: 'Only admin, volunteer, or owner can use this command.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const message = interaction.options.getString('message', true);
    const targetChannel =
      (interaction.options.getChannel('channel') as TextChannel | null) ??
      (interaction.channel as TextChannel);

    if (!targetChannel || targetChannel.type !== ChannelType.GuildText) {
      await interaction.reply({
        content: 'Could not resolve a valid text channel.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const embed = new EmbedBuilder()
      .setTitle('Announcement')
      .setDescription(message)
      .setColor(0x5865f2)
      .setFooter({ text: 'Anonymous' })
      .setTimestamp();

    try {
      await targetChannel.send({ embeds: [embed] });

      await saveAnnouncement(interaction.user.id, message, targetChannel.id);

      await interaction.editReply({
        content: `Announcement posted in <#${targetChannel.id}>.`,
      });
    } catch (err) {
      console.error('[announce] Failed to send announcement:', err);
      await interaction.editReply({
        content: 'Failed to send the announcement. Check my permissions in that channel.',
      });
    }
  },
};

async function canSendAnnouncement(
  interaction: ChatInputCommandInteraction,
): Promise<boolean> {
  if (interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return true;
  }

  if (!interaction.guild) {
    return false;
  }

  const member =
    interaction.member instanceof GuildMember
      ? interaction.member
      : await interaction.guild.members.fetch(interaction.user.id);

  return member.roles.cache.some((role) =>
    ANNOUNCE_ALLOWED_ROLES.has(role.name.toLowerCase().trim()),
  );
}

export default command;
