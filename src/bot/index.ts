import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  REST,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from "discord.js";
import { env } from "../lib/env";
import { logger } from "../lib/logger";
import type { BotClient } from "../types/discord";
import commands from "./commands";

/**
 * Where an app can be installed, also called its supported
 * [installation contexts](https://discord.com/developers/docs/resources/application#installation-context)
 */
export enum IntegrationType {
  /** App is installable to servers */
  GUILD_INSTALL,
  /** App is installable to users */
  USER_INSTALL
}

/**
 * Context in Discord where an interaction can be used, or where it was triggered from. Details about using interaction
 * contexts for application commands is in the
 * [commands context documentation](https://discord.com/developers/docs/interactions/application-commands#interaction-contexts)
 */
export enum InteractionContextType {
  /** Interaction can be used within servers */
  GUILD,
  /** Interaction can be used within DMs with the app's bot user */
  BOT_DM,
  /** Interaction can be used within Group DMs and DMs other than the app's bot user */
  PRIVATE_CHANNEL
}

/**
 * Patched JSON type to include integration_types and contexts
 */
export interface PatchedSlashCommandJSON extends RESTPostAPIChatInputApplicationCommandsJSONBody {
  integration_types?: IntegrationType[],
  contexts?: InteractionContextType[]
}

export const deployCommands = async () => {
  try {
    logger.info(`Started refreshing ${commands.length} application (/) commands.`);
    const body = commands.map(c => ({
      ...c.data.toJSON(),
      integration_types: [ IntegrationType.GUILD_INSTALL, IntegrationType.USER_INSTALL ],
      contexts: [ InteractionContextType.GUILD, InteractionContextType.BOT_DM, InteractionContextType.PRIVATE_CHANNEL ]
    }) as PatchedSlashCommandJSON);
    const data = await global.rest.put(
      Routes.applicationCommands(env.DISCORD_CLIENT_ID),
      { body },
    ) as any[];
    logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    logger.error(error);
  }
};

export const initializeBot = () => {
  if (global.client !== undefined) {
    return;
  }
  const baseClient = new Client({ intents: [ GatewayIntentBits.Guilds ] }) as BotClient;
  baseClient.commands = new Collection();
  global.client = baseClient;
  global.rest = new REST().setToken(env.DISCORD_BOT_TOKEN);
  commands.map(c => global.client.commands.set(c.data.name, c));

  global.client.once(
    Events.ClientReady,
    async botClient => deployCommands().then(() => logger.info(`Ready! Logged in as ${botClient.user?.tag}`)),
  );
  global.client.on(Events.Debug, m => logger.debug(m));
  global.client.on(Events.Warn, m => logger.warn(m));
  global.client.on(Events.Error, m => logger.error(m));

  global.client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand() || interaction.isAutocomplete()) {
      const command = global.client.commands.get(interaction.commandName);
      if (!command) {
        return logger.error(`No command matching ${interaction.commandName} was found.`);
      }
      if (interaction.isChatInputCommand()) {
        try {
          await command.execute(interaction);
        } catch (error) {
          logger.error(error);
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
              content: "There was an error while executing this command!",
              ephemeral: true
            });
          } else {
            await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
          }
        }
      } else if (interaction.isAutocomplete()) {
        try {
          await command.autocomplete(interaction);
        } catch (error) {
          logger.error(error);
        }
      }

    }

  });

  global.client.login(env.DISCORD_BOT_TOKEN);
};
