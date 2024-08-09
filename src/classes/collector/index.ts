import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  Message,
  MessageComponentInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
} from "discord.js";
import { InteractionListenersObject, InteractionListener } from "./types";
import { ApiError } from "../../errors";
import { APIError } from "../../errors/types";

export class Collector {
  interaction: ChatInputCommandInteraction | MessageComponentInteraction;

  constructor(
    interaction: ChatInputCommandInteraction | MessageComponentInteraction
  ) {
    this.interaction = interaction;
  }

  async listen(
    listeners: InteractionListenersObject,
    timeoutMiliseconds?: number
  ) {
    if (!this.interaction.channel)
      return new ApiError(APIError.collectorError).throw();

    let reply = await this.interaction.fetchReply().catch(() => null);

    if (!reply)
      reply = await this.interaction
        .reply({
          content: "Cargando...",
          ephemeral: true,
          fetchReply: true,
        })
        .catch(() => null);

    if (!reply)
      return new ApiError(
        APIError.collectorError,
        undefined,
        this.interaction.isCommand()
          ? this.interaction.commandName
          : this.interaction.customId
      ).throw();

    const filter = (i: MessageComponentInteraction) =>
      reply.id === i.message.id && this.interaction.user.id === i.user.id;

    const collector = this.interaction.channel.createMessageComponentCollector({
      time: timeoutMiliseconds || 15 * 60 * 60 * 1000,
      filter,
    });

    collector.on("collect", async (i: MessageComponentInteraction) => {
      const listener: InteractionListener | undefined = listeners[i.customId];

      if (!listener) return;

      await listener(i);

      if (listeners.default) await listeners.default(i);
    });

    collector.once("end", async () => {
      collector.stop();

      if (this.interaction.replied)
        await this.interaction.editReply({ components: [] }).catch((e) => null);
    });

    return collector;
  }

  async awaitMessage(
    listener: (message: Message) => Promise<any>,
    timeoutMiliseconds?: number
  ) {
    if (!this.interaction.channel)
      return new ApiError(APIError.collectorError).throw();

    let reply = await this.interaction.fetchReply().catch(() => null);

    if (!reply)
      reply = await this.interaction
        .reply({
          content: "Cargando...",
          ephemeral: true,
          fetchReply: true,
        })
        .catch(() => null);

    if (!reply)
      return new ApiError(
        APIError.collectorError,
        undefined,
        this.interaction.isCommand()
          ? this.interaction.commandName
          : this.interaction.customId
      ).throw();

    const filter = (message: Message) =>
      this.interaction.user.id === message.author.id;

    const collector = this.interaction.channel.createMessageCollector({
      time: timeoutMiliseconds || 15 * 60 * 60 * 1000,
      filter,
      maxProcessed: 1,
    });

    collector.on("collect", listener);

    collector.once("end", async () => {
      collector.stop();
    });

    return collector;
  }

  async submission(
    subInteraction: MessageComponentInteraction | ChatInputCommandInteraction,
    options: {
      timeMiliseconds?: number;
      title?: string;
      inputs: TextInputBuilder[];
    }
  ) {
    const { timeMiliseconds, title, inputs } = options;

    const custom_id = `submission:${subInteraction.id}`;

    const modal = new ModalBuilder({
      title: title || "Rellena el formulario",
      custom_id,
    });

    if (inputs.length < 1) return new ApiError(APIError.modalInputError);

    for (const input of inputs) {
      const row = new ActionRowBuilder<TextInputBuilder>().addComponents(input);

      modal.addComponents(row);
    }

    const filter = (submission: ModalSubmitInteraction) => {
      if (
        subInteraction.isMessageComponent() &&
        (!submission.message ||
          submission.message.id !== subInteraction.message.id)
      )
        return false;

      return (
        submission.user.id === subInteraction.user.id &&
        submission.customId === custom_id
      );
    };

    await subInteraction.showModal(modal);

    const submission = await subInteraction
      .awaitModalSubmit({
        time: timeMiliseconds || 5 * 60 * 1000,
        filter,
      })
      .catch(() => {
        return null;
      });

    if (!submission) return undefined;

    console.log(
      `\t${subInteraction.user.username} submitted ${title || "a modal"}.`
    );

    const values = new Map<string, string>();

    submission.fields.components.forEach((row) => {
      const data = row.components[0];

      if (!data) return;

      values.set(data.customId, data.value);
    });

    return { response: submission, values };
  }
}
