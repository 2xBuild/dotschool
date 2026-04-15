import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  TextChannel,
  MessageFlags,
} from 'discord.js';
import { createConcern, getUser, setConcernDiscordPost } from '../database/db';
import { buildConcernComponents, buildConcernEmbed } from '../lib/concern-message';
import { Command } from '../types';

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('concern')
    .setDescription('Raise a concern about a user')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user you are concerned about')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Reason for the concern')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('action')
        .setDescription('Action to take if the community supports this concern')
        .setRequired(true)
        .addChoices(
          { name: 'Mute', value: 'mute' },
          { name: 'Block', value: 'block' },
        ),
    )
    .addBooleanOption((option) =>
      option
        .setName('anonymous')
        .setDescription('Hide your identity in the concern post')
        .setRequired(false),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const targetUser = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);
    const requestedAction = interaction.options.getString('action', true) as 'mute' | 'block';
    const anonymous = interaction.options.getBoolean('anonymous') ?? false;

    if (targetUser.id === interaction.user.id) {
      await interaction.reply({
        content: 'You cannot raise a concern about yourself.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const reporter = await getUser(interaction.user.id);
    if (!reporter) {
      await interaction.editReply({
        content: 'You must be registered to raise a concern. Use `/verify` first.',
      });
      return;
    }

    let concern;
    try {
      concern = await createConcern(
        interaction.user.id,
        targetUser.id,
        reason,
        anonymous,
        requestedAction,
      );
    } catch (err) {
      console.error('[concern] Failed to create concern:', err);
      await interaction.editReply({ content: 'Failed — could not create the concern.' });
      return;
    }

    let postChannel: TextChannel | null = null;

    if (interaction.guild) {
      const found = interaction.guild.channels.cache.find(
        (ch): ch is TextChannel =>
          ch instanceof TextChannel && ch.name === 'concerns',
      );
      postChannel = found ?? null;
    }

    if (!postChannel) {
      postChannel = interaction.channel as TextChannel;
    }

    try {
      const message = await postChannel.send({
        embeds: [buildConcernEmbed(concern)],
        components: buildConcernComponents(concern),
      });
      await setConcernDiscordPost(concern.id, message.channelId, message.id);
      await interaction.editReply({ content: 'Concern created successfully!' });
    } catch (err) {
      console.error('[concern] Failed to post concern embed:', err);
      await interaction.editReply({
        content: 'Failed — concern saved but could not post the embed. Check my channel permissions.',
      });
    }
  },
};

export default command;
