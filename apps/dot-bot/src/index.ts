import 'dotenv/config';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { Command } from './types';

import announceCommand from './commands/announce';
import concernCommand from './commands/concern';
import helpCommand from './commands/help';
import rulesCommand from './commands/rules';
import tagCommand from './commands/tag';
import verifyCommand from './commands/verify';

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

const commands: Command[] = [
  announceCommand,
  concernCommand,
  helpCommand,
  rulesCommand,
  tagCommand,
  verifyCommand,
];

for (const cmd of commands) {
  client.commands.set(cmd.data.name, cmd);
  console.log(`[Commands] Loaded /${cmd.data.name}`);
}

readyEvent.register(client);
guildMemberAddEvent.register(client);
interactionCreateEvent.register(client);

client.login(DISCORD_TOKEN).then(() => {
  startWebhookServer(client);
}).catch((err) => {
  console.error('[Startup] Failed to login:', err);
  process.exit(1);
});
