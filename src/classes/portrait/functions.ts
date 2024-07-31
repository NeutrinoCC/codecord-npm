import { CoordinateReference } from "./types";

export function calculateCoordinateReference(
  reference: CoordinateReference,
  segment: number
) {
  const [a, b] = reference.split("/").map(Number);

  return (segment * a) / b;
}
