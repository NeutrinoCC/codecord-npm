import fs from "fs";
import { access, isDirectory } from "../../functions/files";
import path from "path";
import { clientConfig } from "./config";
import { Client as DJSClient } from "discord.js";
import { isCommand, isEvent, isInteraction } from "./validator";

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
}
