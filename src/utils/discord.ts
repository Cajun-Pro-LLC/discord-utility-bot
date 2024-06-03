import { verifyKey } from "discord-interactions";
import type { Request, Response } from "express";

export const verifyDiscordRequest = (clientKey: string) =>
  (req: Request, res: Response, buf: Buffer, encoding: string) => {
    const signature = req.get("X-Signature-Ed25519") || "";
    const timestamp = req.get("X-Signature-Timestamp") || "";

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send("Bad request signature");
      throw new Error("Bad request signature");
    }
  };

export const discordRequest = async (endpoint: string, options: RequestInit = {}) => {
  // append endpoint to root API URL
  const url = "https://discord.com/api/v10/" + endpoint;
  // Stringify payloads
  if (options.body && typeof options.body !== "string") {
    options.body = JSON.stringify(options.body);
  }
  // Use node-fetch to make requests
  const response = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      "Content-Type": "application/json; charset=UTF-8",
      "User-Agent": "UtilityBot (https://github.com/cajun-pro-llc/discord-utility-bot, 1.0.0)",
    },
    ...options,
  });
  // throw API errors
  if (!response.ok) {
    const data = await response.json();
    console.log(response.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return response;
};

export const installGlobalCommands = async (appId: string, commands: string) => {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint:
    // https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await discordRequest(endpoint, { method: "PUT", body: commands });
  } catch (err) {
    console.error(err);
  }
};

// Simple method that returns a random emoji from list
export const getRandomEmoji = () => {
  const emojiList = [ "😭", "😄", "😌", "🤓", "😎", "😤", "🤖", "😶‍🌫️", "🌏", "📸", "💿", "👋", "🌊", "✨" ];
  return emojiList[Math.floor(Math.random() * emojiList.length)];
};

declare global {
  interface String {
    capitalize(): string;
  }
}
export const capitalize = (string: string) => string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();

type Choice = string | number;
export const makeChoices = <T extends Choice>(choices: T[]): { name: string, value: T }[] => choices.map(choice => (
  { name: String(choice), value: choice }
));

export const makeIntArray = (first: number, last: number) => [ ...Array(last - first + 1) ].map((_, i) => i + first);
