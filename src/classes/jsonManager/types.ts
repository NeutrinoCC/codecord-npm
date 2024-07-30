export type dbType = "json" | "mongo" | "mysql";

export type dbConstructorOptions = {
  type: dbType;
  filePath: string;
};
