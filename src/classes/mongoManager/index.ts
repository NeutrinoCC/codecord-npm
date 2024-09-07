import mongoose, { ConnectOptions, SchemaDefinition } from "mongoose";

class DB {
  name: string;
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
      else return await this.model.find(data);
    } catch (error) {
      console.error(`MONGO GET ERROR IN ${this.name}:`, error);
      throw error;
    }
  }

  async create(data: any) {
    if (!this.model.validate(data)) return;

    const _id = mongoose.Types.ObjectId;

    try {
      if (!data._id) data._id = new _id();

      const entry = new this.model(data);

      await entry.save();

      return data._id;
    } catch (error) {
      console.error(`MONGO CREATE ERROR IN ${this.name}:`, error);
      throw error; // Propagate error
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

  // remove documents from collection
  async delete(id: string) {
    try {
      await this.model.findByIdAndDelete(id);
    } catch (error) {
      console.log(error);
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
