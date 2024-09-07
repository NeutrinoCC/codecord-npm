import { Collector } from "../collector";
import {
  BookConstructor,
  BookInteraction,
  Length,
  PageLength,
  Render,
} from "./types";

export class Book {
  // functions
  render: Render;
  length: Length;
  pageLength?: PageLength;

  // numbers
  page: number;
  paragraph: number;
  interaction: BookInteraction;
  collector: Collector;

  constructor({ render, length, pageLength, interaction }: BookConstructor) {
    this.render = render;
    this.length = length;
    this.pageLength = pageLength;
    this.page = 1;
    this.paragraph = 1;
    this.interaction = interaction;
    this.collector = new Collector(interaction);
  }

  // when new pages or elements vary on stage
  async fix() {
    const pages = (await this.length?.()) || 0;

    if (pages <= 0) this.page = 1;
    else if (this.page > pages) this.page = pages;

    if (this.pageLength) {
      const paragraphs = await this.pageLength();

      if (this.paragraph > paragraphs) this.paragraph = paragraphs;
      else if (this.paragraph <= 0) this.paragraph = 1;
    }
  }

  async write() {
    let render = await this.render?.();

    if (
      this.interaction &&
      (this.interaction.replied || this.interaction.deferred)
    )
      await this.interaction.editReply(render);
  }

  async next() {
    this.page++;

    const pages = (await this.length?.()) || 0;

    if (this.page > pages) this.page = 1;

    this.paragraph = 1;

    await this.write();
  }

  async previous() {
    this.page--;

    const pages = (await this.length?.()) || 0;

    if (this.page <= 0) this.page = pages;

    this.paragraph = 1;

    await this.write();
  }

  // change paragraph value
  async slide(n: number) {
    this.paragraph += n;

    if (!this.pageLength) return;

    const paragraphs = await this?.pageLength();

    if (this.paragraph <= 0) this.paragraph = paragraphs;
    else if (this.paragraph > paragraphs) this.paragraph = 1;

    await this.write();
  }

  setRender(render: Render) {
    this.render = render;

    return this;
  }

  setLength(length: Length) {
    this.length = length;

    return this;
  }

  setPageLength(pageLength: PageLength) {
    this.pageLength = pageLength;

    return this;
  }
}
