import fs from "fs";
import { access, isDirectory } from "../../functions/files";
import path from "path";
import { clientConfig } from "./config";
import {
  Client as DJSClient,
  Guild,
  REST,
  Routes,
  SnowflakeUtil,
} from "discord.js";
import { isCommand, isEvent, isInteraction } from "./validator";
import { ApiError } from "../../errors";
import { APIError } from "../../errors/types";

export default class Client {
  app: DJSClient;

  constructor() {
    this.app = new DJSClient(clientConfig);
  }

  readModule(modulePath: string) {
    if (!isDirectory(modulePath)) return;

    const module = fs.readdirSync(modulePath);

    for (const folder of module) {
      const folderPath = path.join(modulePath, folder);

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

      const command = require(filePath);

      if (!isCommand(command)) continue;

      this.app.commands.set(command.data.name, command);
    }
  }

  readInteractions(folderPath: string) {
    const files = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".js"))
      .map((fileName) => path.join(folderPath, fileName));

    for (const filePath of files) {
      if (!access(filePath)) continue;

      const interaction = require(filePath);

      if (!isInteraction(interaction)) continue;

      const interactionName = path.basename(filePath, ".js");

      this.app.interactions.set(interactionName, interaction);
    }
  }

  readEvents(folderPath: string) {
    const files = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".js"))
      .map((fileName) => path.join(folderPath, fileName));

    for (const filePath of files) {
      if (!access(filePath)) continue;

      const event = require(filePath);

      if (!isEvent(event)) continue;

      const eventName = path.basename(filePath, ".js");

      this.app.interactions.set(eventName, event);
    }
  }

  async login(token: string) {
    this.app.login(token);
  }

  async registerCommands(token: string, guild?: Guild) {
    const base64Id = token.split(".")[0];

    if (!base64Id) throw new Error("No base64 client id could be parsed.");

    const clientId = Buffer.from(base64Id, "base64").toString("ascii");

    const Rest: REST = new REST().setToken(token);
    const parsedCommands = this.app.commands.map((cmd) => cmd.data.toJSON());

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
