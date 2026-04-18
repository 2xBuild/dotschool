import { config } from './config';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import type { Command } from './types';
import commands from './commands';
import { deployCommands } from './deploy-commands';
import * as readyEvent from './events/ready';
import * as guildMemberAddEvent from './events/guildMemberAdd';
import * as interactionCreateEvent from './events/interactionCreate';
import { startServer } from './server';

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
}

readyEvent.register(client);
guildMemberAddEvent.register(client);
interactionCreateEvent.register(client);

async function main(): Promise<void> {
  const server = startServer(client);

  // Deploy commands in background — don't block gateway login
  deployCommands().catch((err) => {
    console.error('[Startup] Failed to deploy commands (non-fatal):', err);
  });

  await client.login(config.discordToken);
  console.log('[Startup] Bot connected to Discord gateway');

  const shutdown = () => {
    console.log('[Shutdown] Graceful shutdown...');
    client.destroy();
    server.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  console.error('[Startup] Fatal error:', err);
  process.exit(1);
});
