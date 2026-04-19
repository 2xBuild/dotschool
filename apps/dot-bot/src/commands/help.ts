import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { Command, InteractionContext } from '../types';

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Learn what commands are available and how to use them'),

  async execute(ctx: InteractionContext): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle('dot-bot Help')
      .setColor(0x5865f2)
      .setDescription('Here is what you can do with the bot in this server.')
      .addFields(
        {
          name: '/verify',
          value:
            'Verify yourself. You must be registered with dotschool first to be part of discord community.',
        },
        {
          name: '/concern',
          value:
            'Raise a concern about a user with a reason and requested action. Voting happens through the buttons on the concern message.',
        },
        {
          name: '/announce',
          value:
            'Post an announcement to a channel. This is limited to admin, volunteer, or owner roles.',
        },
        {
          name: '/tag',
          value:
            'Manage and view user tags. `list` can show tags for a user, while `add` and `remove` are admin-only.',
        },
        {
          name: '/rules',
          value:
            'Read the server guidelines, including what to do and what to avoid.',
        },
        {
          name: 'How concern voting works',
          value:
            'Open a concern message and click the upvote or downvote button. Votes are private to you and you can vote only once per concern.',
        },
      );

    await ctx.reply({ embeds: [embed], flags: 64 });
  },
};

export default command;
