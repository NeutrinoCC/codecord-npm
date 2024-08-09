import { AttachmentBuilder, ThreadMemberFlagsBitField } from "discord.js";
import { calculateCoordinateReference } from "./functions";
import {
  PortraitConstructor,
  ImageOptions,
  TextOptions,
  LineOptions,
  FillOptions,
} from "./types";
import { createCanvas, loadImage } from "canvas";

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
    return this.canvas.toBuffer();
  }

  async createAttachment(name: string) {
    const buffer = this.canvas.toBuffer();

    return new AttachmentBuilder(buffer, {
      name,
    });
  }

  async drawImage({
    imageURL,
    size,
    x,
    y,
    centered,
    shadow,
    borderWidth,
    borderColor = "#FFFFFF",
    frame,
  }: ImageOptions) {
    // Load the image

    const image = await loadImage(imageURL);

    let imageWidth = image.width * size;
    let imageHeight = image.height * size;

    // Calculate the x and y coordinates

    let coord_x: number;
    let coord_y: number;

    coord_x =
      typeof x !== "number"
        ? (coord_x = calculateCoordinateReference(x, this.canvas.width))
        : x;

    coord_y =
      typeof y !== "number"
        ? (coord_y = calculateCoordinateReference(y, this.canvas.height))
        : y;

    if (centered) {
      coord_x -= imageWidth / 2;
      coord_y -= imageHeight / 2;
    }

    // Draw the image
    if (frame === 0 || frame === undefined) {
      // Draw the border
      if (borderWidth) {
        // Draw the shadow
        if (shadow) {
          this.ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
          this.ctx.shadowBlur = shadow;
          this.ctx.shadowOffsetX = 5;
          this.ctx.shadowOffsetY = 5;
        }

        this.ctx.fillStyle = borderColor;

        this.ctx.fillRect(
          coord_x - borderWidth,
          coord_y - borderWidth,
          imageWidth + borderWidth * 2,
          imageHeight + borderWidth * 2
        );
      }

      if (shadow && borderWidth) this.ctx.shadowColor = "transparent";

      this.ctx.drawImage(image, coord_x, coord_y, imageWidth, imageHeight);
    } else {
      this.ctx.save();

      // Draw the shadow
      if (shadow) {
        this.ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        this.ctx.shadowBlur = shadow;
        this.ctx.shadowOffsetX = 5;
        this.ctx.shadowOffsetY = 5;
      }

      // Draw the border

      if (borderWidth) {
        this.ctx.strokeStyle = borderColor;

        this.ctx.lineWidth = borderWidth;

        this.ctx.stroke();

        this.ctx.shadowColor = "transparent";
      }

      // Create a rounded rectangle

      this.ctx.beginPath();

      // Curve radius as a percentage of the image size

      const curveRadius = Math.min(imageWidth, imageHeight) * (frame / 100);

      this.roundRect(coord_x, coord_y, imageWidth, imageHeight, curveRadius);

      /*this.ctx.arc(
        coord_x + imageWidth / 2,
        coord_y + imageHeight / 2,
        Math.min(imageWidth, imageHeight) / 2,
        0,
        Math.PI * 2
      );*/

      this.ctx.clip();

      // Draw the image

      this.ctx.drawImage(image, coord_x, coord_y, imageWidth, imageHeight);

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

      coord_y -= size / 2;
    }

    console.log(coord_x, coord_y);

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
