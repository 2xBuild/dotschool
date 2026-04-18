import { config } from './config';
import { REST, Routes, type RESTPutAPIApplicationGuildCommandsResult } from 'discord.js';
import commands from './commands';

export async function deployCommands(): Promise<RESTPutAPIApplicationGuildCommandsResult> {
  const rest = new REST({ version: '10' }).setToken(config.discordToken);
  const payload = commands.map((cmd) => cmd.data.toJSON());

  console.log(
    `[Commands] Registering ${payload.length} command(s) to guild ${config.guildId}...`,
  );

  const data = (await rest.put(
    Routes.applicationGuildCommands(config.clientId, config.guildId),
    { body: payload },
  )) as RESTPutAPIApplicationGuildCommandsResult;

  console.log(`[Commands] Registered ${data.length} command(s)`);
  return data;
}

if (process.argv[1]?.includes('deploy-commands')) {
  deployCommands().catch((err) => {
    console.error('[Commands] Failed:', err);
    process.exit(1);
  });
}
