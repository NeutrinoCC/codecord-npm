import { SlashCommandBuilder, Events, Collection } from "discord.js";
import { CommandFunction, EventFunction, InteractionFunction } from "./types";
import { containsUppercaseSymbolsOrSpaces } from "./validator";

/**
 * @example
 * new Command()
 *  .setName("example")
 *  .setDescription("This is an example command")
 *  .setExecution((command) => {
 *
 *  });
 */
export class Command extends SlashCommandBuilder {
  execute?: CommandFunction;

  setExecution(execute: CommandFunction) {
    this.execute = execute;
    return this;
  }
}

/**
 * @example
 * new Interaction()
 *  .setName("example")
 *  .setExecution((interaction) => {
 *    await interaction.reply("Thank you for pressing the button!")
 *  });
 */
export class APIInteraction {
  name: string;
  execute: InteractionFunction;

  constructor(name: string, execute: InteractionFunction) {
    if (containsUppercaseSymbolsOrSpaces(name))
      throw new Error("Expected a string primitive.");

    this.name = name;
    this.execute = execute;
  }
}

/**
 * @example
 * const { Events } = require("discord.js");
 *
 * new Event(Events.ClientReady, (client) => {
 *  console.log("Hello world!")
 * });
 */
export class Event {
  name: Events;
  execute: EventFunction;

  constructor(event: Events, execute: EventFunction) {
    this.name = event;
    this.execute = execute;
  }
}

// collection properties
declare module "discord.js" {
  export interface Client {
    commands: Collection<string, Command>;
    interactions: Collection<string, InteractionFunction>;
  }
}
