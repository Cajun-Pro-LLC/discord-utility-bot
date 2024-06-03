import { EmbedBuilder } from "discord.js";

export const newEmbed = (title: string) => new EmbedBuilder()
  .setColor("#ff0000")
  .setAuthor({
    name: "Utility Bot"
  })
  .setTitle(title)
  .setTimestamp()
  .setFooter({ text: "Built Out of Boredom by @DirtyCajunRice" });
