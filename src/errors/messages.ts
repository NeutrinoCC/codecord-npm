import { APIError, ErrorMessage } from "./types";

type ErrorMessages = {
  [key in APIError]: ErrorMessage;
};

export const messages: ErrorMessages = {
  notFound: "Couldn't found a destination for this URL.",
  nameInvalid: (name: string) => `${name} is not valid.`,
  accessError: (path: string) =>
    `Unexpected error occurred while accessing "${path}"`,
  fileNotFound: (path: string) =>
    `The file or directory at "${path}" was not found.`,
  permissionDenied: (path: string) =>
    `Permission denied for accessing "${path}".`,
  collectorError: (customId: string) =>
    `An error ocurred while starting collector for ${customId}.`,
  modalInputError: `Not enough inputs to create modal.`,
  noTextChannel: (name: string) => `${name} no es un canal de texto.`,
};
