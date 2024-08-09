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
  SlashCommandBuilder,
} from "discord.js";
import { ApiError } from "../../errors";
import { APIError } from "../../errors/types";
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
      const folderPath = path.join(absoluteModulePath, folder);

      if (!isDirectory(folderPath)) continue;

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
    const files = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".js"))
      .map((fileName) => path.join(folderPath, fileName));

    for (const filePath of files) {
      if (!access(filePath)) continue;

      let command = require(filePath);

      if (command.default) command = command.default;

      if (command instanceof Command)
        this.app.commands.set(command.name, command);
      else
        console.log(
          `${filePath} command needs to use Command class to be readed.`
        );
    }
  }

  readInteractions(folderPath: string) {
    const files = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".js"))
      .map((fileName) => path.join(folderPath, fileName));

    for (const filePath of files) {
      if (!access(filePath)) continue;

      let interaction = require(filePath);

      if (interaction?.default) interaction = interaction.default;

      if (interaction instanceof Interaction)
        this.app.interactions.set(interaction.name, interaction.execute);
    }
  }

  readEvents(folderPath: string) {
    const files = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".js"))
      .map((fileName) => path.join(folderPath, fileName));

    for (const filePath of files) {
      if (!access(filePath)) continue;

      let event = require(filePath);

      if (event?.default) event = event.default;

      if (event instanceof Event && event.name in Events) {
        this.app.on(String(event.name), event.execute);
      }
    }
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

  async registerCommands(token: string, guild?: Guild) {
    const base64Id = token.split(".")[0];

    if (!base64Id) throw new Error("No base64 client id could be parsed.");

    const clientId = Buffer.from(base64Id, "base64").toString("ascii");

    const Rest: REST = new REST().setToken(token);
    const parsedCommands = this.app.commands.map((command) => {
      const newObj: any = Object.assign({}, command.toJSON());

      delete newObj["execute"];

      return newObj;
    });

    let i = 1;
    setInterval(() => {
      i++;
    }, 1000);

    // Registering the parsed commands
    const routes = guild
      ? Routes.applicationGuildCommands(clientId, guild.id)
      : Routes.applicationCommands(clientId);
    await Rest.put(routes, {
      body: parsedCommands,
    });

    console.log(
      `[Client] Registered ${parsedCommands.length} {/} in ${i} second${
        i > 1 ? "s" : ""
      }.`
    );

    // set an interaction handler to start listening commands
    this.app.on(Events.InteractionCreate, this.interactionHandler);
  }

  async fetchGuild(guildId: string) {
    try {
      SnowflakeUtil.decode(guildId);

      const guild = await this.app.guilds.fetch(guildId).catch(() => null);

      if (!guild) return;

      return guild;
    } catch (error) {
      if (error instanceof Error)
        new ApiError(APIError.notSnowflake, error, guildId).throw();
    }
  }
}
