import {
  ChatInputCommandInteraction,
  Collection,
  MessageComponentInteraction,
  SlashCommandBuilder,
} from "discord.js";

export type Command = {
  data: SlashCommandBuilder;
  execute: (i: ChatInputCommandInteraction) => Promise<any>;
};

export type APIinteraction = (i: MessageComponentInteraction) => Promise<any>;

// collection properties
declare module "discord.js" {
  export interface Client {
    commands: Collection<string, Command>;
    interactions: Collection<string, APIinteraction>;
    events: Collection<string, Event>;
  }
}

// context depends on the event, as client for "ready" or guild for 'guildMemberAdd' event.
export type Event = (context: any) => Promise<any>;

export interface ClientCommands {
  cache: Collection<string, Command>;
  add: Command;
}

export interface ClientEvents {
  cache: Collection<string, Event>;
  add: Event;
}

export interface ClientInteractions {
  cache: Collection<string, APIinteraction>;
  add: APIinteraction;
}
