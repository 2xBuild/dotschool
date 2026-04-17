const DEFAULT_DISCORD_INVITE_URL = "https://discord.gg/dotschool";

export const DISCORD_INVITE_URL =
  process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || DEFAULT_DISCORD_INVITE_URL;
