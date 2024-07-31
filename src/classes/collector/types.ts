import { MessageComponentInteraction } from "discord.js";

export type InteractionListener = (
  m: MessageComponentInteraction
) => Promise<any>;

export type InteractionListenersObject = {
  [key: string]: InteractionListener;
};
