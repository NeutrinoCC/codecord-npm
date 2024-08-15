import { access } from "../../functions/files";

import fs from "fs";

const filePath = `./config.ini`;

/**
 * Creates the config.ini file if it doesn't exist.
 */
function create(): void {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "", "utf-8");
  }
}

/**

   * Reads the config.ini file and returns its contents as a string.

   * @returns The contents of the config.ini file.

   */
function readIniFile(): string {
  create();

  return fs.readFileSync(filePath, "utf8");
}

export class Ini {
  /**

   * Retrieves the value of a specific key from the config.ini file.

   * @param query The key to retrieve the value for.

   * @returns The value associated with the key, or null if not found.

   */

  static get(query: string): string | null {
    const fileContent = readIniFile();

    const regex = new RegExp(`^${query}=([^\\s]+)`, "m");

    const match = fileContent.match(regex);

    if (!match) return null;

    const value = match?.[1]?.trim() || null;

    return value;
  }

  static parseGet(query: string): any {
    const value = this.get(query);

    if (value === "true" || value === "1") return true;

    if (value === "false" || value === "0") return false;

    if (!isNaN(Number(value))) return Number(value);

    if (value === "null") return null;

    if (value === "infinity") return Infinity;

    return value;
  }

  /**

   * Sets the value of a specific key in the config.ini file.

   * @param set An object containing key-value pairs to set.

   */

  static set(set: { [key: string]: any }): void {
    const fileContent = readIniFile();

    const lines = fileContent.split("\n");

    Object.keys(set).forEach((key) => {
      const regex = new RegExp(`^${key}=([^\\s]+)`, "m");

      const index = lines.findIndex((line) => regex.test(line));

      if (index !== -1) {
        lines[index] = `${key}=${set[key]}`;
      } else {
        lines.push(`${key}=${set[key]}`);
      }
    });

    fs.writeFileSync(filePath, lines.join("\n"));
  }
}
