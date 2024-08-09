import { EmbedBuilder, Guild } from "discord.js";
import { Portrait } from "../portrait";
import { CoordinateReference } from "../portrait/types";

const { getColorFromURL } = require("color-thief-node");

export class Branding {
  guild: Guild;

  constructor(guild: Guild) {
    this.guild = guild;
  }

  async getColor() {
    const icon = this.guild.iconURL({ extension: "png" });

    if (!icon) {
      const blurple = "#5865F2";

      return {
        pattern: Number(`0x${blurple.slice(1)}`),
        hex: blurple,
      };
    }

    const rgbArr: [number, number, number] = await getColorFromURL(icon);

    const hex = rgbArr.reduce((acc, val) => {
      const hexVal = val.toString(16).padStart(2, "0");
      return acc + hexVal;
    }, "#");

    return {
      pattern: Number(`0x${hex.slice(1)}`),
      hex: hex.toUpperCase(),
    };
  }

  async embedBuilder(options?: { thumbnail: boolean }) {
    const color = await this.getColor();

    const embed = new EmbedBuilder()
      .setAuthor({
        iconURL: this.guild.iconURL() || undefined,
        name: this.guild.name,
      })
      .setColor(color.pattern)
      .setImage("attachment://guild-banner.png");

    if (options?.thumbnail) embed.setThumbnail(this.guild.iconURL());

    return embed;
  }

  async generatePortrait() {
    const color = await this.getColor();

    const portrait = new Portrait(1200, 300);

    // draw background
    const banner = this.guild.bannerURL({ extension: "png" });

    if (banner) {
      await portrait.drawImage({
        imageURL: banner,
        x: CoordinateReference["1/2"],
        y: CoordinateReference["1/2"],
        size: 1,
        centered: true,
        shadow: 15,
        frame: 5,
      });
    }

    const icon = this.guild.iconURL({ extension: "png" });

    if (icon) {
      await portrait.drawImage({
        imageURL: icon,
        borderWidth: 5,
        borderColor: color.hex || "#FFFFFF",
        x: CoordinateReference["1/2"],
        y: CoordinateReference["1/3"],
        size: 1,
        centered: true,
        shadow: 15,
        frame: 5,
      });
    }

    await portrait.writeText({
      text: this.guild.name,
      font: "sans-serif",
      x: CoordinateReference["1/2"],
      y: (portrait.canvas.height * 5) / 6,
      size: 80,
      centered: true,
      shadow: 15,
      color: "#FFFFFF",
    });

    return portrait.createAttachment("guild-banner.png");
  }
}
