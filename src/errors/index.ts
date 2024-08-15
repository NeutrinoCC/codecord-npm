export default class ApiError {
  private static messages: Record<string, string> = {
    default: "An error ocurred.",
    notFound: "Couldn't found a destination for this URL.",
    nameInvalid: `[ctx] is not valid.`,
    accessError: `Unexpected error occurred while accessing "[ctx]"`,
    fileNotFound: `The file or directory at "[ctx]" was not found.`,
    permissionDenied: `Permission denied for accessing "[ctx]".`,
    collectorError: `An error ocurred while starting collector for [ctx].`,
    modalInputError: `Not enough inputs to create modal.`,
    noTextChannel: `[ctx] no es un canal de texto.`,
    notSnowflake: `[ctx] no es una id válida.`,
  };

  private static getMessage(errorType: string, ctx?: string) {
    let message = this.messages[errorType] || this.messages.default;

    if (message && ctx) message = message.replace("[ctx]", ctx);

    return message;
  }

  static throw(errorType: string, ctx?: string): never {
    throw new Error(`Error: ${this.getMessage(errorType, ctx)}`);
  }

  static log(errorType: string, ctx?: string): void {
    console.error(`Log: ${this.getMessage(errorType, ctx)}`);
  }
}
