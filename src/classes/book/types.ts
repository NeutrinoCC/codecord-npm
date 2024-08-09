import {
  ChatInputCommandInteraction,
  MessageComponentInteraction,
  MessageEditOptions,
  MessagePayload,
  ModalSubmitInteraction,
} from "discord.js";

export type Render = () =>
  | Promise<MessagePayload | MessageEditOptions>
  | MessagePayload
  | MessageEditOptions;

export type Length = () => Promise<number> | number;

export type PageLength = () => Promise<number> | number;

export type BookInteraction =
  | ChatInputCommandInteraction
  | MessageComponentInteraction;

export interface BookConstructor {
  render: Render;
  length: Length;
  pageLength?: PageLength;
  interaction: BookInteraction;
}
