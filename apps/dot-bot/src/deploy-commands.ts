/**
 * deploy-commands.ts
 *
 * Registers all slash commands with Discord via the REST API.
 * Run once (or whenever commands change):
 *
 *   npm run deploy
 *
 * Requires DISCORD_TOKEN, CLIENT_ID, and GUILD_ID in .env.
 * Commands are registered to the specific guild for instant availability.
 * To deploy globally (up to 1 hour propagation), remove the guild route.
 */

import 'dotenv/config';
import { REST, Routes, RESTPutAPIApplicationGuildCommandsResult } from 'discord.js';

import announceCommand from './commands/announce';
import concernCommand from './commands/concern';
import helpCommand from './commands/help';
import rulesCommand from './commands/rules';
import tagCommand from './commands/tag';
import verifyCommand from './commands/verify';

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error(
    '[deploy-commands] Missing one or more required env vars: DISCORD_TOKEN, CLIENT_ID, GUILD_ID'
  );
  process.exit(1);
}

const commands = [
  announceCommand,
  concernCommand,
  helpCommand,
  rulesCommand,
  tagCommand,
  verifyCommand,
].map((cmd) => cmd.data.toJSON());

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log(`[deploy-commands] Registering ${commands.length} slash command(s) to guild ${GUILD_ID}...`);

    const data = (await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    )) as RESTPutAPIApplicationGuildCommandsResult;

    console.log(`[deploy-commands] Successfully registered ${data.length} command(s):`);
    data.forEach((cmd) => console.log(`  /${cmd.name}`));
  } catch (err) {
    console.error('[deploy-commands] Failed to register commands:', err);
    process.exit(1);
  }
})();
