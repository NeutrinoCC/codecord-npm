import { CoordinateReference } from "./types";

export function calculateCoordinateReference(
  reference: CoordinateReference,
  segment: number
) {
  const [a, b] = reference.split("/").map(Number);

  if (!a || !b) return 0;

  return (segment * a) / b;
}
