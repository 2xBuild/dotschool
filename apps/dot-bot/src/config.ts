import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[Config] Missing required env var: ${name}`);
  }
  return value;
}

export const config = {
  discordToken: required('DISCORD_TOKEN'),
  clientId: required('CLIENT_ID'),
  guildId: required('GUILD_ID'),
  publicKey: process.env.APPLICATION_PUBLIC_KEY ?? '',
  webhookPort: Number(process.env.WEBHOOK_PORT || process.env.PORT) || 3100,
  webhookSecret: process.env.WEBHOOK_SECRET ?? '',
  verifiedRoleId: process.env.VERIFIED_ROLE_ID ?? '',
} as const;
