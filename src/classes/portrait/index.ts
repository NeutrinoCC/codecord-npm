import { AttachmentBuilder, ThreadMemberFlagsBitField } from "discord.js";
import { calculateCoordinateReference } from "./functions";
import {
  PortraitConstructor,
  ImageOptions,
  TextOptions,
  LineOptions,
  FillOptions,
} from "./types";
import { createCanvas, loadImage } from "@napi-rs/canvas";

export class Portrait {
  canvas;
  ctx;

  constructor(width: number, height: number) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    this.canvas = canvas;
    this.ctx = ctx;
  }

  roundRect(
    x: number,

    y: number,

    width: number,

    height: number,

    radius: number
  ) {
    this.ctx.beginPath();

    this.ctx.moveTo(x + radius, y);

    this.ctx.arcTo(x + width, y, x + width, y + radius, radius);

    this.ctx.arcTo(
      x + width,
      y + height,
      x + width - radius,
      y + height,
      radius
    );

    this.ctx.arcTo(x, y + height, x, y + height - radius, radius);

    this.ctx.arcTo(x, y, x + radius, y, radius);

    this.ctx.closePath();
  }

  async toBuffer() {
    return this.canvas.toBuffer("image/png");
  }

  async createAttachment(name: string) {
    const buffer = this.canvas.toBuffer("image/png");

    return new AttachmentBuilder(buffer, {
      name,
    });
  }

  /**
   * Resets canvas to blank
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  async drawImage({
    imageURL,
    x,
    y,
    width,
    height,
    align,
    justify,
    shadow,
    borderWidth,
    borderColor = "#FFFFFF",
    frame,
  }: ImageOptions) {
    // Load the image

    const image = await loadImage(imageURL);

    // calculate image proportions
    if (!width) width = image.width;
    if (!height) height = image.height;

    if (!x) x = 0;
    if (!y) y = 0;

    // Calculate the x and y coordinates
    if (align === "center") y += this.canvas.height / 2 - height / 2;
    else if (align === "bottom") y += this.canvas.height - height;

    if (justify === "center") x += this.canvas.width / 2 - width / 2;
    else if (justify === "right") x += this.canvas.width - width;

    // Draw the image
    if (frame === 0 || frame === undefined) {
      // shadow
      if (shadow) {
        this.ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
        this.ctx.shadowBlur = shadow;
        this.ctx.shadowOffsetX = 5;
        this.ctx.shadowOffsetY = 5;
      }

      // Draw the border
      if (borderWidth) {
        // Draw the shadow
        this.ctx.fillStyle = borderColor;

        this.ctx.fillRect(
          x - borderWidth,
          y - borderWidth,
          width + borderWidth * 2,
          height + borderWidth * 2
        );

        // if there is border, then we delete the shadow for the image
        this.ctx.shadowColor = "transparent";
      }

      this.ctx.drawImage(image, x, y, width, height);
    } else {
      // Draw the shadow
      if (shadow) {
        this.ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        this.ctx.shadowBlur = shadow;
        this.ctx.shadowOffsetX = 5;
        this.ctx.shadowOffsetY = 5;
      }

      // Draw the border
      if (borderWidth) {
        this.ctx.save();

        const curveRadius = Math.min(width, height) * (frame / 100);

        this.roundRect(x, y, width, height, curveRadius);

        this.ctx.clip();

        this.ctx.fillStyle = borderColor;

        this.ctx.stroke();

        this.ctx.fillRect(x, y, width, height);

        this.ctx.restore();

        width -= borderWidth * 2;
        height -= borderWidth * 2;
        x += borderWidth;
        y += borderWidth;
      }

      // Create a rounded rectangle

      this.ctx.save();

      this.ctx.beginPath();

      // Curve radius as a percentage of the image size
      const curveRadius = Math.min(width, height) * (frame / 100);

      this.roundRect(x, y, width, height, curveRadius);

      this.ctx.arc(
        x + width / 2,
        y + height / 2,
        Math.min(width, height) / 2,
        0,
        Math.PI * 2
      );

      this.ctx.clip();

      // Draw the image

      this.ctx.drawImage(image, x, y, width, height);

      this.ctx.restore();
    }

    return this;
  }

  async writeText({
    text,
    font,
    size,
    color = "black",
    x,
    y,
    centered,
    shadow,
  }: TextOptions) {
    // Set the font

    this.ctx.font = `${size}px ${font}`;

    // Set the text color

    this.ctx.fillStyle = color;

    // Calculate the x and y coordinates

    let coord_x: number;

    let coord_y: number;

    coord_x =
      typeof x !== "number"
        ? calculateCoordinateReference(x, this.canvas.width)
        : x;

    coord_y =
      typeof y !== "number"
        ? calculateCoordinateReference(y, this.canvas.height)
        : y;

    if (centered) {
      const textWidth = this.ctx.measureText(text).width;

      coord_x -= textWidth / 2;

      coord_y += size / 2;
    }

    if (shadow) {
      // rellenar contorno de la imagen
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.4)"; // sombreado del contorno
      this.ctx.shadowBlur = shadow;
    }

    // Draw the text
    this.ctx.fillText(text, coord_x, coord_y);

    return this;
  }

  async drawLine({
    width,
    x,
    y,
    w,
    h,
    color = "#000000",
    shadow,
  }: LineOptions) {
    // Calculate the x and y coordinates

    let coord_x: number;

    let coord_y: number;

    coord_x =
      typeof x !== "number"
        ? calculateCoordinateReference(x, this.canvas.width)
        : x;

    coord_y =
      typeof y !== "number"
        ? calculateCoordinateReference(y, this.canvas.height)
        : y;

    let coord_w: number;

    let coord_h: number;

    coord_w =
      typeof w !== "number"
        ? calculateCoordinateReference(w, this.canvas.width)
        : w;

    coord_h =
      typeof h !== "number"
        ? calculateCoordinateReference(h, this.canvas.height)
        : h;

    // Draw the shadow

    if (shadow) {
      this.ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";

      this.ctx.lineWidth = width;

      this.ctx.beginPath();

      this.ctx.moveTo(coord_x + shadow, coord_y + shadow);

      this.ctx.lineTo(coord_w + shadow, coord_h + shadow);

      this.ctx.stroke();
    }

    // Draw the line

    this.ctx.strokeStyle = color;

    this.ctx.lineWidth = width;

    this.ctx.beginPath();

    this.ctx.moveTo(coord_x, coord_y);

    this.ctx.lineTo(coord_w, coord_h);

    this.ctx.stroke();

    return this;
  }

  async fill(options: FillOptions) {
    const {
      x,

      y,

      w,

      h,

      color = "#000000", // default color is black
    } = options;

    // Calculate the x and y coordinates

    let coord_x: number;

    let coord_y: number;

    coord_x =
      typeof x !== "number"
        ? calculateCoordinateReference(x, this.canvas.width)
        : x;

    coord_y =
      typeof y !== "number"
        ? calculateCoordinateReference(y, this.canvas.height)
        : y;

    let coord_w: number;

    let coord_h: number;

    coord_w =
      typeof w !== "number"
        ? calculateCoordinateReference(w, this.canvas.width)
        : w;

    coord_h =
      typeof h !== "number"
        ? calculateCoordinateReference(h, this.canvas.height)
        : h;

    // Fill the rectangle

    this.ctx.fillStyle = color;

    this.ctx.fillRect(coord_x, coord_y, coord_w, coord_h);

    return this;
  }
}
