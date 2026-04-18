import { config } from './config';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import type { Command } from './types';
import commands from './commands';
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

let server: ReturnType<typeof startServer>;

const shutdown = () => {
  console.log('[Shutdown] Graceful shutdown...');
  client.destroy();
  server?.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

async function main(): Promise<void> {
  server = startServer(client);

  client.on('error', (err) => console.error('[Client] Error:', err));
  client.on('warn', (msg) => console.warn('[Client] Warning:', msg));

  console.log('[Startup] Logging in to Discord...');
  await client.login(config.discordToken);
  console.log('[Startup] Bot connected to Discord gateway');
}

main().catch((err) => {
  console.error('[Startup] Fatal error:', err);
  process.exit(1);
});
