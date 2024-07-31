import { Partials } from "discord.js";

export const clientConfig = {
  intents: 3276799,
  partials: [
    Partials.Message,
    Partials.GuildMember,
    Partials.User,
    Partials.Channel,
  ],
};
