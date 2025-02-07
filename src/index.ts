import "dotenv/config";
import "./lib/state";
import { initializeBot } from "./bot";
import express from "express";
import { verifyDiscordRequest } from "./utils/discord";

const main = async () => {
  console.log("Starting Utility Bot...");
  initializeBot();
};

main()
//   .then(() => {
//   console.log("Stopping Utility Bot...");
//   process.exit(0);
// });
// // Create an express app
// const app = express();
// // Get port, or default to 3000
// const PORT = process.env.PORT || 9999;
// // Parse request body and verifies incoming requests using discord-interactions package
// app.use(express.json({ verify: verifyDiscordRequest(process.env.PUBLIC_KEY) }));
//
//
// /**
//  * Interactions endpoint URL where Discord will send HTTP requests
//  */
// app.post('/interactions', async (req, res) => {
//   // Interaction type and data
//   const { type, id, data } = req.body;
//
//   /**
//    * Handle verification requests
//    */
//   if (type === InteractionType.PING) {
//     return res.send({ type: InteractionResponseType.PONG });
//   }
//
//   /**
//    * Handle slash command requests
//    * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
//    */
//   if (type === InteractionType.APPLICATION_COMMAND) {
//     const { name } = data;
//
//     // "test" command
//     if (name === 'test') {
//       // Send a message into the channel where command was triggered from
//       return res.send({
//         type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
//         data: {
//           // Fetches a random emoji to send from a helper function
//           content: 'hello world ' + getRandomEmoji(),
//         },
//       });
//     }
//   }
// });
//
// app.listen(PORT, () => {
//   console.log('Listening on port', PORT);
// });
//
