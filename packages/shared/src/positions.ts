import { generateKeyBetween } from "fractional-indexing";

/**
 * Ordering uses fractional index keys: strings that sort between their neighbours.
 * Moving a card writes one row instead of renumbering the whole list.
 * Keys compare byte-wise, so the database column uses COLLATE "C" to match.
 */
export function positionBetween(before: string | null, after: string | null): string {
  if (before !== null && after !== null && before >= after) {
    throw new RangeError(`Invalid neighbours: "${before}" must sort before "${after}"`);
  }
  return generateKeyBetween(before, after);
}

export function comparePositions(a: { position: string }, b: { position: string }): number {
  if (a.position < b.position) return -1;
  if (a.position > b.position) return 1;
  return 0;
}
