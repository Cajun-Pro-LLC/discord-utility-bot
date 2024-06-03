// noinspection ES6ConvertVarToLetConst

import type { REST } from "discord.js";
import type { BotClient } from "../types/discord";

// noinspection JSUnusedGlobalSymbols,JSClassNamingConvention
export interface global {
}

declare global {
  var client: BotClient;
  var rest: REST;
}
