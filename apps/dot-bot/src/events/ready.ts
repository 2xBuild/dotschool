import { Client, ActivityType } from 'discord.js';
import { initializeVerifiedAccess } from '../lib/verified-access';

export function register(client: Client): void {
  client.once('clientReady', async (readyClient) => {
    console.log(`[Ready] Logged in as ${readyClient.user.tag}`);

    readyClient.user.setPresence({
      status: 'online',
      activities: [
        {
          name: 'the community',
          type: ActivityType.Watching,
        },
      ],
    });

    const guildId = process.env.GUILD_ID;
    if (!guildId) {
      return;
    }

    try {
      const guild = await readyClient.guilds.fetch(guildId);
      const { roleCreatedOrFound, generalLocked } = await initializeVerifiedAccess(guild);

      console.log(
        `[Ready] Verified role ready as "${roleCreatedOrFound.name}". #general restricted: ${generalLocked ? 'yes' : 'no'}.`,
      );
    } catch (err) {
      console.error('[Ready] Failed to initialize verified access:', err);
    }
  });
}
