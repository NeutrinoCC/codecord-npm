import mongoose, { SchemaDefinition } from "mongoose";

class DB {
  private name: string;
  model;

  constructor(name: string, schemaDefinition: SchemaDefinition) {
    const schema = new mongoose.Schema(schemaDefinition);

    const model = mongoose.model(name, schema);

    this.model = model;
    this.name = name;
  }

  async get(data: object | string) {
    try {
      if (typeof data === "string")
        return await this.model.findOne({
          _id: data,
        });
      else
        return await this.model.find({
          _id: data,
        });
    } catch (error) {
      console.error(`MONGO GET ERROR IN ${this.name}:`, error);
      throw error;
    }
  }

  // Create or update (upsert) a document
  async set(_id: string, data: Object) {
    if (!this.model.validate(data)) return;

    try {
      await this.model
        .findOneAndUpdate(
          { _id },
          { $set: data },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          }
        )
        .exec();
    } catch (error) {
      console.error(`MONGO SET ERROR IN ${this.name}:`, error);
      throw error; // Propagate error
    }
  }
}

export class MongoManager {
  static connection = mongoose.Connection;

  /**
   * Conectar con tu base de datos
   * @param uri
   */
  static connect(uri: string) {
    mongoose.connect(uri);
  }

  /**
   * Crear base de datos
   */
  static DB = DB;
}
