import { messages } from "./messages";
import { APIError } from "./types";

export class ApiError {
  message: string;
  code: number;
  error?: Error;

  constructor(type: APIError, error?: Error, ctx?: any) {
    this.message =
      typeof messages[type] === "function"
        ? messages[type](ctx)
        : messages[type];

    this.code = Object.keys(messages).indexOf(type);

    if (error) this.error = error;
  }

  throw() {
    throw new Error(`[Error #${this.code}] ${this.message}`);
  }

  log() {
    console.error(
      `[Error #${this.code}] ${this.message}\n${
        this.error ? `\n${this.error.stack || this.error}\n` : ""
      }`
    );

    return APIError;
  }
}
