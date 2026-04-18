import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`[Config] Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
}

export const config = {
  discordToken: required('DISCORD_TOKEN'),
  clientId: required('CLIENT_ID'),
  guildId: required('GUILD_ID'),
  webhookPort: Number(process.env.WEBHOOK_PORT || process.env.PORT) || 3100,
  webhookSecret: process.env.WEBHOOK_SECRET ?? '',
} as const;
