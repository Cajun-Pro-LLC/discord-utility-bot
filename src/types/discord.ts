import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Client,
  Collection,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

export type ExecuteHandler = (interaction: ChatInputCommandInteraction) => Promise<void>;
export type AutocompleteHandler = (interaction: AutocompleteInteraction) => Promise<void>;
export type SlashCommandData =
  SlashCommandSubcommandsOnlyBuilder
  | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

export type CommandFile = {
  data: SlashCommandData,
  execute: ExecuteHandler,
  autocomplete: AutocompleteHandler,
}

export type CommandsCollection = Collection<string, CommandFile>;

export type BotClient = Client & { commands: CommandsCollection };
