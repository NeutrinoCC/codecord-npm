export type ErrorMessage = string | ((ctx: any) => string);

export enum APIError {
  notFound = "notFound",
  nameInvalid = "nameInvalid",
  accessError = "accessError",
  fileNotFound = "fileNotFound",
  permissionDenied = "permissionDenied",
  collectorError = "collectorError",
  modalInputError = "modalInputError",
  noTextChannel = "noTextChannel",
}
