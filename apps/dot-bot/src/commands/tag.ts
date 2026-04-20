import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  Role,
  MessageFlags,
} from 'discord.js';
import { addTag, removeTag, getTagsForUser } from '../database/db';
import { Command } from '../types';

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('tag')
    .setDescription('Manage user tags (synced to Discord roles)')
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Add a tag to a user (admin only)')
        .addUserOption((opt) =>
          opt.setName('user').setDescription('Target user').setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName('tag').setDescription('Tag name').setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('Remove a tag from a user (admin only)')
        .addUserOption((opt) =>
          opt.setName('user').setDescription('Target user').setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName('tag').setDescription('Tag name').setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('list')
        .setDescription("List a user's tags")
        .addUserOption((opt) =>
          opt.setName('user').setDescription('Target user').setRequired(true)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand(true);

    if (subcommand === 'list') {
      await handleList(interaction);
      return;
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({
        content: 'You must be an administrator to add or remove tags.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (subcommand === 'add') {
      await handleAdd(interaction);
    } else if (subcommand === 'remove') {
      await handleRemove(interaction);
    }
  },
};

async function handleList(interaction: ChatInputCommandInteraction): Promise<void> {
  const targetUser = interaction.options.getUser('user', true);
  await interaction.deferReply();
  const tags = await getTagsForUser(targetUser.id);

  const embed = new EmbedBuilder()
    .setTitle(`Tags for ${targetUser.tag}`)
    .setColor(0x57f287)
    .setThumbnail(targetUser.displayAvatarURL());

  if (tags.length === 0) {
    embed.setDescription('This user has no tags.');
  } else {
    embed.setDescription(tags.map((t: { tag: string }) => `• \`${t.tag}\``).join('\n'));
    embed.setFooter({ text: `${tags.length} tag(s) total` });
  }

  await interaction.editReply({ embeds: [embed] });
}

async function handleAdd(interaction: ChatInputCommandInteraction): Promise<void> {
  const targetUser = interaction.options.getUser('user', true);
  const tag = interaction.options.getString('tag', true).toLowerCase().trim();

  await interaction.deferReply();

  const added = await addTag(targetUser.id, tag, interaction.user.id);

  if (!added) {
    await interaction.editReply({
      content: `Failed to add tag \`${tag}\` to <@${targetUser.id}>.`,
    });
    return;
  }

  const roleResult = await syncRole(interaction, targetUser.id, tag, 'add');

  const roleMsg = roleResult.success
    ? ` Discord role \`${tag}\` assigned.`
    : ` (Note: ${roleResult.reason})`;

  await interaction.editReply({
    content: `Tag \`${tag}\` added to <@${targetUser.id}>.${roleMsg}`,
  });
}

async function handleRemove(interaction: ChatInputCommandInteraction): Promise<void> {
  const targetUser = interaction.options.getUser('user', true);
  const tag = interaction.options.getString('tag', true).toLowerCase().trim();

  await interaction.deferReply();

  const removed = await removeTag(targetUser.id, tag);

  if (!removed) {
    await interaction.editReply({
      content: `<@${targetUser.id}> does not have the tag \`${tag}\`.`,
    });
    return;
  }

  const roleResult = await syncRole(interaction, targetUser.id, tag, 'remove');

  const roleMsg = roleResult.success
    ? ` Discord role \`${tag}\` removed.`
    : ` (Note: ${roleResult.reason})`;

  await interaction.editReply({
    content: `Tag \`${tag}\` removed from <@${targetUser.id}>.${roleMsg}`,
  });
}

interface SyncResult {
  success: boolean;
  reason?: string;
}

async function syncRole(
  interaction: ChatInputCommandInteraction,
  targetUserId: string,
  tag: string,
  action: 'add' | 'remove'
): Promise<SyncResult> {
  if (!interaction.guild) {
    return { success: false, reason: 'Not in a guild.' };
  }

  const role = interaction.guild.roles.cache.find(
    (r: Role) => r.name.toLowerCase() === tag.toLowerCase()
  );

  if (!role) {
    return {
      success: false,
      reason: `No Discord role named \`${tag}\` found. Role sync skipped.`,
    };
  }

  try {
    const member = await interaction.guild.members.fetch(targetUserId);

    if (action === 'add') {
      await member.roles.add(role, `Tag \`${tag}\` added by ${interaction.user.tag}`);
    } else {
      await member.roles.remove(role, `Tag \`${tag}\` removed by ${interaction.user.tag}`);
    }

    return { success: true };
  } catch (err) {
    console.error('[tag] Role sync failed:', err);
    return {
      success: false,
      reason: 'Could not modify role — check bot role hierarchy and permissions.',
    };
  }
}

export default command;
