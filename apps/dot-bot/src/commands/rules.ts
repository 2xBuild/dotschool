import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { Command, InteractionContext } from '../types';

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Read the server rules and expected behavior'),

  async execute(ctx: InteractionContext): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle('Server Rules')
      .setColor(0xed4245)
      .setDescription(
        'Please follow these guidelines to keep the server safe, respectful, and useful for everyone.',
      )
      .addFields(
        {
          name: 'What to do',
          value: [
            '• Be respectful and constructive.',
            '• Keep discussions relevant to the server.',
            '• Report issues through the proper channels.',
            '• Use concern voting honestly and in good faith.',
            '• Follow moderator instructions when asked.',
          ].join('\n'),
        },
        {
          name: 'What not to do',
          value: [
            '• Do not harass, insult, or threaten anyone.',
            '• Do not spam, flood channels, or post disruptive content.',
            '• Do not misuse concerns or voting to target someone unfairly.',
            '• Do not share private or sensitive information.',
            '• Do not evade moderation actions or encourage others to do so.',
          ].join('\n'),
        },
        {
          name: 'If you are unsure',
          value:
            'Ask a moderator before acting. When in doubt, choose the respectful and safer option.',
        },
      );

    await ctx.reply({ embeds: [embed], flags: 64 });
  },
};

export default command;
