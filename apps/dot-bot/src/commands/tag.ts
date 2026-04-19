import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import { addTag, removeTag, getTagsForUser } from '../database/db';
import { findRole } from '../lib/roles';
import {
  addRole as addDiscordRole,
  removeRole as removeDiscordRole,
} from '../discord';
import type { Command, InteractionContext } from '../types';
import { avatarUrl } from '../types';

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('tag')
    .setDescription('Manage user tags (synced to Discord roles)')
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Add a tag to a user (admin only)')
        .addUserOption((opt) =>
          opt.setName('user').setDescription('Target user').setRequired(true),
        )
        .addStringOption((opt) =>
          opt.setName('tag').setDescription('Tag name').setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('Remove a tag from a user (admin only)')
        .addUserOption((opt) =>
          opt.setName('user').setDescription('Target user').setRequired(true),
        )
        .addStringOption((opt) =>
          opt.setName('tag').setDescription('Tag name').setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('list')
        .setDescription("List a user's tags")
        .addUserOption((opt) =>
          opt.setName('user').setDescription('Target user').setRequired(true),
        ),
    ),

  async execute(ctx: InteractionContext): Promise<void> {
    const subcommand = ctx.options.getSubcommand(true);

    if (subcommand === 'list') {
      await handleList(ctx);
      return;
    }

    if (!ctx.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      await ctx.reply({
        content: 'You must be an administrator to add or remove tags.',
        flags: 64,
      });
      return;
    }

    if (subcommand === 'add') {
      await handleAdd(ctx);
    } else if (subcommand === 'remove') {
      await handleRemove(ctx);
    }
  },
};

async function handleList(ctx: InteractionContext): Promise<void> {
  const targetUser = ctx.options.getUser('user', true)!;
  await ctx.deferReply();

  const tags = await getTagsForUser(targetUser.id);

  const embed = new EmbedBuilder()
    .setTitle(`Tags for ${targetUser.username}`)
    .setColor(0x57f287)
    .setThumbnail(avatarUrl(targetUser));

  if (tags.length === 0) {
    embed.setDescription('This user has no tags.');
  } else {
    embed.setDescription(
      tags.map((t: { tag: string }) => `• \`${t.tag}\``).join('\n'),
    );
    embed.setFooter({ text: `${tags.length} tag(s) total` });
  }

  await ctx.editReply({ embeds: [embed] });
}

async function handleAdd(ctx: InteractionContext): Promise<void> {
  const targetUser = ctx.options.getUser('user', true)!;
  const tag = ctx.options.getString('tag', true)!.toLowerCase().trim();

  await ctx.deferReply();

  const added = await addTag(targetUser.id, tag, ctx.user.id);

  if (!added) {
    await ctx.editReply({
      content: `Failed to add tag \`${tag}\` to <@${targetUser.id}>.`,
    });
    return;
  }

  const roleResult = await syncRole(
    ctx.guildId,
    targetUser.id,
    tag,
    'add',
    ctx.user.username,
  );

  const roleMsg = roleResult.success
    ? ` Discord role \`${tag}\` assigned.`
    : ` (Note: ${roleResult.reason})`;

  await ctx.editReply({
    content: `Tag \`${tag}\` added to <@${targetUser.id}>.${roleMsg}`,
  });
}

async function handleRemove(ctx: InteractionContext): Promise<void> {
  const targetUser = ctx.options.getUser('user', true)!;
  const tag = ctx.options.getString('tag', true)!.toLowerCase().trim();

  await ctx.deferReply();

  const removed = await removeTag(targetUser.id, tag);

  if (!removed) {
    await ctx.editReply({
      content: `<@${targetUser.id}> does not have the tag \`${tag}\`.`,
    });
    return;
  }

  const roleResult = await syncRole(
    ctx.guildId,
    targetUser.id,
    tag,
    'remove',
    ctx.user.username,
  );

  const roleMsg = roleResult.success
    ? ` Discord role \`${tag}\` removed.`
    : ` (Note: ${roleResult.reason})`;

  await ctx.editReply({
    content: `Tag \`${tag}\` removed from <@${targetUser.id}>.${roleMsg}`,
  });
}

interface SyncResult {
  success: boolean;
  reason?: string;
}

async function syncRole(
  guildId: string,
  targetUserId: string,
  tag: string,
  action: 'add' | 'remove',
  actorUsername: string,
): Promise<SyncResult> {
  if (!guildId) return { success: false, reason: 'Not in a guild.' };

  const role = await findRole(guildId, tag);
  if (!role)
    return { success: false, reason: `No Discord role named \`${tag}\` found.` };

  try {
    if (action === 'add') {
      await addDiscordRole(
        guildId,
        targetUserId,
        role.id,
        `Tag "${tag}" added by ${actorUsername}`,
      );
    } else {
      await removeDiscordRole(
        guildId,
        targetUserId,
        role.id,
        `Tag "${tag}" removed by ${actorUsername}`,
      );
    }
    return { success: true };
  } catch (err) {
    console.error('[Tag] Role sync failed:', err);
    return {
      success: false,
      reason:
        'Could not modify role — check bot role hierarchy and permissions.',
    };
  }
}

export default command;
