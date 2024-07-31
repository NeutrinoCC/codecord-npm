import {
  ChannelManager,
  ChannelType,
  Client,
  GuildChannel,
  Message,
} from "discord.js";
import { JsonManager } from "../jsonManager";
import { JsonFilePanelData } from "./types";
import { ApiError } from "../../errors";
import { APIError } from "../../errors/types";

const json = new JsonManager("./dist/classes/panel/data.json");

export class Panel {
  name;

  constructor(name: string) {
    this.name = name;
  }

  async fetch(channels: ChannelManager) {
    if (!json.has(this.name)) return;

    const { messageId, channelId }: JsonFilePanelData = await json.get(
      this.name
    );

    const channel = await channels.fetch(channelId).catch(() => null);

    if (!channel || channel.type !== ChannelType.GuildText)
      return await json.delete(this.name);

    let message = await channel.messages.fetch(messageId).catch(() => null);

    if (!message) {
      message = await channel.send({
        content: `**${this.name}**`,
      });

      await json.set(`${this.name}.messageId`, message.id);
    }

    return message;
  }

  async build(message: Message) {
    const { channel } = message;

    if (channel.type !== ChannelType.GuildText)
      return new ApiError(
        APIError.noTextChannel,
        undefined,
        channel.id
      ).throw();

    await json.set(this.name, {
      messageId: message.id,
      channelId: message.channel.id,
    });
  }
}

(async () => {
  const panel = new Panel("boosters");
})();
