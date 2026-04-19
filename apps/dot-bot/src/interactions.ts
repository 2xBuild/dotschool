import crypto from 'node:crypto';
import type http from 'node:http';
import { config } from './config';
import { rest } from './discord';
import commands from './commands';
import { handleConcernVote } from './handlers/concern-vote';
import type {
  InteractionContext,
  InteractionUser,
  ButtonContext,
  ReplyData,
} from './types';

// ---- Signature verification (Ed25519) ----

let cachedKey: crypto.KeyObject | null = null;

function getPublicKey(): crypto.KeyObject {
  if (cachedKey) return cachedKey;
  const der = Buffer.concat([
    Buffer.from('302a300506032b6570032100', 'hex'), // Ed25519 SPKI DER prefix
    Buffer.from(config.publicKey, 'hex'),
  ]);
  cachedKey = crypto.createPublicKey({ key: der, format: 'der', type: 'spki' });
  return cachedKey;
}

export function verifyKey(
  rawBody: string,
  signature: string,
  timestamp: string,
): boolean {
  try {
    return crypto.verify(
      null,
      Buffer.from(timestamp + rawBody),
      getPublicKey(),
      Buffer.from(signature, 'hex'),
    );
  } catch {
    return false;
  }
}

// ---- Option accessor ----

class OptionAccessor {
  private options: any[];
  private resolved: any;
  private subcommandName: string | null;

  constructor(data: any) {
    this.resolved = data?.resolved ?? {};

    const first = data?.options?.[0];
    if (first?.type === 1) {
      // SUB_COMMAND
      this.subcommandName = first.name;
      this.options = first.options ?? [];
    } else {
      this.subcommandName = null;
      this.options = data?.options ?? [];
    }
  }

  getSubcommand(required?: boolean): string {
    if (!this.subcommandName && required) throw new Error('No subcommand');
    return this.subcommandName!;
  }

  getString(name: string, required?: boolean): string | null {
    const opt = this.options.find((o: any) => o.name === name);
    if (!opt && required) throw new Error(`Missing option: ${name}`);
    return opt?.value ?? null;
  }

  getUser(name: string, required?: boolean): InteractionUser | null {
    const opt = this.options.find((o: any) => o.name === name);
    if (!opt && required) throw new Error(`Missing option: ${name}`);
    if (!opt) return null;
    const userId = opt.value as string;
    const resolved = this.resolved.users?.[userId];
    return {
      id: resolved?.id ?? userId,
      username: resolved?.username ?? 'unknown',
      avatar: resolved?.avatar ?? null,
    };
  }

  getChannel(
    name: string,
  ): { id: string; name: string; type: number } | null {
    const opt = this.options.find((o: any) => o.name === name);
    if (!opt) return null;
    const channelId = opt.value as string;
    const resolved = this.resolved.channels?.[channelId];
    return resolved
      ? { id: resolved.id, name: resolved.name, type: resolved.type }
      : null;
  }

  getBoolean(name: string): boolean | null {
    const opt = this.options.find((o: any) => o.name === name);
    return opt?.value ?? null;
  }
}

// ---- Response formatting ----

function formatReply(data: ReplyData): Record<string, unknown> {
  if (typeof data === 'string') return { content: data };
  const result: Record<string, unknown> = {};
  if (data.content !== undefined) result.content = data.content;
  if (data.embeds) {
    result.embeds = data.embeds.map((e: any) =>
      typeof e.toJSON === 'function' ? e.toJSON() : e,
    );
  }
  if (data.components) {
    result.components = data.components.map((c: any) =>
      typeof c.toJSON === 'function' ? c.toJSON() : c,
    );
  }
  if (data.flags !== undefined) result.flags = data.flags;
  return result;
}

// ---- Context factories ----

function createInteractionContext(
  payload: any,
  httpRes: http.ServerResponse,
): InteractionContext {
  let responseSent = false;

  function sendHttp(data: unknown) {
    if (responseSent) return;
    responseSent = true;
    httpRes.writeHead(200, { 'Content-Type': 'application/json' });
    httpRes.end(JSON.stringify(data));
  }

  const user = payload.member?.user ?? payload.user;
  const bits = BigInt(payload.member?.permissions ?? '0');

  return {
    user: {
      id: user.id,
      username: user.username,
      avatar: user.avatar ?? null,
    },
    guildId: payload.guild_id,
    channelId: payload.channel_id,
    memberPermissions: { has: (flag: bigint) => (bits & flag) === flag },
    memberRoles: payload.member?.roles ?? [],
    options: new OptionAccessor(payload.data),

    async reply(data) {
      sendHttp({ type: 4, data: formatReply(data) });
    },

    async deferReply(opts) {
      sendHttp({
        type: 5,
        data: opts?.ephemeral ? { flags: 64 } : {},
      });
    },

    async editReply(data) {
      await rest.patch(
        `/webhooks/${config.clientId}/${payload.token}/messages/@original` as `/${string}`,
        { body: formatReply(data) },
      );
    },

    async followUp(data) {
      await rest.post(
        `/webhooks/${config.clientId}/${payload.token}` as `/${string}`,
        { body: formatReply(data) },
      );
    },
  };
}

function createButtonContext(
  payload: any,
  httpRes: http.ServerResponse,
): ButtonContext {
  let responseSent = false;

  function sendHttp(data: unknown) {
    if (responseSent) return;
    responseSent = true;
    httpRes.writeHead(200, { 'Content-Type': 'application/json' });
    httpRes.end(JSON.stringify(data));
  }

  const user = payload.member?.user ?? payload.user;

  return {
    customId: payload.data.custom_id,
    user: {
      id: user.id,
      username: user.username,
      avatar: user.avatar ?? null,
    },
    guildId: payload.guild_id,
    channelId: payload.channel_id,
    messageId: payload.message?.id,

    async reply(data) {
      sendHttp({ type: 4, data: formatReply(data) });
    },

    async deferReply(opts) {
      sendHttp({
        type: 5,
        data: opts?.ephemeral ? { flags: 64 } : {},
      });
    },

    async editReply(data) {
      await rest.patch(
        `/webhooks/${config.clientId}/${payload.token}/messages/@original` as `/${string}`,
        { body: formatReply(data) },
      );
    },
  };
}

// ---- Main interaction handler ----

export async function handleInteraction(
  rawBody: string,
  res: http.ServerResponse,
): Promise<void> {
  const payload = JSON.parse(rawBody);

  // PING — required for Discord endpoint verification
  if (payload.type === 1) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ type: 1 }));
    return;
  }

  // APPLICATION_COMMAND
  if (payload.type === 2) {
    const commandName: string = payload.data?.name;
    const command = commands.find((c) => c.data.name === commandName);

    if (!command) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          type: 4,
          data: { content: 'Unknown command.', flags: 64 },
        }),
      );
      return;
    }

    const ctx = createInteractionContext(payload, res);
    try {
      await command.execute(ctx);
    } catch (err) {
      console.error(`[Command] Error in /${commandName}:`, err);
      const errorBody = {
        content: 'An error occurred while running this command.',
        flags: 64,
      };
      if (res.headersSent) {
        try {
          await rest.patch(
            `/webhooks/${config.clientId}/${payload.token}/messages/@original` as `/${string}`,
            { body: errorBody },
          );
        } catch (e) {
          console.error('[Command] Failed to send error followup:', e);
        }
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ type: 4, data: errorBody }));
      }
    }
    return;
  }

  // MESSAGE_COMPONENT (buttons)
  if (payload.type === 3) {
    const ctx = createButtonContext(payload, res);
    try {
      await handleConcernVote(ctx);
    } catch (err) {
      console.error('[Button] Error handling component:', err);
      if (!res.headersSent) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            type: 4,
            data: { content: 'An error occurred.', flags: 64 },
          }),
        );
      }
    }
    return;
  }

  res.writeHead(400, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Unknown interaction type' }));
}
