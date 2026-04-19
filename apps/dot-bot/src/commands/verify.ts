import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { verifyMember } from '../lib/verified-access';
import type { Command, InteractionContext } from '../types';
import { avatarUrl } from '../types';

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Verify yourself against the dotschool member database'),

  async execute(ctx: InteractionContext): Promise<void> {
    await ctx.deferReply({ ephemeral: true });

    if (!ctx.guildId) {
      await ctx.editReply({
        content: 'Verification only works inside the Discord server.',
      });
      return;
    }

    const result = await verifyMember(
      ctx.guildId,
      ctx.user.id,
      ctx.user.username,
      ctx.memberRoles,
    );

    if (!result.ok) {
      await ctx.editReply({
        content: `${result.reason} Add the same Discord username to your dotschool profile first, then run \`/verify\` again.`,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('Verification Successful')
      .setDescription(
        `Welcome, <@${ctx.user.id}>! You now have access as a verified dotschool member.`,
      )
      .setColor(0x57f287)
      .setThumbnail(avatarUrl(ctx.user))
      .addFields(
        {
          name: 'Discord username',
          value: ctx.user.username,
          inline: true,
        },
        {
          name: 'Matched profile',
          value: result.matchedProfileUsername,
          inline: true,
        },
      )
      .setTimestamp();

    await ctx.editReply({ embeds: [embed] });
  },
};

export default command;
