import {
  Client,
  Interaction,
  ChatInputCommandInteraction,
  MessageFlags,
  type InteractionReplyOptions,
} from 'discord.js';
import { handleConcernVote } from '../handlers/concern-vote';

export function register(client: Client): void {
  client.on('interactionCreate', async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      await handleSlashCommand(interaction);
      return;
    }

    if (interaction.isButton()) {
      await handleConcernVote(interaction);
      return;
    }
  });
}

async function handleSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.warn(`[Command] Unknown: /${interaction.commandName}`);
    await interaction.reply({
      content: 'Unknown command.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`[Command] Error in /${interaction.commandName}:`, err);

    const errorMsg: InteractionReplyOptions = {
      content: 'An error occurred while running this command.',
      flags: MessageFlags.Ephemeral,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMsg).catch(console.error);
    } else {
      await interaction.reply(errorMsg).catch(console.error);
    }
  }
}
