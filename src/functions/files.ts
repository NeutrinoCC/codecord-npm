import fs from "fs";
import ApiError from "../errors/index";

export function access(path: string) {
  try {
    fs.accessSync(path);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      switch (error.name) {
        case "ENOENT":
          ApiError.log("fileNotFound", path);
          break;
        case "EACCES":
          ApiError.log("accessDenied", path);
          break;
        default:
          ApiError.log("accessError", path);
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
