import convert, { type MeasuresByUnit, type Unit } from "convert";
import {
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  type SlashCommandNumberOption,
  type SlashCommandStringOption,
  type SlashCommandSubcommandBuilder,
} from "discord.js";
import { capitalize } from "src/utils/discord";
import { logger } from "../../../lib/logger";
import { newEmbed } from "../../embeds/common";
import { type Measurement, unitTypesMap } from "./data";

export const convertOption = (option: SlashCommandStringOption, direction: "from" | "to", measurement: Measurement) =>
  option
    .setName(direction)
    .setDescription(`The unit you want to convert ${direction}`)
    .setRequired(direction === "from")
    .setAutocomplete(true);

export const convertInput = (option: SlashCommandNumberOption, name: string) =>
  option
    .setName(name)
    .setDescription(`The ${name} you want to convert`)
    .setRequired(true);

export const convertSubCommand = (
  subcommand: SlashCommandSubcommandBuilder, measurement: Measurement, unit: string = "quantity") =>
  subcommand
    .setName(measurement)
    .setDescription(`Convert a given ${unit} into another unit`)
    .addNumberOption(option => convertInput(option, unit))
    .addStringOption(option => convertOption(option, "from", measurement))
    .addStringOption(option => convertOption(option, "to", measurement));

const conversionMap: Record<Measurement, string> = {
  angle: "degrees",
  area: "quantity",
  data: "quantity",
  energy: "quantity",
  force: "quantity",
  length: "length",
  mass: "quantity",
  power: "quantity",
  pressure: "quantity",
  temperature: "quantity",
  time: "duration",
  volume: "quantity",
} as const;

const data = new SlashCommandBuilder()
  .setName("convert")
  .setDescription("Convert units from one type to another");

Object.entries(conversionMap).map(([ name, unit ]) =>
  data.addSubcommand(subcommand => convertSubCommand(subcommand, name as Measurement, unit)));

const execute = async (interaction: ChatInputCommandInteraction) => {
  const measurement = interaction.options.getSubcommand() as Measurement;
  const quantity = interaction.options.getNumber(conversionMap[measurement], true);
  const from = interaction.options.getString("from", true) as Unit;
  const to = interaction.options.getString("to");
  logger.debug("command input:", measurement, quantity, from, to);
  const converter = convert(quantity, from);
  const result = to ? converter.to(to as MeasuresByUnit<Unit>) : converter.to("best");
  logger.debug("converted:", to);
  const embed = newEmbed(`${capitalize(measurement)} Conversion`)
    .setDescription(`${quantity}${from} -> ${to ? `${result}${to}` : `${result.toString()}`}`);
  await interaction.reply({ embeds: [ embed ] });
  // ephemeral: !interaction.options.getBoolean("public"),
};

const autocomplete = async (interaction: AutocompleteInteraction) => {
  const measurement = interaction.options.getSubcommand() as Measurement;
  const focusedValue = interaction.options.getFocused();
  const choices = unitTypesMap[measurement].filter(choice => choice.startsWith(focusedValue)).slice(0, 25);
  return interaction.respond(choices.map(choice => (
    { name: choice, value: choice }
  )));
};
export default { data, execute, autocomplete };
