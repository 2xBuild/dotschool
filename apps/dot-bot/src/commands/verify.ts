import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import { verifyMember } from '../lib/verified-access';
import { Command } from '../types';

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Verify yourself against the dotschool member database'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!interaction.inCachedGuild()) {
      await interaction.editReply({
        content: 'Verification only works inside the Discord server.',
      });
      return;
    }

    const result = await verifyMember(interaction.member);

    if (!result.ok) {
      await interaction.editReply({
        content:
          `${result.reason} Add the same Discord username to your dotschool profile first, then run \`/verify\` again.`,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('Verification Successful')
      .setDescription(`Welcome, <@${interaction.user.id}>! You now have access as a verified dotschool member.`)
      .setColor(0x57f287)
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        { name: 'Discord username', value: interaction.user.username, inline: true },
        { name: 'Matched profile', value: result.matchedProfileUsername, inline: true },
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};

export default command;
