import {
  ChatInputCommandInteraction,
  Collection,
  MessageComponentInteraction,
} from "discord.js";
import { Command, APIInteraction as Interaction, Event } from "./responses";

export type CommandFunction = (
  cmd: ChatInputCommandInteraction
) => any | Promise<any>;

export type InteractionFunction = (
  cmd: MessageComponentInteraction
) => any | Promise<any>;

export type EventFunction = (context: any) => any | Promise<any>;

export interface ClientCommands {
  cache: Collection<string, Command>;
  add: Command;
}

export interface ClientEvents {
  cache: Collection<string, Event>;
  add: Event;
}

export interface ClientInteractions {
  cache: Collection<string, Interaction>;
  add: Interaction;
}
