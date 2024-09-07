import {
  Events,
  Collection,
  SlashCommandBuilder,
  SlashCommandAttachmentOption,
  SlashCommandBooleanOption,
  SlashCommandChannelOption,
  SlashCommandIntegerOption,
  SlashCommandMentionableOption,
  SlashCommandNumberOption,
  SlashCommandRoleOption,
  SlashCommandStringOption,
  SlashCommandUserOption,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
  LocaleString,
  LocalizationMap,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Permissions,
  RestOrArray,
} from "discord.js";
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
export class Command {
  execute?: CommandFunction;
  data: SlashCommandBuilder;

  constructor() {
    this.data = new SlashCommandBuilder();
  }

  // Proxy methods for SlashCommandBuilder
  setName(name: string) {
    this.data.setName(name);
    return this; // Allows for chaining
  }

  setDescription(description: string) {
    this.data.setDescription(description);
    return this;
  }

  addAttachmentOption(
    input:
      | SlashCommandAttachmentOption
      | ((
          builder: SlashCommandAttachmentOption
        ) => SlashCommandAttachmentOption)
  ) {
    this.data.addAttachmentOption(input);
    return this;
  }

  addBooleanOption(
    input:
      | SlashCommandBooleanOption
      | ((builder: SlashCommandBooleanOption) => SlashCommandBooleanOption)
  ) {
    this.data.addBooleanOption(input);
    return this;
  }

  addChannelOption(
    input:
      | SlashCommandChannelOption
      | ((builder: SlashCommandChannelOption) => SlashCommandChannelOption)
  ) {
    this.data.addChannelOption(input);
    return this;
  }

  addIntegerOption(
    input:
      | SlashCommandIntegerOption
      | ((builder: SlashCommandIntegerOption) => SlashCommandIntegerOption)
  ) {
    this.data.addIntegerOption(input);
    return this;
  }

  addMentionableOption(
    input:
      | SlashCommandMentionableOption
      | ((
          builder: SlashCommandMentionableOption
        ) => SlashCommandMentionableOption)
  ) {
    this.data.addMentionableOption(input);
    return this;
  }

  addNumberOption(
    input:
      | SlashCommandNumberOption
      | ((builder: SlashCommandNumberOption) => SlashCommandNumberOption)
  ) {
    this.data.addNumberOption(input);
    return this; // Allows for chaining
  }

  addRoleOption(
    input:
      | SlashCommandRoleOption
      | ((builder: SlashCommandRoleOption) => SlashCommandRoleOption)
  ) {
    this.data.addRoleOption(input);
    return this;
  }

  addStringOption(
    input:
      | SlashCommandStringOption
      | ((builder: SlashCommandStringOption) => SlashCommandStringOption)
  ) {
    this.data.addStringOption(input);
    return this;
  }

  addSubcommand(
    input:
      | SlashCommandSubcommandBuilder
      | ((
          subcommand: SlashCommandSubcommandBuilder
        ) => SlashCommandSubcommandBuilder)
  ) {
    this.data.addSubcommand(input);
    return this;
  }

  addSubcommandGroup(
    input:
      | SlashCommandSubcommandGroupBuilder
      | ((
          subcommandGroup: SlashCommandSubcommandGroupBuilder
        ) => SlashCommandSubcommandGroupBuilder)
  ) {
    this.data.addSubcommandGroup(input);
    return this;
  }

  addUserOption(
    input:
      | SlashCommandUserOption
      | ((builder: SlashCommandUserOption) => SlashCommandUserOption)
  ) {
    this.data.addUserOption(input);
    return this;
  }

  setDescriptionLocalization(
    locale: LocaleString,
    localizedDescription: string | null
  ) {
    this.data.setDescriptionLocalization(locale, localizedDescription);
    return this;
  }

  setDescriptionLocalizations(localizedDescriptions: LocalizationMap | null) {
    this.data.setDescriptionLocalizations(localizedDescriptions);
    return this;
  }

  setDMPermission(enabled: boolean | null | undefined) {
    this.data.setDMPermission(enabled);
    return this;
  }

  setNameLocalization(locale: LocaleString, localizedName: string | null) {
    this.data.setNameLocalization(locale, localizedName);
    return this;
  }

  setNameLocalizations(localizedNames: LocalizationMap | null) {
    this.data.setNameLocalizations(localizedNames);
    return this;
  }

  setNSFW(nsfw?: boolean) {
    this.data.setNSFW(nsfw);
    return this;
  }

  setDefaultMemberPermissions(
    permissions: Permissions | bigint | number | null | undefined
  ) {
    this.data.setDefaultMemberPermissions(permissions);
    return this;
  }

  toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody {
    return this.data.toJSON();
  }

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
