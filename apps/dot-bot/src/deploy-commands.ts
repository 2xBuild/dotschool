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
import commands from './commands';

export async function deployCommands(): Promise<RESTPutAPIApplicationGuildCommandsResult> {
  const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

  if (!DISCORD_TOKEN || !CLIENT_ID || !GUILD_ID) {
    throw new Error(
      '[deploy-commands] Missing one or more required env vars: DISCORD_TOKEN, CLIENT_ID, GUILD_ID'
    );
  }

  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
  const commandPayload = commands.map((cmd) => cmd.data.toJSON());

  console.log(
    `[deploy-commands] Registering ${commandPayload.length} slash command(s) to guild ${GUILD_ID}...`,
  );

  const data = (await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commandPayload }
  )) as RESTPutAPIApplicationGuildCommandsResult;

  console.log(`[deploy-commands] Successfully registered ${data.length} command(s):`);
  data.forEach((cmd) => console.log(`  /${cmd.name}`));

  return data;
}

const isDirectRun = process.argv[1]?.includes('deploy-commands.');

if (isDirectRun) {
  deployCommands().catch((err) => {
    console.error('[deploy-commands] Failed to register commands:', err);
    process.exit(1);
  });
}
