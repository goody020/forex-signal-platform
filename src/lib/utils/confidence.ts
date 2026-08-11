export function confidenceFromLabel(label: string): number {
  if (label === "STRONG_SETUP") return 9;
  if (label === "VALID_SETUP") return 8;
  return 6;
}