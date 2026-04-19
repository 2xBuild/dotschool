import { SlashCommandBuilder, ChannelType } from 'discord.js';
import { createConcern, getUser, setConcernDiscordPost } from '../database/db';
import {
  buildConcernComponents,
  buildConcernEmbed,
} from '../lib/concern-message';
import { sendMessage, fetchChannels } from '../discord';
import type { Command, InteractionContext } from '../types';

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
        .setDescription(
          'Action to take if the community supports this concern',
        )
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

  async execute(ctx: InteractionContext): Promise<void> {
    const targetUser = ctx.options.getUser('user', true)!;
    const reason = ctx.options.getString('reason', true)!;
    const requestedAction = ctx.options.getString('action', true)! as
      | 'mute'
      | 'block';
    const anonymous = ctx.options.getBoolean('anonymous') ?? false;

    if (targetUser.id === ctx.user.id) {
      await ctx.reply({
        content: 'You cannot raise a concern about yourself.',
        flags: 64,
      });
      return;
    }

    await ctx.deferReply({ ephemeral: true });

    const reporter = await getUser(ctx.user.id);
    if (!reporter) {
      await ctx.editReply({
        content:
          'You must be registered to raise a concern. Use `/verify` first.',
      });
      return;
    }

    let concern;
    try {
      concern = await createConcern(
        ctx.user.id,
        targetUser.id,
        reason,
        anonymous,
        requestedAction,
      );
    } catch (err) {
      console.error('[concern] Failed to create concern:', err);
      await ctx.editReply({
        content: 'Failed — could not create the concern.',
      });
      return;
    }

    // Find the #concerns channel, fall back to current channel
    let channelId = ctx.channelId;
    if (ctx.guildId) {
      const channels = await fetchChannels(ctx.guildId);
      const found = channels.find(
        (ch) =>
          ch.type === ChannelType.GuildText && ch.name === 'concerns',
      );
      if (found) channelId = found.id;
    }

    try {
      const msg = await sendMessage(channelId, {
        embeds: [buildConcernEmbed(concern).toJSON()],
        components: buildConcernComponents(concern).map((c) => c.toJSON()),
      });
      await setConcernDiscordPost(concern.id, msg.channel_id, msg.id);
      await ctx.editReply({ content: 'Concern created successfully!' });
    } catch (err) {
      console.error('[concern] Failed to post concern embed:', err);
      await ctx.editReply({
        content:
          'Failed — concern saved but could not post the embed. Check my channel permissions.',
      });
    }
  },
};

export default command;
