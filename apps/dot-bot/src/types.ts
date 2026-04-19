import type {
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

// ---- Reply data accepted by ctx.reply / ctx.editReply ----

export type ReplyData =
  | string
  | {
      content?: string;
      embeds?: any[];
      components?: any[];
      flags?: number;
    };

// ---- User info parsed from the interaction payload ----

export interface InteractionUser {
  id: string;
  username: string;
  avatar: string | null;
}

// ---- Context passed to slash-command handlers ----

export interface InteractionContext {
  user: InteractionUser;
  guildId: string;
  channelId: string;
  memberPermissions: { has(flag: bigint): boolean };
  memberRoles: string[];
  options: {
    getSubcommand(required?: boolean): string;
    getString(name: string, required?: boolean): string | null;
    getUser(name: string, required?: boolean): InteractionUser | null;
    getChannel(name: string): { id: string; name: string; type: number } | null;
    getBoolean(name: string): boolean | null;
  };
  reply(data: ReplyData): Promise<void>;
  deferReply(opts?: { ephemeral?: boolean }): Promise<void>;
  editReply(data: ReplyData): Promise<void>;
  followUp(data: ReplyData): Promise<void>;
}

// ---- Context passed to button-interaction handlers ----

export interface ButtonContext {
  customId: string;
  user: InteractionUser;
  guildId: string;
  channelId: string;
  messageId: string;
  reply(data: ReplyData): Promise<void>;
  deferReply(opts?: { ephemeral?: boolean }): Promise<void>;
  editReply(data: ReplyData): Promise<void>;
}

// ---- Slash-command definition ----

export interface Command {
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  execute: (ctx: InteractionContext) => Promise<void>;
}

// ---- Helpers ----

export function avatarUrl(user: { id: string; avatar: string | null }): string {
  if (user.avatar) {
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
  }
  const index = Number(BigInt(user.id) >> 22n) % 6;
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}
