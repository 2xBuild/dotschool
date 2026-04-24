import { Client, EmbedBuilder, GuildMember } from 'discord.js';
import { verifyMember } from '../lib/verified-access';

export function register(client: Client): void {
  client.on('guildMemberAdd', async (member: GuildMember) => {
    if (member.user.bot) {
      return;
    }

    if (process.env.GUILD_ID && member.guild.id !== process.env.GUILD_ID) {
      return;
    }

    try {
      const result = await verifyMember(member);

      if (result.ok) {
        console.log(
          `[Verification] Auto-verified ${member.user.username} against dotschool profile "${result.matchedProfileUsername}".`,
        );

        const embed = new EmbedBuilder()
          .setTitle('Verification Successful')
          .setDescription(
            `Welcome to **${member.guild.name}**! You've been automatically verified as a dotschool member.`,
          )
          .setColor(0x57f287)
          .addFields(
            { name: 'Matched profile', value: result.matchedProfileUsername, inline: true },
          )
          .setTimestamp();

        await member.user.send({ embeds: [embed] }).catch(() => {});
        return;
      }

      console.log(`[Verification] ${member.user.username} not verified on join: ${result.reason}`);

      const embed = new EmbedBuilder()
        .setTitle('Welcome to ' + member.guild.name)
        .setDescription(
          'We couldn\'t auto-verify your account. To get verified, add your Discord username to your [dotschool profile](https://dotschool.org/profile), then run `/verify` in the server.',
        )
        .setColor(0xfbbf24)
        .setTimestamp();

      await member.user.send({ embeds: [embed] }).catch(() => {});
    } catch (err) {
      console.error(`[Verification] Failed to auto-verify ${member.user.username}:`, err);
    }
  });
}
