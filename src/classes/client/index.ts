import fs from "fs";
import { access, isDirectory } from "../../functions/files";
import path from "path";
import { clientConfig } from "./config";
import {
  Collection,
  Client as DJSClient,
  Events,
  Guild,
  REST,
  Routes,
  Interaction as DjsInteraction,
  SnowflakeUtil,
} from "discord.js";
import ApiError from "../../errors/index";
import { Command, Event, APIInteraction as Interaction } from "./responses";
import { InteractionFunction } from "./types";

export default class Client {
  app: DJSClient;

  constructor() {
    const app = new DJSClient(clientConfig);

    app.commands = new Collection<string, Command>();
    app.interactions = new Collection<string, InteractionFunction>();

    this.app = app;
  }

  readModule(modulePath: string) {
    const absoluteModulePath = path.join(process.cwd(), modulePath);

    if (!isDirectory(absoluteModulePath)) return;

    const module = fs.readdirSync(absoluteModulePath);

    for (const folder of module) {
      const folderPath = path.join(modulePath, folder);
      const absoluteFolderPath = path.join(absoluteModulePath, folder);

      if (!isDirectory(absoluteFolderPath)) continue;

      switch (folder) {
        case "commands":
          this.readCommands(folderPath);
          break;
        case "interactions":
          this.readInteractions(folderPath);

          break;
        case "events":
          this.readEvents(folderPath);
          break;
      }
    }
  }

  readCommands(folderPath: string) {
    const absoluteFolderPath = path.join(process.cwd(), folderPath);

    const files = fs
      .readdirSync(absoluteFolderPath)
      .filter((file) => file.endsWith(".js"))
      .map((fileName) => path.join(absoluteFolderPath, fileName));

    for (const filePath of files) {
      if (!access(filePath)) continue;

      let command = require(filePath);

      if (command.default) command = command.default;

      if (command instanceof Command)
        this.app.commands.set(command.data.name, command);
      else
        console.log(
          `${filePath} command needs to use Command class to be readed.`
        );
    }

    return this;
  }

  readInteractions(folderPath: string) {
    const absoluteFolderPath = path.join(process.cwd(), folderPath);

    const files = fs
      .readdirSync(absoluteFolderPath)
      .filter((file) => file.endsWith(".js"))
      .map((fileName) => path.join(absoluteFolderPath, fileName));

    for (const filePath of files) {
      if (!access(filePath)) continue;

      let interaction = require(filePath);

      if (interaction?.default) interaction = interaction.default;

      if (interaction instanceof Interaction)
        this.app.interactions.set(interaction.name, interaction.execute);
    }

    return this;
  }

  readEvents(folderPath: string) {
    const absoluteFolderPath = path.join(process.cwd(), folderPath);

    const files = fs
      .readdirSync(absoluteFolderPath)
      .filter((file) => file.endsWith(".js"))
      .map((fileName) => path.join(absoluteFolderPath, fileName));

    for (const filePath of files) {
      if (!access(filePath)) continue;

      let event = require(filePath);

      if (event?.default) event = event.default;

      if (
        event instanceof Event &&
        Object.values(Events).includes(event.name)
      ) {
        this.app.on(String(event.name), event.execute);
      } else console.log(`[ err ] ${event.name} is not a valid event.`);
    }

    return this;
  }

  /**
   * Interaction event, executes when user interacts
   * @param {Interaction} interaction
   * @void
   */
  private async interactionHandler(interaction: DjsInteraction) {
    const { client: c } = interaction;

    if (interaction.isChatInputCommand()) {
      // Command interaction
      const command = c.commands.get(interaction.commandName) as
        | { execute: (interaction: any) => void }
        | undefined;

      if (!command) return;

      if (command.execute) {
        command.execute(interaction);

        console.log(
          `[command] ${interaction.user.username} used /${interaction.commandName}`
        );
      } else {
        console.error("Command does not have an execute method");
      }
    } else if (interaction.isMessageComponent()) {
      const execute = c.interactions.get(interaction.customId);

      if (!execute) return;

      execute(interaction);

      console.log(
        `[interaction] ${interaction.user.username} used >${interaction.customId}`
      );
    }
  }

  async login(token: string) {
    await this.app.login(token);
  }

  async eraseGuildCommands(token: string, guildId: string) {
    const base64Id = token.split(".")[0];

    if (!base64Id) throw new Error("No base64 client id could be parsed.");

    const clientId = Buffer.from(base64Id, "base64").toString("ascii");

    const rest = new REST().setToken(token);

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: [],
    });
  }

  async registerCommands(token: string, guildId?: string) {
    const base64Id = token.split(".")[0];

    if (!base64Id) throw new Error("No base64 client id could be parsed.");

    const clientId = Buffer.from(base64Id, "base64").toString("ascii");

    const Rest: REST = new REST().setToken(token);

    const parsedCommands = this.app.commands.map((command) =>
      command.data.toJSON()
    );

    // Registering the parsed commands
    const routes = guildId
      ? Routes.applicationGuildCommands(clientId, guildId)
      : Routes.applicationCommands(clientId);
    await Rest.put(routes, {
      body: parsedCommands,
    });

    // set an interaction handler to start listening commands
    this.app.on(Events.InteractionCreate, this.interactionHandler);
  }
}
