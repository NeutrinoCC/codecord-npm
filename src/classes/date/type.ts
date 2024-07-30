export type FormatKey = "yyyy" | "mm" | "dd" | "hh" | "ii" | "ss";

export const isFormatKey = (key: string): key is FormatKey => true;
