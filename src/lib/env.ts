import { z } from "zod";

export const env = {
  DISCORD_BOT_TOKEN: z.string().min(60).parse(process.env.DISCORD_BOT_TOKEN),
  DISCORD_CLIENT_ID: z.string().min(19).max(19).regex(/[0-9]+/).parse(process.env.DISCORD_CLIENT_ID),
};
