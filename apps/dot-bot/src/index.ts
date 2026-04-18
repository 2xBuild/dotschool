import 'dotenv/config';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { Command } from './types';
import commands from './commands';
import { deployCommands } from './deploy-commands';

import * as readyEvent from './events/ready';
import * as guildMemberAddEvent from './events/guildMemberAdd';
import * as interactionCreateEvent from './events/interactionCreate';

import { startWebhookServer } from './webhook';

const { DISCORD_TOKEN } = process.env;

if (!DISCORD_TOKEN) {
  console.error('[Startup] Missing DISCORD_TOKEN in environment. Check your .env file.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection<string, Command>();

for (const cmd of commands) {
  client.commands.set(cmd.data.name, cmd);
  console.log(`[Commands] Loaded /${cmd.data.name}`);
}

readyEvent.register(client);
guildMemberAddEvent.register(client);
interactionCreateEvent.register(client);

async function main(): Promise<void> {
  // Start HTTP server first so Render detects the port immediately
  startWebhookServer(client);

  try {
    await deployCommands();
  } catch (err) {
    console.error('[Startup] Failed to deploy commands (non-fatal):', err);
  }

  try {
    await client.login(DISCORD_TOKEN);
    console.log('[Startup] Discord client logged in');
  } catch (err) {
    console.error('[Startup] Failed to login to Discord:', err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[Startup] Unexpected error:', err);
});
