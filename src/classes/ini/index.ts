import fs from "fs";
import path from "path";
import ini, { parse } from "ini";
import { ConfigOptions } from "./types";

const iniFileName = "config.ini";
const iniFilePath = path.join(process.cwd(), iniFileName);

// config.ini file manager
export class Ini {
  /**
   * Creates a .ini config file
   */
  private static createConfigFile() {
    // tests if the file exists
    if (fs.existsSync(iniFilePath)) return;

    // creates a new file
    fs.writeFileSync(iniFilePath, "", "utf-8");
  }

  /**
   * Returns configuration into an object structure
   */
  private static readIniFile() {
    if (!fs.existsSync(iniFilePath)) this.createConfigFile();

    return fs.readFileSync(iniFilePath, "utf8");
  }

  /**
   * Loads the configuration to enviroment variables
   * @param options
   */
  static config(options?: ConfigOptions) {
    try {
      // Read the .ini file
      const content = this.readIniFile();

      // parse the .ini data
      const obj = ini.parse(content);

      // set environment variables
      for (const [key, value] of Object.entries(obj)) {
        // Optionally handle sections if needed
        if (typeof value === "object" && value !== null) {
          if (options?.noSectionProperties) continue;

          for (const [k, v] of Object.entries(value)) {
            if (typeof v === "string") {
              // Set environment variable
              process.env[k] = v;
            }
          }
        } else process.env[key] = value;
      }
    } catch (error) {
      console.error("Error loading the configuration:", error);
    }
  }

  /**
   * Get an specific property of the configuration
   * @param key
   * @returns
   */
  static get(query?: string): any {
    const content = this.readIniFile();

    let result: any = ini.parse(content);

    if (!query) return result;

    const keys = query.split(".");

    let i = keys.length;

    for (let key of keys) {
      i--;

      let match = result[key];

      if (i !== 0 && !match) {
        result = null;
        break;
      }

      result = match;
    }

    return result;
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
   * Sets the value of new keys to the config file
   * @param set Keys to add to the config file
   * @example Ini.set({
   *  token: "MY_TOKEN",
   *  guild: "GUILD_ID",
   *  tickets: {
   *    mentions: true
   *    }
   * });
   */
  static set(set: { [key: string]: any }): void {
    try {
      const content = this.readIniFile();

      const parsedContent = ini.parse(content);

      for (const [key, value] of Object.entries(set)) {
        // If value is a nested object
        if (typeof value === "object" && value !== null) {
          // Check for existing section or create a new one
          let section = parsedContent[key];

          if (!section || typeof section === "string") parsedContent[key] = {};

          for (const [k, v] of Object.entries(value)) {
            parsedContent[key][k] = v;
          }
        } else parsedContent[key] = value;
      }

      const updatedContent = ini.stringify(parsedContent);
      fs.writeFileSync(iniFilePath, updatedContent, "utf8");
    } catch (error) {
      console.error("Error updating the configuration:", error);
    }
  }
}
