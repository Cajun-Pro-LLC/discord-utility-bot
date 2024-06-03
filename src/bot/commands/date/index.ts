import { type AutocompleteInteraction, type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { makeChoices, makeIntArray } from "../../../utils/discord";
import { newEmbed } from "../../embeds/common";
import { timezones } from "./data";

const data = new SlashCommandBuilder()
  .setName("date")
  .setDescription("DateTime helpers")
  .addSubcommandGroup(subcommandGroup =>
    subcommandGroup
      .setName("timestamp")
      .setDescription("Generate a discord timestamp")
      .addSubcommand(subcommand =>
        subcommand
          .setName("new")
          .setDescription("Create a new timestamp from inputs")
          .addIntegerOption(option =>
            option
              .setName("year")
              .setDescription("The year")
              .setMinValue(1970)
              .setMaxValue(2100)
              .setRequired(true)
              .setAutocomplete(true),
          )
          .addIntegerOption(option =>
            option
              .setName("month")
              .setDescription("The month")
              .setMinValue(1)
              .setMaxValue(12)
              .setRequired(true)
              .addChoices(...makeChoices(makeIntArray(1, 12))),
          )
          .addIntegerOption(option =>
            option
              .setName("day")
              .setDescription("The day")
              .setMinValue(1)
              .setMaxValue(31)
              .setRequired(true)
              .setAutocomplete(true),
          )
          .addIntegerOption(option =>
            option
              .setName("hour")
              .setDescription("The hour in 24 hour format")
              .setMinValue(0)
              .setMaxValue(23)
              .setRequired(true)
              .addChoices(...makeChoices(makeIntArray(0, 23))),
          )
          .addIntegerOption(option =>
            option
              .setName("minute")
              .setDescription("The minute")
              .setMinValue(0)
              .setMaxValue(59)
              .setRequired(true)
              .setAutocomplete(true),
          )
          .addIntegerOption(option =>
            option
              .setName("second")
              .setDescription("The second")
              .setMinValue(0)
              .setMaxValue(59)
              .setRequired(true)
              .setAutocomplete(true),
          )
          .addStringOption(option =>
            option
              .setName("timezone")
              .setDescription("The timezone in short format")
              .setAutocomplete(true),
          ),
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName("parse")
          .setDescription("Create a timestamp from a Date compatible string")
          .addStringOption(option =>
            option
              .setName("date")
              .setDescription("The DateTime string")
              .setRequired(true),
          ),
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName("now")
          .setDescription("Create a timestamp for now"),
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName("in")
          .setDescription("Create a new timestamp for x time from now")
          .addIntegerOption(option => option.setName("years").setDescription("The years"))
          .addIntegerOption(option => option.setName("months").setDescription("The months"))
          .addIntegerOption(option => option.setName("days").setDescription("The days"))
          .addIntegerOption(option => option.setName("hour").setDescription("The hours"))
          .addIntegerOption(option => option.setName("minutes").setDescription("The minutes"))
          .addIntegerOption(option => option.setName("seconds").setDescription("The seconds")),
      ),
  );

const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand();
  switch (subcommand) {
    case "new": {
      const year = interaction.options.getInteger("year", true);
      const month = interaction.options.getInteger("month", true);
      const day = interaction.options.getInteger("day", true);
      const hour = interaction.options.getInteger("hour", true);
      const minute = interaction.options.getInteger("minute", true);
      const second = interaction.options.getInteger("second", true);
      const timezone = interaction.options.getString("timezone") || "UTC";
      const input = `${year}/${month}/${day} ${hour}:${minute}:${second} ${timezone}`;
      const timestamp = Math.floor(Date.parse(`${month} ${day} ${year} ${hour}:${minute}:${second} ${timezone}`)
        / 1000);
      const discordTimestamp = `<t:${timestamp}:R>`;
      const embed = newEmbed(`Timestamp Creator`)
        .setDescription(`Input: ${input}\nTimestamp:\`${discordTimestamp}\`\nPreview:${discordTimestamp}`);
      await interaction.reply({ embeds: [ embed ] });
      break;
    }
    case "parse": {
      const input = interaction.options.getString("date", true);
      const date = new Date(input);
      const discordTimestamp = `<t:${date.valueOf()}:R>`;
      const embed = newEmbed(`Timestamp Parser`)
        .setDescription(`Input: ${input}\nTimestamp:\`${discordTimestamp}\`\nPreview:${discordTimestamp}`);
      await interaction.reply({ embeds: [ embed ] });
      break;
    }
    case "now": {
      const discordTimestamp = `<t:${Math.floor(Date.now() / 1000)}:R>`;
      const embed = newEmbed(`Timestamp Creator`)
        .setDescription(`Timestamp:\`${discordTimestamp}\`\nPreview:${discordTimestamp}`);
      await interaction.reply({ embeds: [ embed ] });
      break;
    }
    case "in": {
      let timestamp = Math.floor(Date.now() / 1000);
      const years = interaction.options.getInteger("years") || 0;
      const months = interaction.options.getInteger("months") || 0;
      const days = interaction.options.getInteger("days") || 0;
      const hours = interaction.options.getInteger("hours") || 0;
      const minutes = interaction.options.getInteger("minutes") || 0;
      const seconds = interaction.options.getInteger("seconds") || 0;

      timestamp += seconds;
      timestamp += minutes * 60;
      timestamp += hours * 3600;
      timestamp += days * 86400;
      timestamp += months * 2592000;
      timestamp += years * 31536000;

      const input = `+ ${years}:${months}:${days} ${hours}:${minutes}:${seconds}`;

      const discordTimestamp = `<t:${timestamp}:R>`;
      const embed = newEmbed(`Timestamp Creator`)
        .setDescription(`Input: ${input}\nTimestamp:\`${discordTimestamp}\`\nPreview:${discordTimestamp}`);
      await interaction.reply({ embeds: [ embed ] });
      break;
    }
  }
};

const autocomplete = async (interaction: AutocompleteInteraction) => {
  const focused = interaction.options.getFocused(true);
  const choices = [];
  switch (focused.name) {
    case "year": {
      choices.push(...makeChoices(makeIntArray(1970, 2100).filter(n => n.toString().startsWith(focused.value))));
      break;
    }
    case "day": {
      choices.push(...makeChoices(makeIntArray(1, 31).filter(n => n.toString().startsWith(focused.value))));
      break;
    }
    case "minute":
    case "second": {
      choices.push(...makeChoices(makeIntArray(0, 59).filter(n => n.toString().startsWith(focused.value))));
      break;
    }
    case "timezone": {
      choices.push(...makeChoices(timezones.filter(tz => tz.startsWith(focused.value))));
      break;
    }
  }
  return interaction.respond(choices.slice(0, 25));
};

export default { data, execute, autocomplete };
