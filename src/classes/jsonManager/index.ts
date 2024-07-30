import { access } from "../../functions/files";
import fsPromises from "fs/promises";
import fs from "fs";

export class JsonManager {
  filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;

    this._writeJsonFile({});
  }

  private _writeJsonFile(data: any) {
    //if (!access(this.filePath)) throw new Error();

    if (!data) return;

    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  private async _readJsonFile() {
    if (!access(this.filePath)) throw new Error();

    const fileData = await fsPromises.readFile(this.filePath, "utf8");
    const content: any = JSON.parse(fileData);

    return content;
  }

  async get(query?: string) {
    const data = await this._readJsonFile();

    if (!query) return data;

    const keys = query.split(".");

    let current = data;

    // Traverse the object to find each key
    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        throw new Error(`[DB] Query doesn't exist on file: ${query}`);
      }
    }

    return current;
  }

  async push(query: string, value: any) {
    const data = await this._readJsonFile();

    const keys = query.split(".");

    let current = data;

    // Traverse the object to find the array to push to

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      if (i === keys.length - 1) {
        // Check if the property exists and is an array

        if (!current[key] || !Array.isArray(current[key])) {
          throw new Error(
            `[DB] Property '${key}' is not an array at '${query}'`
          );
        }

        current[key].push(value);
      } else {
        // If the key doesn't exist, create a new object

        if (!current[key] || typeof current[key] !== "object") {
          throw new Error(`[DB] Query doesn't exist on file: ${query}`);
        }

        // Move to the next nested object

        current = current[key];
      }
    }

    this._writeJsonFile(data);
  }

  async set(query: string, value: any) {
    let data = await this._readJsonFile();

    const keys = query.split(".");
    let current = data;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      // If we're at the last key, set the value
      if (i === keys.length - 1) {
        current[key] = value;
      } else {
        // If the key doesn't exist, create a new object
        if (!current[key] || typeof current[key] !== "object") {
          current[key] = {};
        }
        // Move to the next nested object
        current = current[key];
      }
    }

    this._writeJsonFile(data);
  }

  async delete(query: string) {
    let data = await this._readJsonFile();

    const keys = query.split(".");
    const lastKey = keys.pop(); // Get last key for deletion
    let current = data;

    if (!lastKey) return;

    // Traverse the object to find the last key's parent
    for (const key of keys) {
      if (current[key] && typeof current[key] === "object") {
        current = current[key];
      } else {
        throw new Error(`[DB] Query doesn't exist on file: ${query}`);
      }
    }

    // Delete the target property if it exists
    if (lastKey in current) {
      delete current[lastKey];
    } else {
      throw new Error(`[DB] Property '${lastKey}' doesn't exist at '${query}'`);
    }

    this._writeJsonFile(data);
  }

  has(query: string) {
    const jsonData = fs.readFileSync(this.filePath, "utf8");
    const data: { [key: string]: any } = JSON.parse(jsonData);

    const keys = query.split(".");
    let current = data;

    // Traverse the object to find each key
    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        return false; // Return false if any key doesn't exist
      }
    }

    return true; // Every key in the path exists
  }
}
