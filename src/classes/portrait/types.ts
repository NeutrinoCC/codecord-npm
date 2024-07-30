export interface PortraitConstructor {
  width: number;
  height: number;
}

export enum CoordinateReference {
  "1/2" = "1/2",
  "1/3" = "1/3",
  "1/4" = "1/4",
  "2/3" = "2/3",
  "3/4" = "3/4",
}

export interface ImageOptions {
  borderWidth?: number;
  borderColor?: string;
  frame?: number;
  imageURL: string;
  size: number;
  x: number | CoordinateReference;
  y: number | CoordinateReference;
  centered?: boolean;
  shadow?: number;
}

export interface TextOptions {
  text: string;
  font: string;
  size: number;
  color?: string;
  x: number | CoordinateReference;
  y: number | CoordinateReference;
  centered?: boolean;
  shadow?: number;
}

export interface LineOptions {
  width: number;
  x: number | CoordinateReference;
  y: number | CoordinateReference;
  w: number | CoordinateReference;
  h: number | CoordinateReference;
  shadow?: number;
  color?: string;
}

export interface FillOptions {
  x: number | CoordinateReference;
  y: number | CoordinateReference;
  w: number | CoordinateReference;
  h: number | CoordinateReference;
  color?: string;
}
