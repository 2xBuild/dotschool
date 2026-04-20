import { Client, GuildMember } from 'discord.js';
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
          `[Verification] Auto-verified ${member.user.username} against dot.school profile "${result.matchedProfileUsername}".`,
        );
        return;
      }

      console.log(`[Verification] ${member.user.username} not verified on join: ${result.reason}`);
    } catch (err) {
      console.error(`[Verification] Failed to auto-verify ${member.user.username}:`, err);
    }
  });
}
