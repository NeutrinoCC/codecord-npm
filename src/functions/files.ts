import fs from "fs";
import { ApiError } from "../errors";
import { APIError } from "../errors/types";

export function access(path: string) {
  try {
    fs.accessSync(path);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      switch (error.name) {
        case "ENOENT":
          new ApiError(APIError.fileNotFound, error, path);
          break;
        case "EACCES":
          new ApiError(APIError.permissionDenied, error, path);
          break;
        default:
          new ApiError(APIError.accessError, error, path);
          break;
      }
    }
  }
}

export function isDirectory(path: string) {
  if (!access(path)) return false;

  const stats = fs.statSync(path);

  return stats.isDirectory();
}
